use std::{collections::HashMap, fs, io, path::PathBuf, sync::Mutex};

use path_slash::PathBufExt;
use regex::Regex;
use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};
use serde_json::json;
use tauri::Manager;
use tauri_plugin_store::StoreExt;

use crate::{common, util::PathUtil};

use super::document::DocumentState;

#[derive(Deserialize, sqlx::FromRow, Clone, Debug)]
pub struct SnippetPlaceholderItem {
    end: usize,
    start: usize,
    name: String,
}
impl Serialize for SnippetPlaceholderItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("SnippetPlaceholderItem", 3)?;
        s.serialize_field("end", &self.end)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("start", &self.start)?;

        s.end()
    }
}

pub fn extract_snippet_placeholders(
    content: &str,
) -> Result<Vec<SnippetPlaceholderItem>, Box<dyn std::error::Error>> {
    let regex = Regex::new(r"\[\[(\w+)\]\]")?;
    Ok(regex
        .find_iter(content)
        .map(|entry| SnippetPlaceholderItem {
            end: entry.end(),
            start: entry.start(),
            name: entry.as_str().to_owned(),
        })
        .collect())
}

pub fn replace_snippet_placeholders<'a>(
    content: &'a mut String,
    placeholders: &Vec<SnippetPlaceholderItem>,
    placeholders_value: &HashMap<String, String>,
) -> &'a String {
    for placeholder in placeholders.iter().rev() {
        let value = placeholders_value
            .get(&placeholder.name)
            .unwrap_or(&placeholder.name);
        content.replace_range(placeholder.start..placeholder.end, value);
    }

    content
}

#[derive(Serialize, Deserialize)]
pub struct SnippetStoredMetadata {
    lang: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SnippetCreatedItem {
    path: String,
    name: String,
    stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct SnippetDoc {
    path: String,
    contents: String,
    stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct FolderDoc {
    path: String,
}

#[derive(Deserialize, Serialize)]
pub struct FolderCreatedItem {
    path: String,
    name: String,
}

pub fn create_snippets(
    app: &tauri::AppHandle,
    snippets: Vec<SnippetDoc>,
) -> io::Result<Vec<SnippetCreatedItem>> {
    let document_state = app.state::<Mutex<DocumentState>>();
    let document_state = document_state.lock().unwrap();
    let snippets_dir = document_state.get_snippets_dir();

    let metadata_store = app
        .store(document_state.get_metadata_dir().join("metadata.json"))
        .unwrap();

    let mut snippet_paths = vec![];
    for snippet in snippets {
        let file_path = snippets_dir
            .safe_join(snippet.path)?
            .gen_unique_filename()?;
        fs::write(&file_path, &snippet.contents)?;

        let file_path = file_path.strip_prefix(snippets_dir).unwrap().to_path_buf();
        if let Some(file_path_str) = file_path.to_slash().and_then(|val| Some(val.to_string())) {
            if let Some(metadata) = &snippet.stored {
                metadata_store.set(&file_path_str, json!(metadata));
            }

            snippet_paths.push(SnippetCreatedItem {
                path: file_path_str,
                stored: snippet.stored,
                name: file_path
                    .file_name()
                    .and_then(|val| val.to_str())
                    .unwrap_or_default()
                    .to_owned(),
            });
        }
    }

    Ok(snippet_paths)
}

pub fn create_folders(
    app: &tauri::AppHandle,
    folders: Vec<FolderDoc>,
) -> io::Result<Vec<FolderCreatedItem>> {
    let document_state = app.state::<Mutex<DocumentState>>();
    let document_state = document_state.lock().unwrap();

    let snippets_dir = document_state.get_snippets_dir();

    let mut result = vec![];
    for folder in folders {
        let folder_path = snippets_dir.safe_join(folder.path)?.gen_unique_filename()?;
        fs::create_dir_all(&folder_path)?;

        let folder_path = folder_path
            .strip_prefix(snippets_dir)
            .unwrap()
            .to_path_buf();
        if let Some(folder_path_str) = folder_path.to_str() {
            result.push(FolderCreatedItem {
                path: folder_path_str.to_owned(),
                name: folder_path
                    .file_name()
                    .and_then(|val| val.to_str())
                    .unwrap_or_default()
                    .to_owned(),
            });
        }
    }

    Ok(result)
}
