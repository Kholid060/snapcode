use std::sync::Mutex;

use tauri::AppHandle;

use crate::{
    common::stringify,
    snippy::{self},
};

#[tauri::command(async)]
pub fn open_popup_window(app: AppHandle) -> Result<(), String> {
    snippy::window::PopupWindow::show_on_cursor(&app).map_err(stringify)?;

    Ok(())
}

#[tauri::command]
pub fn update_popup_window_tray_menu(
    app_tray: tauri::State<'_, Mutex<snippy::tray::AppTray>>,
    shortcut: String,
) -> Result<(), String> {
    let tray_menu = app_tray.lock().map_err(stringify)?;
    let tray_menu = tray_menu.get_menu();

    let tray_menu_items = tray_menu.items().map_err(stringify)?;
    let quick_access_item = tray_menu_items
        .iter()
        .find(|item| match item.as_menuitem() {
            Some(item) if item.id() == "quick-access" => true,
            _ => false,
        });

    if quick_access_item.is_some() {
        let quick_access_item = quick_access_item.unwrap().as_menuitem().unwrap();
        quick_access_item
            .set_accelerator(Some(shortcut))
            .map_err(stringify)?;
    }

    Ok(())
}
