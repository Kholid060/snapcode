use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Error, Manager,
};
use tauri_plugin_store::StoreExt;

use crate::snippy;

type TrayMenu = Menu<tauri::Wry>;

pub struct AppTray {
    menu: TrayMenu,
}
impl AppTray {
    fn build_tray(app: &App, menu: &TrayMenu) -> Result<(), Error> {
        TrayIconBuilder::with_id("main")
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
                    snippy::window::MainWindow::create_or_show(app)
                        .expect("Failed to open the app");
                }
                "exit" => {
                    app.exit(0);
                }
                "quick-access" => {
                    if let Ok(window) = snippy::window::PopupWindow::get_or_create(&app) {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            })
            .menu(menu)
            .build(app)?;

        Ok(())
    }

    pub fn new(app: &App) -> Result<AppTray, Error> {
        let menu_app = MenuItem::with_id(app, "open-app", "Open app", true, None::<&str>)?;
        let menu_exit = MenuItem::with_id(app, "exit", "Exit", true, None::<&str>)?;
        let menu_quick_access = MenuItem::with_id(
            app,
            "quick-access",
            "Quick access",
            true,
            Some("CmdOrCtrl+Shift+K"),
        )?;
        let menu = Menu::with_items(
            app,
            &[
                &menu_app,
                &menu_quick_access,
                &PredefinedMenuItem::separator(app).unwrap(),
                &menu_exit,
            ],
        )?;

        AppTray::build_tray(app, &menu)?;

        Ok(AppTray { menu })
    }

    pub fn get_menu(&self) -> &TrayMenu {
        &self.menu
    }
}

pub fn init_app_tray(app: &App) -> Result<(), Error> {
    let app_tray = AppTray::new(app)?;
    app.manage(Mutex::new(app_tray));

    Ok(())
}
