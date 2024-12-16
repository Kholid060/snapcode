use std::{
    fs, io,
    path::{self}, sync::Arc,
};

pub type TauriStore = Arc<tauri_plugin_store::Store<tauri::Wry>>;

pub fn stringify<T: ToString>(x: T) -> String {
    x.to_string()
}

pub fn ensure_dir<P: AsRef<path::Path>>(path: &P) -> io::Result<()> {
    if let false = fs::exists(path)? {
        fs::create_dir(path)?;
    };

    Ok(())
}
