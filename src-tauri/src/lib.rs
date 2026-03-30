mod storage;
mod todo_model;
mod tracker;
mod ai;

use storage::{delete, initialize_db, load, upsert, log_productivity, get_productivity_stats, get_settings, update_settings};
use tracker::{start_tracking, TrackerState};
use ai::{generate_subtasks, chat_with_ai, fetch_models};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = initialize_db();
    
    tauri::Builder::default()
        .manage(TrackerState::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            
            // Start productivity tracking
            start_tracking(app.handle().clone());
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            initialize_db,
            upsert,
            load,
            delete,
            log_productivity,
            get_productivity_stats,
            generate_subtasks,
            chat_with_ai,
            get_settings,
            update_settings,
            fetch_models
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

