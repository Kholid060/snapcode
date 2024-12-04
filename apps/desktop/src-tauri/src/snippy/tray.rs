use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Error, Manager,
};

use crate::snippy;

pub fn init_app_tray(app: &App) -> Result<(), Error> {
    let menu_app = MenuItem::with_id(app, "open-app", "Open app", true, None::<&str>)?;
    let menu_exit = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;
    let menu_search = MenuItem::with_id(app, "search", "Quick search", true, Some("CmdOrCtrl+F"))?;
    let menu = Menu::with_items(
        app,
        &[
            &menu_app,
            &menu_search,
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
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "exit" => {
                app.exit(0);
            }
            "search" => {
                snippy::window::create_or_show_popup_window(&app).unwrap();
            }
            _ => {}
        })
        .menu(&menu)
        .build(app)?;

    Ok(())
}
