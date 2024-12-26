use tauri::Manager;

pub mod tray;
pub mod window;
pub mod snippet;
pub mod document;
pub mod keyboard;

pub fn init_app(app: &mut tauri::App) -> tauri::Result<()> {
    tray::init_app_tray(app)?;
    document::init_app_document(app)?;

    if !std::env::args().any(|arg| &arg == "autostart") {
        window::MainWindow::create_or_show(app.app_handle())?;
    }

    Ok(())
}
