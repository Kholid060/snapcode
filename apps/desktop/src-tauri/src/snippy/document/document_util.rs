use path_slash::PathExt;
use std::{
    collections::HashMap,
    path::Path,
    sync::{Arc, Mutex},
    time::UNIX_EPOCH,
};
use walkdir::WalkDir;

use ignore::{WalkBuilder, WalkState};

use crate::snippy::document::SearchItemEntry;

use super::{DocumentFlatTree, DocumentFlatTreeItem, SnippetStoredMetadata};

pub fn get_document_flat_tree<P: AsRef<Path>>(
    base_dir: P,
    metadata_store: &Arc<tauri_plugin_store::Store<tauri::Wry>>,
) -> DocumentFlatTree {
    let mut flat_tree: DocumentFlatTree = HashMap::new();
    flat_tree.insert(String::from("__root"), vec![]);

    for entry in WalkDir::new(&base_dir).into_iter() {
        if entry.is_err() {
            continue;
        }

        let entry = entry.unwrap();
        let name = entry.file_name().to_string_lossy().to_string();
        if name.is_empty() {
            continue;
        }

        let Ok(metadata) = entry.metadata() else {
            continue;
        };

        let relative_path = entry.path().strip_prefix(&base_dir).unwrap();

        let item_key = relative_path.to_slash_lossy().to_string();
        let parent_key = match Path::new(&item_key)
            .parent()
            .and_then(|v| Some(v.to_string_lossy().to_string()))
        {
            Some(parent) if !parent.is_empty() => parent,
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

        let stored_metadata: Option<SnippetStoredMetadata> = match metadata_store.get(&item_key) {
            Some(value) => serde_json::from_value(value).unwrap_or(None),
            None => None,
        };
        let item = DocumentFlatTreeItem {
            ext,
            name,
            mtime,
            path: item_key,
            is_dir: metadata.is_dir(),
            metadata: stored_metadata,
        };

        match flat_tree.get_mut(&parent_key) {
            Some(value) => {
                (*value).push(item);
            }
            None => {
                flat_tree.insert(parent_key, vec![item]);
            }
        };
    }

    flat_tree
}

pub fn search_document<P: AsRef<Path>>(
    base_dir: P,
    search_term: &str,
) -> anyhow::Result<Vec<SearchItemEntry>> {
    if search_term.is_empty() {
        return Ok(vec![]);
    }

    let matcher = Arc::new(Mutex::new(search_term));
    let result = Arc::new(Mutex::new(vec![]));

    WalkBuilder::new(&base_dir)
        .follow_links(false)
        .ignore(false)
        .build_parallel()
        .run(|| {
            let result = result.clone();
            let matcher = matcher.clone();

            Box::new(move |entry| {
                if entry.is_err() {
                    return WalkState::Continue;
                }

                let entry = entry.unwrap();
                let is_file = entry
                    .file_type()
                    .and_then(|val| Some(val.is_file()))
                    .unwrap_or(true);
                if !is_file || entry.is_stdin() {
                    return WalkState::Continue;
                }

                let mut file_name = entry.file_name().to_string_lossy().to_string();
                let matcher = matcher.lock().unwrap().to_string();
                if let Some(offset) = file_name.to_lowercase().find(&matcher.to_lowercase()) {
                    let match_range = offset..(offset + matcher.len());
                    file_name.replace_range(
                        match_range.clone(),
                        &format!("<span search-result>{}</span>", (&file_name[match_range])),
                    );
                    result
                        .lock()
                        .unwrap()
                        .push((entry.path().to_slash_lossy().to_string(), file_name));
                }

                WalkState::Continue
            })
        });

    let result: Vec<SearchItemEntry> = result
        .lock()
        .unwrap()
        .iter()
        .map(|(path, filename)| SearchItemEntry {
            path: Path::new(&path)
                .strip_prefix(&base_dir)
                .unwrap()
                .to_string_lossy()
                .to_string(),
            name: filename.clone(),
        })
        .collect();

    Ok(result)
}
