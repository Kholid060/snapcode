pub mod document;
pub mod keyboard;
pub mod snippet;
pub mod tray;
pub mod window;

pub fn init_app(app: &mut tauri::App) -> tauri::Result<()> {
    tray::init_app_tray(app)?;
    document::init_app_document(app)?;
    window::init_app_window(app)?;

    Ok(())
}
