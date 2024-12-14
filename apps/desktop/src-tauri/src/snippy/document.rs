use std::{collections::HashMap, fs, io, path::PathBuf, sync::Mutex, time::UNIX_EPOCH};

use path_slash::PathExt;
use serde::{ser::SerializeStruct, Serialize};
use tauri::{self, Manager};
use walkdir::WalkDir;

use crate::{
    common::{self, ensure_dir},
    util::PathUtil,
};

mod document_indexer;

pub use document_indexer::DocumentIndexer;

pub struct DocumentState {
    base_dir: PathBuf,
    snippets_dir: PathBuf,
    metadata_dir: PathBuf,
}
impl DocumentState {
    fn new(app: &tauri::App) -> tauri::Result<DocumentState> {
        let base_dir = app.path().document_dir()?.join("Snippy");
        ensure_dir(&base_dir)?;

        let metadata_dir = base_dir.join(".snippy");
        ensure_dir(&metadata_dir)?;

        let snippets_dir = base_dir.join("snippets");
        ensure_dir(&snippets_dir)?;

        Ok(DocumentState {
            base_dir,
            metadata_dir,
            snippets_dir,
        })
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

pub struct DocumentTreeItemMetadata {
    mtime: u128,
    name: String,
    is_dir: bool,
}
impl Serialize for DocumentTreeItemMetadata {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_struct("DocumentTreeItemMetadata", 3)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("mtime", &self.mtime)?;
        s.serialize_field("isDir", &self.is_dir)?;
        s.end()
    }
}

pub struct DocumentFlatTreeItem {
    path: String,
    is_dir: bool,
}
impl Serialize for DocumentFlatTreeItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_struct("DocumentTreeItemMetadata", 3)?;
        s.serialize_field("path", &self.path)?;
        s.serialize_field("isDir", &self.is_dir)?;
        s.end()
    }
}

pub struct DocumentFlatTreeData {
    metadata: HashMap<String, DocumentTreeItemMetadata>,
    flat_tree: HashMap<String, Vec<DocumentFlatTreeItem>>,
}
impl DocumentFlatTreeData {
    fn new() -> Self {
        let mut flat_tree = HashMap::new();
        flat_tree.insert(Self::root_key(), vec![]);

        Self {
            flat_tree,
            metadata: HashMap::new(),
        }
    }

    fn root_key() -> String {
        String::from("__root")
    }

    fn insert_tree_item(&mut self, path: &std::path::Path, metadata: &std::fs::Metadata) {
        let name = path
            .file_name()
            .and_then(|val| val.to_str())
            .unwrap_or_default()
            .to_owned();
        let is_dir = metadata.is_dir();
        if name.is_empty() || (name == "__root" && is_dir) {
            return;
        }

        let item_key = path.to_slash().unwrap_or_default().to_string();
        let parent_key = match path.parent().and_then(|val| val.to_slash()) {
            Some(parent) if !parent.is_empty() => parent.to_string(),
            _ => Self::root_key(),
        };
        let tree_item = DocumentFlatTreeItem {
            is_dir,
            path: if is_dir {
                item_key.clone()
            } else {
                name.clone()
            },
        };
        match self.flat_tree.get_mut(&parent_key) {
            Some(value) => {
                (*value).push(tree_item);
            }
            None => {
                self.flat_tree.insert(parent_key, vec![tree_item]);
            }
        };

        let mtime = match metadata.modified() {
            Ok(time) => time
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis(),
            Err(_) => 0,
        };
        self.metadata.insert(
            item_key,
            DocumentTreeItemMetadata {
                name,
                mtime,
                is_dir,
            },
        );
    }
}
impl Serialize for DocumentFlatTreeData {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut s = serializer.serialize_struct("DocumentFlatTreeData", 2)?;
        s.serialize_field("metadata", &self.metadata)?;
        s.serialize_field("flatTree", &self.flat_tree)?;
        s.end()
    }
}

pub fn get_document_flat_tree(app: &tauri::AppHandle) -> io::Result<DocumentFlatTreeData> {
    let document_state = app.state::<Mutex<DocumentState>>();
    let document_state = document_state.lock().unwrap();
    let snippets_dir = document_state.get_snippets_dir();

    let mut tree_data = DocumentFlatTreeData::new();
    for entry in WalkDir::new(snippets_dir)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let relative_path = entry.path().strip_prefix(snippets_dir).unwrap();
        tree_data.insert_tree_item(relative_path, &entry.metadata()?);
    }

    Ok(tree_data)
}

pub fn move_document_items(
    app: &tauri::AppHandle,
    items: Vec<(String, String)>,
) -> io::Result<Vec<String>> {
    let document_state = app.state::<Mutex<DocumentState>>();
    let document_state = document_state.lock().unwrap();
    let snippets_dir = document_state.get_snippets_dir();

    let mut paths = vec![];

    for item in items {
        let old_path = snippets_dir.safe_join(item.0)?;
        let mut new_path = snippets_dir.safe_join(item.1)?;
        let new_path = common::gen_unique_filename(snippets_dir, &mut new_path)?;

        fs::rename(old_path, &new_path)?;

        paths.push(new_path.to_str().unwrap_or_default().to_owned());
    }

    Ok(paths)
}

pub fn init_app_document(app: &tauri::App) -> tauri::Result<()> {
    let document_state = DocumentState::new(&app)?;
    app.manage(Mutex::new(document_state));

    Ok(())
}
