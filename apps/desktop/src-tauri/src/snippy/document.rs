use std::{collections::HashMap, io, path::PathBuf, sync::Mutex, time::UNIX_EPOCH};

use serde::{ser::SerializeStruct, Serialize};
use tauri::{self, Manager};
use tauri_plugin_store::StoreExt;
use walkdir::WalkDir;

use crate::common::ensure_dir;

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

#[derive(Serialize)]
pub struct DocumentTreeItemMetadata {
    mtime: u128,
    name: String,
    is_dir: bool,
}

#[derive(Serialize)]
pub struct DocumentFlatTreeData {
    flat_tree: HashMap<String, Vec<String>>,
    metadata: HashMap<String, DocumentTreeItemMetadata>,
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
        if name.is_empty() || (name == "__root" && metadata.is_dir()) {
            return;
        }

        let item_key = path.to_str().unwrap_or_default().to_owned();
        let parent_key = match path.parent().and_then(|val| val.to_str()) {
            Some(parent) if !parent.is_empty() => parent.to_owned(),
            _ => Self::root_key(),
        };

        match self.flat_tree.get_mut(&parent_key) {
            Some(value) => {
                (*value).push(name.clone());
            }
            None => {
                self.flat_tree.insert(parent_key, vec![name.clone()]);
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
                is_dir: metadata.is_dir(),
            },
        );
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

pub fn init_app_document(app: &tauri::App) -> tauri::Result<()> {
    let document_state = DocumentState::new(&app)?;
    let _ = app
        .store_builder(document_state.base_dir.join("a.json"))
        .build();

    app.manage(Mutex::new(document_state));

    Ok(())
}
