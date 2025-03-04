use tauri_plugin_prevent_default::Flags;

mod commands;
mod common;
mod snippy;
mod util;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_decorum::init())
        .plugin(
            tauri_plugin_prevent_default::Builder::new()
                .with_flags(Flags::all().difference(Flags::CONTEXT_MENU | Flags::FOCUS_MOVE))
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .max_file_size(2_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(
            tauri_plugin_stronghold::Builder::new(|password| {
                use argon2::{hash_raw, Config, Variant, Version};

                let config = Config {
                    lanes: 4,
                    mem_cost: 10_000,
                    time_cost: 10,
                    variant: Variant::Argon2id,
                    version: Version::Version13,
                    ..Default::default()
                };
                let salt = std::env!("SALT_KEY", "Missing SALT_KEY").as_bytes();
                let key =
                    hash_raw(password.as_ref(), salt, &config).expect("failed to hash password");

                key.to_vec()
            })
            .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::store::store_delete_bulks,
            commands::store::store_rename_root_keys,
            commands::window::open_popup_window,
            commands::window::update_popup_window_tray_menu,
            commands::document::create_folders,
            commands::document::document_search,
            commands::document::create_snippets,
            commands::document::duplicate_snippet,
            commands::document::get_document_state,
            commands::document::get_snippet_content,
            commands::document::move_document_items,
            commands::document::show_item_in_folder,
            commands::document::rename_document_item,
            commands::document::remove_document_items,
            commands::document::get_document_flat_tree,
            commands::document::get_all_document_folders,
            commands::snippet::open_snippet,
            commands::snippet::send_snippet_content,
            commands::snippet::import_snippet_from_file,
            commands::snippet::get_snippet_with_placeholder,
        ])
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } if window.label() == "main" => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            snippy::init_app(app)?;

            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                        let _ = snippy::window::MainWindow::create_or_show(app);
                    }))?;

                app.handle()
                    .plugin(tauri_plugin_global_shortcut::Builder::new().build())?;

                app.handle().plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    Some(vec!["--autostart"]),
                ))?;

                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
