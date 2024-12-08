use tauri::AppHandle;

use crate::{
    common::stringify,
    snippy::{self},
};

#[tauri::command(async)]
pub fn open_popup_window(app: AppHandle) -> Result<(), String> {
    let popup_window = snippy::window::PopupWindow::get_or_create(&app).map_err(stringify)?;
    let new_position = snippy::window::PopupWindow::get_pos_from_cursor(&app).map_err(stringify)?;

    popup_window.set_position(new_position).map_err(stringify)?;
    popup_window.show().map_err(stringify)?;
    popup_window.set_focus().map_err(stringify)?;

    Ok(())
}
