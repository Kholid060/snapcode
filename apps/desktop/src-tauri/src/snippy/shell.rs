// https://github.com/tauri-apps/plugins-workspace/issues/999#issuecomment-1965624559
use std::{io, process::Command};
// State is used by linux

#[cfg(not(target_os = "windows"))]
use std::path::PathBuf;

#[cfg(target_os = "linux")]
use crate::DbusState;
#[cfg(target_os = "linux")]
use std::time::Duration;

#[cfg(target_os = "linux")]
pub fn show_item_in_folder(app_handle: &tauri::AppHandle, path: String) -> io::Result<()> {
    use std::io;

    let dbus_state = app_handle.state::<Mutex<State<DbusState>>>().lock().unwrap();
    let dbus_guard = dbus_state.0.lock()?;

    // see https://gitlab.freedesktop.org/dbus/dbus/-/issues/76
    if dbus_guard.is_none() || path.contains(",") {
        let mut path_buf = PathBuf::from(&path);
        let new_path = match path_buf.is_dir() {
            true => path,
            false => {
                path_buf.pop();
                path_buf.into_os_string().into_string().unwrap()
            }
        };
        Command::new("xdg-open")
            .arg(&new_path)
            .spawn()
            .map_err(|e| format!("{e:?}"))?;
    } else {
        // https://docs.rs/dbus/latest/dbus/
        let dbus = dbus_guard.as_ref().unwrap();
        let proxy = dbus.with_proxy(
            "org.freedesktop.FileManager1",
            "/org/freedesktop/FileManager1",
            Duration::from_secs(5),
        );
        let (_,): (bool,) = proxy.method_call(
            "org.freedesktop.FileManager1",
            "ShowItems",
            (vec![format!("file://{path}")], ""),
        )?;
    }
    Ok(())
}

#[cfg(not(target_os = "linux"))]
pub fn show_item_in_folder(_app_handle: tauri::AppHandle, path: String) -> io::Result<()> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .args(["/select,", &path]) // The comma after select is not a typo
            .spawn()?;
    }

    #[cfg(target_os = "macos")]
    {
        let path_buf = PathBuf::from(&path);
        if path_buf.is_dir() {
            Command::new("open").args([&path]).spawn()?;
        } else {
            Command::new("open").args(["-R", &path]).spawn()?;
        }
    }
    Ok(())
}

#[cfg(target_os = "linux")]
pub fn init_app_shell(app: &tauri::App) {
    app.manage(DbusState(Mutex::new(
        dbus::blocking::SyncConnection::new_session().ok(),
    )));
}
