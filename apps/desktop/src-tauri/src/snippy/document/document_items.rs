use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SnippetStoredMetadata {
    pub lang: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SnippetDocCreated {
    pub ext: String,
    pub path: String,
    pub name: String,
    pub stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct SnippetDoc {
    pub path: String,
    pub contents: String,
    pub stored: Option<SnippetStoredMetadata>,
}

#[derive(Deserialize, Serialize)]
pub struct FolderDoc {
    pub path: String,
}

#[derive(Deserialize, Serialize)]
pub struct FolderDocCreated {
    pub path: String,
    pub name: String,
}
