const COMMANDS: &[&str] = &["show_snap_overlay"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
