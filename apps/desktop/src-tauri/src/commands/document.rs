use std::{collections::HashMap, sync::Mutex};

use crate::{
    common::stringify,
    snippy::{self, document::DocumentState},
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
