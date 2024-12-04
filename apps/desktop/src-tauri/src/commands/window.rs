use std::cmp::min;

use tauri::AppHandle;

use crate::snippy::{self};

#[tauri::command(async)]
pub fn open_popup_window(app: AppHandle) -> Result<(), String> {
    let popup_window =
        snippy::window::create_or_show_popup_window(&app).map_err(|err| err.to_string())?;

    let new_position =
        snippy::window::get_popup_window_pos_from_cursor(&app).map_err(|err| err.to_string())?;
    popup_window
        .set_position(new_position)
        .map_err(|err| err.to_string())?;

    popup_window.show().map_err(|err| err.to_string())?;
    popup_window.set_focus().map_err(|err| err.to_string())?;

    Ok(())
}
