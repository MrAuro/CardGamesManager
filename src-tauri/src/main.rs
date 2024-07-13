// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tauri_plugin_aptabase::EventTracker;

#[cfg(not(debug_assertions))]
static DEFAULT_FLUSH_INTERVAL: Duration = Duration::from_secs(60);

#[cfg(debug_assertions)]
static DEFAULT_FLUSH_INTERVAL: Duration = Duration::from_secs(2);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_aptabase::Builder::new("A-SH-3943910658")
                .with_options(tauri_plugin_aptabase::InitOptions {
                    host: Some("http://192.168.1.239:8001".to_string()),
                    flush_interval: Some(DEFAULT_FLUSH_INTERVAL),
                })
                .build(),
        )
        .setup(|app| {
            app.track_event("app_started", None);
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|handler, event| match event {
            tauri::RunEvent::Exit { .. } => {
                handler.track_event("app_exited", None);
                handler.flush_events_blocking();
            }
            _ => {}
        })
}
