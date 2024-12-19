use std::{collections::HashMap, sync::Mutex};
use tauri::{Emitter, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;

use crate::{
    common::stringify,
    snippy::{
        self,
        document::{self, AppDocument},
    },
};

#[tauri::command(async)]
pub fn import_snippet_from_file(
    app_handle: tauri::AppHandle,
    window: tauri::Window,
    dir_path: String,
) -> Result<Vec<document::SnippetDocCreated>, String> {
    let app_document = app_handle.state::<Mutex<document::AppDocument>>();
    let app_document = app_document.lock().unwrap();

    let paths = app_handle
        .dialog()
        .file()
        .set_title("Select file(s) to import")
        .set_parent(&window)
        .blocking_pick_files()
        .unwrap_or_default();
    let paths = paths.iter().filter_map(|path| path.as_path()).collect();

    let snippets = app_document
        .import_files(&app_handle, dir_path, paths)
        .map_err(stringify)?;

    Ok(snippets)
}

#[tauri::command]
pub async fn get_snippet_with_placeholder(
    app_document: tauri::State<'_, Mutex<AppDocument>>,
    path: String,
) -> Result<Vec<snippy::document::SnippetPlaceholderItem>, String> {
    let app_document = app_document.lock().unwrap();
    app_document.get_snippet_placeholders(path).map_err(stringify)
}

#[tauri::command]
pub fn send_snippet_content(
    app_handle: tauri::AppHandle,
    app_document: tauri::State<Mutex<AppDocument>>,
    path: String,
    action: String,
    plaholders_value: HashMap<String, String>,
    placeholders: Vec<snippy::document::SnippetPlaceholderItem>,
) -> Result<(), String> {
    let app_document = app_document.lock().unwrap();

    let mut content = app_document.get_snippet_content(path).map_err(stringify)?;
    let content = if !placeholders.is_empty() {
        snippy::snippet::replace_snippet_placeholders(
            &mut content,
            &placeholders,
            &plaholders_value,
        )
    } else {
        &content
    };

    match action.as_str() {
        "copy" => {
            app_handle
                .clipboard()
                .write_text(content)
                .map_err(stringify)?;
        }
        "paste" => {
            if content.is_empty() {
                return Ok(());
            }

            let clipboard_text = app_handle.clipboard().read_text().unwrap_or_default();

            app_handle
                .clipboard()
                .write_text(content)
                .map_err(stringify)?;
            snippy::window::PopupWindow::hide(&app_handle);

            let mut enigo = enigo::Enigo::new(&enigo::Settings::default()).map_err(stringify)?;
            snippy::keyboard::press_paste(&mut enigo).map_err(stringify)?;

            if !clipboard_text.is_empty() {
                std::thread::sleep(std::time::Duration::from_millis(10));
                app_handle
                    .clipboard()
                    .write_text(clipboard_text)
                    .map_err(stringify)?;
            }
        }
        other => {
            return Err(format!("\"{}\" is invalid action", other));
        }
    }

    Ok(())
}

#[tauri::command]
pub fn open_snippet(app: tauri::AppHandle, snippet_id: String) -> Result<(), String> {
    let main_window = snippy::window::MainWindow::create_or_show(&app).map_err(stringify)?;
    main_window
        .emit("snippet:open", snippet_id)
        .map_err(stringify)?;

    Ok(())
}
