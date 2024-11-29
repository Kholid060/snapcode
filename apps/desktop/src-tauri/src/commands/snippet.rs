use std::{collections::HashMap, fs};
use tauri_plugin_dialog::DialogExt;

type ImportedSnippetItem = HashMap<String, String>;

#[tauri::command(async)]
pub fn import_snippet_from_file(
    app_handle: tauri::AppHandle,
    webview_window: tauri::WebviewWindow,
) -> Vec<ImportedSnippetItem> {
    let Some(file_paths) = app_handle
        .dialog()
        .file()
        .set_title("Select file(s) to import")
        .set_parent(&webview_window)
        .blocking_pick_files()
    else {
        return vec![];
    };
    let mut contents = vec![];

    for path in file_paths {
        let Ok(path) = path.into_path() else { continue };
        let Ok(file_content) = fs::read_to_string(&path) else {
            continue;
        };

        let mut snippet = HashMap::new();

        let file_name = path
            .file_stem()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();
        let file_ext = path
            .extension()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();

        snippet.insert("content".to_string(), file_content);
        snippet.insert("ext".to_string(), file_ext.to_owned());
        snippet.insert("name".to_string(), file_name.to_owned());

        contents.push(snippet);
    }

    contents
}
