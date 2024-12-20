use std::{collections::HashMap, sync::Mutex};

use crate::{
    common::stringify,
    snippy::{self, document::AppDocument},
    util::PathUtil,
};

#[tauri::command]
pub fn get_document_state(
    document_state: tauri::State<'_, Mutex<AppDocument>>,
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
    app_handle: tauri::AppHandle,
    app_document: tauri::State<Mutex<AppDocument>>,
) -> Result<snippy::document::DocumentFlatTree, String> {
    let app_document = app_document.lock().unwrap();
    let result = app_document.get_flat_tree(&app_handle).map_err(stringify)?;

    Ok(result)
}

#[tauri::command]
pub fn rename_document_item(
    app_document: tauri::State<Mutex<AppDocument>>,
    old_path: String,
    new_path: String,
) -> Result<String, String> {
    let app_document = app_document.lock().unwrap();
    let result = app_document
        .rename_item(old_path, new_path)
        .map_err(stringify)?;

    Ok(result)
}

#[tauri::command(async)]
pub fn move_document_items(
    app_document: tauri::State<Mutex<AppDocument>>,
    items: Vec<(String, String)>,
) -> Result<Vec<String>, String> {
    let app_document = app_document.lock().unwrap();
    let result = app_document.move_document_items(items).map_err(stringify)?;

    Ok(result)
}

#[tauri::command(async)]
pub fn create_snippets(
    app_document: tauri::State<Mutex<AppDocument>>,
    app: tauri::AppHandle,
    snippets: Vec<snippy::document::SnippetDoc>,
) -> Result<Vec<snippy::document::SnippetDocCreated>, String> {
    let app_document = app_document.lock().unwrap();
    let snippets = app_document
        .create_snippets(&app, snippets)
        .map_err(stringify)?;

    Ok(snippets)
}

#[tauri::command(async)]
pub fn create_folders(
    app_document: tauri::State<Mutex<AppDocument>>,
    folders: Vec<snippy::document::FolderDoc>,
) -> Result<Vec<snippy::document::FolderDocCreated>, String> {
    let app_document = app_document.lock().unwrap();
    let folders = app_document.create_folders(folders).map_err(stringify)?;

    Ok(folders)
}

#[tauri::command(async)]
pub fn remove_document_items(
    app_document: tauri::State<Mutex<AppDocument>>,
    paths: Vec<String>,
    to_trash: bool,
) -> Result<(), String> {
    let app_document = app_document.lock().unwrap();
    app_document
        .remove_items(paths, to_trash)
        .map_err(stringify)?;

    Ok(())
}

#[tauri::command(async)]
pub fn get_all_document_folders(
    app_document: tauri::State<Mutex<AppDocument>>,
) -> Vec<snippy::document::FolderEntry> {
    let app_document = app_document.lock().unwrap();
    app_document.get_all_folders()
}

#[tauri::command(async)]
pub fn document_search(
    app_document: tauri::State<Mutex<AppDocument>>,
    search_term: String,
) -> Result<Vec<snippy::document::SearchItemEntry>, String> {
    let app_document = app_document.lock().unwrap();
    app_document.search(&search_term).map_err(stringify)
}

#[tauri::command(async)]
pub fn get_snippet_content(
    app_document: tauri::State<Mutex<AppDocument>>,
    path: String,
) -> Result<String, String> {
    let app_document = app_document.lock().unwrap();
    app_document.get_snippet_content(&path).map_err(stringify)
}

#[tauri::command(async)]
pub fn show_item_in_folder(
    app_document: tauri::State<Mutex<AppDocument>>,
    path: String,
) -> Result<(), String> {
    let app_document = app_document.lock().unwrap();
    let path = app_document
        .get_snippets_dir()
        .safe_join(path)
        .map_err(stringify)?;
    tauri_plugin_opener::reveal_item_in_dir(path).map_err(stringify)?;

    Ok(())
}
