use std::{
    fs, io,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

pub use document_items::*;
use normalize_path::NormalizePath;
use path_slash::PathExt;
use serde_json::json;
use tauri::{self, Manager};
use tauri_plugin_store::StoreExt;
use walkdir::WalkDir;

use crate::{
    common::{self, ensure_dir},
    util::PathUtil,
};


mod document_items;
mod document_util;

pub enum AppDocumentStore {
    Metadata,
}

pub struct AppDocument {
    base_dir: PathBuf,
    snippets_dir: PathBuf,
    metadata_dir: PathBuf,
}
impl AppDocument {
    fn new(base_dir: PathBuf) -> tauri::Result<AppDocument> {
        let base_dir = base_dir.join("Snippy");
        ensure_dir(&base_dir)?;

        let metadata_dir = base_dir.join(".snippy");
        ensure_dir(&metadata_dir)?;

        let snippets_dir = base_dir.join("snippets");
        ensure_dir(&snippets_dir)?;

        Ok(AppDocument {
            base_dir,
            metadata_dir,
            snippets_dir,
        })
    }

    pub fn get_store(
        &self,
        app: &tauri::AppHandle,
        name: AppDocumentStore,
    ) -> io::Result<Arc<tauri_plugin_store::Store<tauri::Wry>>> {
        let store_path = match name {
            AppDocumentStore::Metadata => self.metadata_dir.join("metadata.json"),
        };
        let store = app.store(store_path).map_err(|e| match e {
            tauri_plugin_store::Error::Io(error) => error,
            other => io::Error::new(io::ErrorKind::Other, other.to_string()),
        })?;
        Ok(store)
    }

    pub fn get_all_folders(&self) -> Vec<FolderEntry> {
        let mut folders = vec![];
        for entry in WalkDir::new(&self.snippets_dir)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_dir() {
                let relative_path = entry.path().strip_prefix(&self.snippets_dir).unwrap();
                let name = relative_path
                    .file_name()
                    .and_then(|val| val.to_str())
                    .unwrap_or_default()
                    .to_owned();
                if !name.is_empty() {
                    folders.push(FolderEntry {
                        name,
                        path: relative_path.to_slash().unwrap_or_default().to_string(),
                    });
                }
            }
        }

        folders
    }

    pub fn get_flat_tree(&self, app: &tauri::AppHandle) -> io::Result<DocumentFlatTree> {
        let metadata_store = self.get_store(app, AppDocumentStore::Metadata)?;

        Ok(document_util::get_document_flat_tree(
            &self.snippets_dir,
            &metadata_store,
        ))
    }

    pub fn move_document_items(&self, items: Vec<(String, String)>) -> io::Result<Vec<String>> {
        let paths = filter_map_or_error(items, |item| -> io::Result<String> {
            let old_path = self.snippets_dir.safe_join(item.0)?;
            let new_path = self.snippets_dir.safe_join(item.1)?.gen_unique_filename()?;

            fs::rename(old_path, &new_path)?;

            Ok(new_path
                .strip_prefix(&self.snippets_dir)
                .unwrap()
                .to_slash()
                .unwrap()
                .to_string())
        })?;

        Ok(paths)
    }

    pub fn import_files<P: AsRef<Path>, Q: AsRef<Path>>(
        &self,
        app: &tauri::AppHandle,
        dir_path: P,
        paths: Vec<Q>,
    ) -> io::Result<Vec<SnippetDocCreated>> {
        let metadata_store = self.get_store(app, AppDocumentStore::Metadata)?;
        let Some(target_path) = dir_path.as_ref().try_normalize() else {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "Invalid folder path",
            ));
        };
        let snippets = filter_map_or_error(paths, |file_path| -> io::Result<SnippetDocCreated> {
            let file_name = file_path
                .as_ref()
                .file_name()
                .and_then(|val| val.to_str())
                .unwrap_or_default();
            let file_content = fs::read_to_string(&file_path)?;
            let snippet = self.create_snippet(
                SnippetDoc {
                    stored: None,
                    metadata: None,
                    contents: file_content,
                    path: target_path.join(file_name).to_str().unwrap().to_string(),
                },
                &metadata_store,
            )?;

            Ok(snippet)
        })?;

        Ok(snippets)
    }

    fn create_snippet(
        &self,
        snippet: SnippetDoc,
        metadata_store: &common::TauriStore,
    ) -> io::Result<SnippetDocCreated> {
        let file_path = &self
            .snippets_dir
            .safe_join(snippet.path)?
            .gen_unique_filename()?;
        fs::write(file_path, &snippet.contents)?;

        let file_path = file_path
            .strip_prefix(&self.snippets_dir)
            .unwrap()
            .to_path_buf();
        let file_path_str = file_path
            .to_slash()
            .map(|val| val.to_string())
            .unwrap_or_default();

        if let Some(metadata) = &snippet.stored {
            metadata_store.set(&file_path_str, json!(metadata));
        }

        Ok(SnippetDocCreated {
            path: file_path_str,
            stored: snippet.stored,
            metadata: snippet.metadata,
            ext: file_path
                .extension()
                .and_then(|val| val.to_str())
                .unwrap_or_default()
                .to_owned(),
            name: file_path
                .file_name()
                .and_then(|val| val.to_str())
                .unwrap_or_default()
                .to_owned(),
        })
    }

    pub fn create_snippets(
        &self,
        app: &tauri::AppHandle,
        snippets: Vec<SnippetDoc>,
    ) -> io::Result<Vec<SnippetDocCreated>> {
        let metadata_store = self.get_store(app, AppDocumentStore::Metadata)?;
        let snippets = filter_map_or_error(snippets, |snippet| {
            self.create_snippet(snippet, &metadata_store)
        })?;

        Ok(snippets)
    }

    pub fn create_folders(&self, folders: Vec<FolderDoc>) -> io::Result<Vec<FolderDocCreated>> {
        let folders = filter_map_or_error(folders, |folder| -> io::Result<FolderDocCreated> {
            let folder_path = &self
                .snippets_dir
                .safe_join(&folder.path)?
                .gen_unique_filename()?;
            fs::create_dir_all(folder_path)?;

            let folder_path = folder_path
                .strip_prefix(&self.snippets_dir)
                .unwrap()
                .to_path_buf();
            Ok(FolderDocCreated {
                metadata: folder.metadata,
                path: folder_path
                    .to_slash()
                    .map(|v| v.to_string())
                    .unwrap_or_default()
                    .to_owned(),
                name: folder_path
                    .file_name()
                    .and_then(|val| val.to_str())
                    .unwrap_or_default()
                    .to_owned(),
            })
        })?;

        Ok(folders)
    }

    pub fn rename_item<P: AsRef<Path>, Q: AsRef<Path>>(
        &self,
        old_path: P,
        new_path: Q,
    ) -> io::Result<Q> {
        let old_path = self.snippets_dir.safe_join(old_path.as_ref())?;
        let new_path_buf = self.snippets_dir.safe_join(new_path.as_ref())?;

        if fs::exists(&new_path_buf)? {
            Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                "A file with the same name already exists",
            ))
        } else {
            fs::rename(old_path, &new_path_buf)?;
            Ok(new_path)
        }
    }

    pub fn remove_items<P: AsRef<Path>>(&self, paths: Vec<P>, to_trash: bool) -> io::Result<()> {
        if to_trash {
            let paths: io::Result<Vec<PathBuf>> = paths
                .iter()
                .map(|path| self.snippets_dir.safe_join(path))
                .collect();
            trash::delete_all(paths?)
                .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()))?;
        } else {
            filter_map_or_error(paths, |path| -> io::Result<()> {
                let path = self.snippets_dir.safe_join(path)?;
                if fs::metadata(&path)?.is_file() {
                    fs::remove_file(path)?;
                } else {
                    fs::remove_dir_all(path)?;
                }

                Ok(())
            })?;
        }

        Ok(())
    }

    pub fn search(&self, search_term: &str) -> anyhow::Result<Vec<SearchItemEntry>> {
        document_util::search_document(&self.snippets_dir, search_term)
    }

    pub fn get_snippet_content<P: AsRef<Path>>(&self, path: P) -> io::Result<String> {
        let path = self.snippets_dir.safe_join(path)?;
        if let Ok(false) = fs::exists(&path) {
            return Err(io::Error::new(io::ErrorKind::NotFound, "File not found"));
        }

        fs::read_to_string(path).map_err(|error| match error.kind() {
            io::ErrorKind::InvalidData => {
                io::Error::new(io::ErrorKind::InvalidData, "not-text-file")
            }
            _ => error,
        })
    }

    pub fn get_snippet_placeholders<P: AsRef<Path>>(
        &self,
        path: P,
    ) -> anyhow::Result<Vec<SnippetPlaceholderItem>> {
        let content = self.get_snippet_content(path)?;

        let regex = regex::Regex::new(r"\[\[(\w+)\]\]")?;
        Ok(regex
            .find_iter(&content)
            .map(|entry| SnippetPlaceholderItem {
                end: entry.end(),
                start: entry.start(),
                name: entry.as_str().to_owned(),
            })
            .collect())
    }

    pub fn get_base_dir(&self) -> &PathBuf {
        &self.base_dir
    }
    pub fn get_metadata_dir(&self) -> &PathBuf {
        &self.metadata_dir
    }
    pub fn get_snippets_dir(&self) -> &PathBuf {
        &self.snippets_dir
    }
}

fn filter_map_or_error<T, B, R, E>(items: Vec<T>, mut cb: B) -> Result<Vec<R>, E>
where
    B: FnMut(T) -> Result<R, E>,
{
    let mut error: Option<E> = None;
    let result: Vec<R> = items
        .into_iter()
        .filter_map(|item| match cb(item) {
            Ok(value) => Some(value),
            Err(err) => {
                error = Some(err);
                None
            }
        })
        .collect();

    if error.is_some() && result.is_empty() {
        Err(error.unwrap())
    } else {
        Ok(result)
    }
}

pub fn init_app_document(app: &tauri::App) -> tauri::Result<()> {
    let app_document = AppDocument::new(app.path().document_dir()?)?;
    app.manage(Mutex::new(app_document));

    Ok(())
}
