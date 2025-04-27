use storage::{delete, initialize_db, load, upsert};
mod storage;
mod todo_model;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = initialize_db();
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            initialize_db,
            upsert,
            load,
            delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

