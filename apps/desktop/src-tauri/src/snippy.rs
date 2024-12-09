use tauri::Manager;

pub mod tray;
pub mod window;
pub mod snippet;
pub mod keyboard;

pub fn init_app(app: &mut tauri::App) -> Result<(), tauri::Error> {
    tray::init_app_tray(&app)?;
    window::MainWindow::create_or_show(&app.app_handle())?;

    Ok(())
}
