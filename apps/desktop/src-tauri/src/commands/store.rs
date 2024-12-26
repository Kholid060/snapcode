use tauri_plugin_store::StoreExt;

use crate::common::stringify;

#[tauri::command]
pub fn store_delete_bulks(
    app: tauri::AppHandle,
    path: String,
    keys: Vec<String>,
) -> Result<(), String> {
    let store = app.store(path).map_err(stringify)?;
    keys.iter().for_each(|key| {
        store.delete(key);
    });

    Ok(())
}

#[tauri::command]
pub fn store_rename_root_keys(
    app: tauri::AppHandle,
    path: String,
    keys: Vec<(String, String)>,
) -> Result<(), String> {
    let store = app.store(path).map_err(stringify)?;
    keys.iter().for_each(|(old_key, new_key)| {
        if let Some(value) = store.get(old_key) {
          store.set(new_key, value);
          store.delete(old_key);
        }
    });

    Ok(())
}
