use tauri::AppHandle;

use crate::snippy::{self};

#[tauri::command(async)]
pub fn open_popup_window(app: AppHandle) -> Result<(), String> {
    let popup_window =
        snippy::window::PopupWindow::create_or_show(&app).map_err(|err| err.to_string())?;
    let new_position =
        snippy::window::PopupWindow::get_pos_from_cursor(&app).map_err(|err| err.to_string())?;

    popup_window
        .set_position(new_position)
        .map_err(|err| err.to_string())?;
    popup_window.show().map_err(|err| err.to_string())?;
    popup_window.set_focus().map_err(|err| err.to_string())?;

    Ok(())
}
