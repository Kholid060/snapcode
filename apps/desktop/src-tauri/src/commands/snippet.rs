use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};
use std::{collections::HashMap, fs};
use tauri::Emitter;
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_sql::DbPool;

use crate::{
    common::stringify,
    snippy::{self, snippet::SnippetPlaceholderItem},
};

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
            .file_name()
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

#[derive(sqlx::FromRow, Deserialize)]
pub struct SnippetWithPlaceholders {
    id: String,
    name: String,
    lang: String,
    content: String,
    check_placeholder: i16,
    placeholders: sqlx::types::Json<Vec<SnippetPlaceholderItem>>,
}
impl Serialize for SnippetWithPlaceholders {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("SnippetWithPlaceholders", 5)?;
        s.serialize_field("id", &self.id)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("lang", &self.lang)?;
        s.serialize_field("content", &self.content)?;
        s.serialize_field("placeholders", &self.placeholders)?;
        s.end()
    }
}

#[tauri::command]
pub async fn get_snippet_with_placeholder(
    db_instances: tauri::State<'_, tauri_plugin_sql::DbInstances>,
    snippet_id: String,
) -> Result<SnippetWithPlaceholders, String> {
    let db = db_instances.0.read().await;
    let db = db
        .get("sqlite:app.db")
        .ok_or("App DB not initated".to_string())?;
    let db = match db {
        DbPool::Sqlite(pool) if !pool.is_closed() => pool,
        _ => return Err("App DB not found or closed".to_string()),
    };

    let mut snippet = sqlx::query_as::<_, SnippetWithPlaceholders>(
        "SELECT check_placeholder, lang, placeholders, content, name, id FROM snippets WHERE id = ?",
    )
    .bind(&snippet_id)
    .fetch_one(db)
    .await
    .map_err(|err| err.to_string())?;

    snippet.placeholders = if snippet.check_placeholder == 1 {
        let placeholders = snippy::snippet::extract_snippet_placeholders(&snippet.content)
            .map_err(|err| err.to_string())?;

        sqlx::query(
            "UPDATE snippets SET placeholders = ?, check_placeholder = ? WHERE snippets.id = ?",
        )
        .bind(sqlx::types::Json(&placeholders))
        .bind(0)
        .bind(&snippet_id)
        .execute(db)
        .await
        .map_err(|err| err.to_string())?;

        sqlx::types::Json(placeholders)
    } else {
        snippet.placeholders
    };

    Ok(snippet)
}

#[tauri::command]
pub fn send_snippet_content(
    app_handle: tauri::AppHandle,
    action: String,
    mut content: String,
    plaholders_value: HashMap<String, String>,
    placeholders: Vec<SnippetPlaceholderItem>,
) -> Result<(), String> {
    let content = if placeholders.len() > 0 {
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

#[tauri::command(async)]
pub fn create_snippets(
    app: tauri::AppHandle,
    snippets: Vec<snippy::snippet::SnippetDoc>,
) -> Result<Vec<snippy::snippet::SnippetCreatedItem>, String> {
    let snippets = snippy::snippet::create_snippets(&app, snippets).map_err(stringify)?;

    Ok(snippets)
}

#[tauri::command(async)]
pub fn create_folders(
    app: tauri::AppHandle,
    folders: Vec<String>,
) -> Result<Vec<snippy::snippet::SnippetCreatedItem>, String> {
    let folders = snippy::snippet::create_folders(&app, folders).map_err(stringify)?;

    Ok(folders)
}
