use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Error, Manager,
};

use crate::snippy;

pub fn init_app_tray(app: &App) -> Result<(), Error> {
    let menu_app = MenuItem::with_id(app, "open-app", "Open app", true, None::<&str>)?;
    let menu_exit = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;
    let menu_quick_access = MenuItem::with_id(app, "quick-access", "Quick access", true, Some("CmdOrCtrl+Shift+K"))?;
    let menu = Menu::with_items(
        app,
        &[
            &menu_app,
            &menu_quick_access,
            &PredefinedMenuItem::separator(app).unwrap(),
            &menu_exit,
        ],
    )?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                let app = tray.app_handle();
                if let Some(main_window) = app.get_webview_window("main") {
                    let _ = main_window.show();
                    let _ = main_window.set_focus();
                }
            }
            _ => {}
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open-app" => {
                snippy::window::MainWindow::create_or_show(app).expect("Failed to open the app");
            }
            "exit" => {
                app.exit(0);
            }
            "quick-access" => {
                snippy::window::PopupWindow::create_or_show(&app).unwrap();
            }
            _ => {}
        })
        .menu(&menu)
        .build(app)?;

    Ok(())
}
