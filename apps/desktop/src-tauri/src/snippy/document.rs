use std::{
    collections::HashMap,
    fs, io,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::UNIX_EPOCH,
};

pub use document_items::*;
use normalize_path::NormalizePath;
use path_slash::PathExt;
use serde::{ser::SerializeStruct, Serialize};
use serde_json::json;
use tauri::{self, Manager};
use tauri_plugin_store::StoreExt;
use walkdir::WalkDir;

use crate::{
    common::{self, ensure_dir},
    util::PathUtil,
};

pub type DocumentFlatTree = HashMap<String, Vec<DocumentFlatTreeItem>>;

mod document_indexer;
mod document_items;

pub use document_indexer::DocumentIndexer;

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

        let mut flat_tree: DocumentFlatTree = HashMap::new();
        flat_tree.insert(String::from("__root"), vec![]);

        for entry in WalkDir::new(&self.snippets_dir)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let metadata = entry.metadata()?;
            let relative_path = entry.path().strip_prefix(&self.snippets_dir).unwrap();
            let stored_metadata: Option<SnippetStoredMetadata> = match metadata_store
                .get(relative_path.to_slash().unwrap_or_default().to_string())
            {
                Some(value) => serde_json::from_value(value)?,
                None => None,
            };

            let name = relative_path
                .file_name()
                .and_then(|val| val.to_str())
                .unwrap_or_default()
                .to_owned();
            let is_dir = metadata.is_dir();
            if name.is_empty() || (name == "__root" && is_dir) {
                continue;
            }

            let item_key = relative_path.to_slash().unwrap_or_default().to_string();
            let parent_key = match relative_path.parent().and_then(|val| val.to_slash()) {
                Some(parent) if !parent.is_empty() => parent.to_string(),
                _ => String::from("__root"),
            };
            let mtime = match metadata.modified() {
                Ok(time) => time
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis(),
                Err(_) => 0,
            };
            let ext = if metadata.is_file() {
                relative_path
                    .extension()
                    .and_then(|val| val.to_str())
                    .unwrap_or_default()
                    .to_owned()
            } else {
                String::new()
            };

            let tree_item = DocumentFlatTreeItem {
                ext,
                name,
                mtime,
                is_dir,
                path: item_key.clone(),
                metadata: stored_metadata,
            };
            match flat_tree.get_mut(&parent_key) {
                Some(value) => {
                    (*value).push(tree_item);
                }
                None => {
                    flat_tree.insert(parent_key, vec![tree_item]);
                }
            };
        }

        Ok(flat_tree)
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
        fs::write(&file_path, &snippet.contents)?;

        let file_path = file_path
            .strip_prefix(&self.snippets_dir)
            .unwrap()
            .to_path_buf();
        let file_path_str = file_path
            .to_slash()
            .and_then(|val| Some(val.to_string()))
            .unwrap_or_default();

        if let Some(metadata) = &snippet.stored {
            metadata_store.set(&file_path_str, json!(metadata));
        }

        Ok(SnippetDocCreated {
            path: file_path_str,
            stored: snippet.stored,
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
            fs::create_dir_all(&folder_path)?;

            let folder_path = folder_path
                .strip_prefix(&self.snippets_dir)
                .unwrap()
                .to_path_buf();
            Ok(FolderDocCreated {
                path: folder_path
                    .to_slash()
                    .and_then(|v| Some(v.to_string()))
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
        let new_path_buf = self.snippets_dir.safe_join(&new_path.as_ref())?;

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

pub struct DocumentFlatTreeItem {
    mtime: u128,
    ext: String,
    path: String,
    is_dir: bool,
    name: String,
    metadata: Option<SnippetStoredMetadata>,
}
impl Serialize for DocumentFlatTreeItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_struct("DocumentTreeItemMetadata", 3)?;
        s.serialize_field("ext", &self.ext)?;
        s.serialize_field("path", &self.path)?;
        s.serialize_field("isDir", &self.is_dir)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("mtime", &self.mtime)?;
        s.serialize_field("isDir", &self.is_dir)?;
        s.serialize_field("metadata", &self.metadata)?;
        s.end()
    }
}

pub fn init_app_document(app: &tauri::App) -> tauri::Result<()> {
    let app_document = AppDocument::new(app.path().document_dir()?)?;
    app.manage(Mutex::new(app_document));

    Ok(())
}
