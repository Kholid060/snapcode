use std::{collections::HashMap, fs, path, sync::Mutex};

use crate::{
    common::stringify,
    snippy::{self, document::DocumentState}, util::PathUtil,
};

#[tauri::command]
pub fn get_document_state(
    document_state: tauri::State<'_, Mutex<DocumentState>>,
) -> Result<HashMap<String, String>, String> {
    let document_state = document_state.lock().map_err(stringify)?;

    let mut result = HashMap::new();
    result.insert(
        String::from("baseDir"),
        document_state
            .get_base_dir()
            .to_str()
            .unwrap_or_default()
            .to_owned(),
    );
    result.insert(
        String::from("metadataDir"),
        document_state
            .get_metadata_dir()
            .to_str()
            .unwrap_or_default()
            .to_owned(),
    );
    result.insert(
        String::from("snippetsDir"),
        document_state
            .get_snippets_dir()
            .to_str()
            .unwrap_or_default()
            .to_owned(),
    );

    Ok(result)
}

#[tauri::command(async)]
pub fn get_document_flat_tree(
    app: tauri::AppHandle,
) -> Result<snippy::document::DocumentFlatTreeData, String> {
    let res = snippy::document::get_document_flat_tree(&app).map_err(stringify)?;
    Ok(res)
}

#[tauri::command]
pub fn rename_document_item(
    doc_state: tauri::State<Mutex<DocumentState>>,
    old_path: String,
    new_path: String,
) -> Result<String, String>
 {
    let document_state = doc_state.lock().unwrap();
    let snippets_dir = document_state.get_snippets_dir();

    let old_path = snippets_dir.safe_join(old_path).map_err(|e| e.to_string() )?;
    let new_path_buf = snippets_dir.safe_join(&new_path).map_err(|e| e.to_string())?;

    if fs::exists(&new_path_buf).map_err(|e| e.to_string())? {
        Err(String::from("A file with the same name already exists"))
    } else {
        fs::rename(old_path, &new_path_buf).map_err(|e| e.to_string())?;
        Ok(new_path)
    }
}

#[tauri::command(async)]
pub fn move_document_items(
    app: tauri::AppHandle,
    items: Vec<(String, String)>
) -> Result<Vec<String>, String>
 {
    let result = snippy::document::move_document_items(&app, items).map_err(|e| e.to_string())?;
    Ok(result)
}
