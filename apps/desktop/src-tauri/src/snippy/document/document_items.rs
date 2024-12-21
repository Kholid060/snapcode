use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SnippetStoredMetadata {
    pub lang: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetDocCreated {
    pub ext: String,
    pub path: String,
    pub name: String,
    pub metadata: Option<serde_json::Value>,
    pub stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct SnippetDoc {
    pub path: String,
    pub contents: String,
    pub metadata: Option<serde_json::Value>,
    pub stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct FolderDoc {
    pub path: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Deserialize, Serialize)]
pub struct FolderDocCreated {
    pub path: String,
    pub name: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Deserialize, Serialize)]
pub struct FolderEntry {
    pub path: String,
    pub name: String,
}

#[derive(Deserialize, Serialize)]
pub struct SearchItemEntry {
    pub path: String,
    pub name: String,
    pub contents: Vec<(u64, String)>,
}

#[derive(Deserialize, Serialize)]
pub struct SnippetPlaceholderItem {
    pub end: usize,
    pub start: usize,
    pub name: String,
}


#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentFlatTreeMetadataItem {
    pub id: String,
    pub mtime: u128,
    pub ext: String,
    pub path: String,
    pub is_dir: bool,
    pub name: String,
    pub metadata: Option<SnippetStoredMetadata>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentFlatTreeItem {
    pub id: String,
    pub is_dir: bool,
    pub parent_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentFlatTree {
    pub flat_tree: HashMap<String, Vec<DocumentFlatTreeItem>>,
    pub metadata: HashMap<String, DocumentFlatTreeMetadataItem>,
}