use tauri;

#[tauri::command]
pub async fn show_snap_overlay() {
    #[cfg(target_os = "windows")]
    {
        use enigo::{Enigo, Key, KeyboardControllable};

        // press win + z using enigo
        let mut enigo = Enigo::new();
        enigo.key_down(Key::Meta);
        enigo.key_click(Key::Layout('z'));
        enigo.key_up(Key::Meta);

        // Wait 50 ms
        std::thread::sleep(std::time::Duration::from_millis(50));

        // Press Alt to hide the ugly numbers
        enigo.key_click(Key::Alt);
    }
}
