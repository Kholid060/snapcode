use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Emitter, Error, Listener, Runtime, WebviewWindow};

#[cfg(target_os = "macos")]
mod traffic;

#[cfg(target_os = "linux")]
mod dconf;

mod commands;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the decorum APIs.
pub trait WebviewWindowExt {
    fn create_overlay_titlebar(&self) -> Result<&WebviewWindow, Error>;
    #[cfg(target_os = "macos")]
    fn set_traffic_lights_inset(&self, x: f32, y: f32) -> Result<&WebviewWindow, Error>;
    #[cfg(target_os = "macos")]
    fn make_transparent(&self) -> Result<&WebviewWindow, Error>;
    #[cfg(target_os = "macos")]
    fn set_window_level(&self, level: u32) -> Result<&WebviewWindow, Error>;
}

impl<'a> WebviewWindowExt for WebviewWindow {
    /// Create a custom titlebar overlay.
    /// This will remove the default titlebar and create a draggable area for the titlebar.
    /// On Windows, it will also create custom window controls.
    fn create_overlay_titlebar(&self) -> Result<&WebviewWindow, Error> {
        #[cfg(target_os = "windows")]
        self.set_decorations(false)?;

        let win2 = self.clone();

        self.listen("decorum-page-load", move |_event| {
            // println!("decorum-page-load event received")

            // Custom window controls for linux
            #[cfg(target_os = "linux")]
            {
                use linicon::{lookup_icon, IconType};
                use std::io::prelude::*;
                let mut control_script = include_str!("./js/titlebar.js").to_string();

                let mut controls = Vec::new();
                if win2.is_minimizable().unwrap_or(false) {
                    controls.push("minimize".to_string());
                }

                if win2.is_maximizable().unwrap_or(false) && win2.is_resizable().unwrap_or(false) {
                    controls.push("maximize".to_string());
                }

                if win2.is_closable().unwrap_or(false) {
                    controls.push("close".to_string());
                }

                controls.push("restore".to_string());

                for control in controls.iter() {
                    if let Some(Ok(control_icon)) =
                        lookup_icon(format!("window-{}-symbolic", control))
                            .into_iter()
                            .find(|icon| match icon {
                                Ok(icon) => icon.icon_type == IconType::SVG,
                                Err(_) => false,
                            })
                    {
                        let mut icon_data = String::new();
                        let mut f = std::fs::File::open(control_icon.path).unwrap();
                        let _ = f.read_to_string(&mut icon_data);

                        control_script =
                            control_script.replace(&format!("@win-{}", control), &icon_data);
                    };
                }

                controls.remove(controls.len() - 1);

                // return this string style 'appmenu:minimize,maximize,close'
                if let Ok(app_menu_config) =
                    dconf::read("/org/gnome/desktop/wm/preferences/button-layout")
                {
                    controls = app_menu_config
                        .trim_start_matches("appmenu:")
                        .split(',')
                        .map(|x| x.to_string())
                        .collect::<Vec<String>>();
                };

                let controls = format!("{:?}", controls);

                let control_script = control_script.replacen(
                    "[\"minimize\", \"maximize\", \"close\"]",
                    &controls,
                    1,
                );

                win2.eval(&control_script).expect("couldn't run js");
            }

            // On Windows, create custom window controls
            #[cfg(target_os = "windows")]
            {
                let mut controls = Vec::new();

                if win2.is_minimizable().unwrap_or(false) {
                    controls.push("minimize");
                }

                if win2.is_maximizable().unwrap_or(false) && win2.is_resizable().unwrap_or(false) {
                    controls.push("maximize");
                }

                if win2.is_closable().unwrap_or(false) {
                    controls.push("close");
                }

                let script_controls = include_str!("js/titlebar.js");
                let controls = format!("{:?}", controls);

                // this line finds ["minimize", "maximize", "close"] in the file
                // and replaces it with only the controls enabled for the window
                let script_controls = script_controls.replacen(
                    "[\"minimize\", \"maximize\", \"close\"]",
                    &controls,
                    1,
                );
                let script_controls = script_controls.replacen("window.__windows", "true", 1);

                win2.eval(script_controls.as_str())
                    .expect("couldn't run js");

                let win3 = win2.clone();
                win2.on_window_event(move |eve| match eve {
                    tauri::WindowEvent::CloseRequested { .. } => {
                        win3.unlisten(_event.id());
                    }
                    _ => {}
                });
            }
        });

        Ok(self)
    }

    /// Set the inset of the traffic lights.
    /// This will move the traffic lights to the specified position.
    /// This is only available on macOS.
    #[cfg(target_os = "macos")]
    fn set_traffic_lights_inset(&self, x: f32, y: f32) -> Result<&WebviewWindow, Error> {
        ensure_main_thread(self, move |win| {
            let ns_window = win.ns_window()?;
            let ns_window_handle = traffic::UnsafeWindowHandle(ns_window);

            traffic::position_traffic_lights(ns_window_handle, x.into(), y.into());

            Ok(win)
        })
    }

    /// Set the window background to transparent.
    /// This helper function is different from Tauri's default
    /// as it doesn't use the `transparent` flag or macOS Private APIs.
    #[cfg(target_os = "macos")]
    fn make_transparent(&self) -> Result<&WebviewWindow, Error> {
        use cocoa::{
            appkit::NSColor,
            base::{id, nil},
            foundation::NSString,
        };

        // Make webview background transparent
        self.with_webview(|webview| unsafe {
            let id = webview.inner() as *mut objc::runtime::Object;
            let no: id = msg_send![class!(NSNumber), numberWithBool:0];
            let _: id =
                msg_send![id, setValue:no forKey: NSString::alloc(nil).init_str("drawsBackground")];
        })?;

        // Make window background transparent
        ensure_main_thread(self, move |win| {
            let ns_win = win.ns_window()? as id;
            unsafe {
                let win_bg_color =
                    NSColor::colorWithSRGBRed_green_blue_alpha_(nil, 0.0, 0.0, 0.0, 0.0);
                let _: id = msg_send![ns_win, setBackgroundColor: win_bg_color];
            }
            Ok(win)
        })
    }

    /// Set the window level.
    /// This will set the window level to the specified value.
    /// NSWindowLevel values can be found [here](https://developer.apple.com/documentation/appkit/nswindowlevel?language=objc).
    /// This is only available on macOS.
    #[cfg(target_os = "macos")]
    fn set_window_level(&self, level: u32) -> Result<&WebviewWindow, Error> {
        ensure_main_thread(self, move |win| {
            let ns_win = win.ns_window()? as cocoa::base::id;
            unsafe {
                let _: () = msg_send![ns_win, setLevel: level];
            }
            Ok(win)
        })
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("decorum")
        .invoke_handler(tauri::generate_handler![commands::show_snap_overlay])
        .on_page_load(|win, _payload: &tauri::webview::PageLoadPayload| {
            match win.emit("decorum-page-load", ()) {
                Ok(_) => {}
                Err(e) => println!("decorum error: {:?}", e),
            }
        })
        .on_window_ready(|_win| {
            #[cfg(target_os = "macos")]
            traffic::setup_traffic_light_positioner(_win);
            return;
        })
        .build()
}

#[cfg(target_os = "macos")]
fn is_main_thread() -> bool {
    std::thread::current().name() == Some("main")
}

#[cfg(target_os = "macos")]
fn ensure_main_thread<F>(
    win: &WebviewWindow,
    main_action: F,
) -> Result<&WebviewWindow, tauri::Error>
where
    F: FnOnce(&WebviewWindow) -> Result<&WebviewWindow, Error> + Send + 'static,
{
    match is_main_thread() {
        true => {
            main_action(win)?;
            Ok(win)
        }
        false => {
            let win2 = win.clone();

            match win.run_on_main_thread(move || {
                main_action(&win2).unwrap();
            }) {
                Ok(_) => Ok(win),
                Err(e) => Err(e),
            }
        }
    }
}
