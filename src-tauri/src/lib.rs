mod commands;
mod db;
mod models;
mod ai;

use commands::{labels, projects, tasks};
use db::initialize_db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    initialize_db().expect("Failed to initialize database");

    tauri::Builder::default()
        .setup(|app| {
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

            let show_item = MenuItemBuilder::with_id("show", "Show").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("TODO App")
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

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
            tasks::get_tasks,
            tasks::get_task,
            tasks::create_task,
            tasks::update_task,
            tasks::delete_task,
            tasks::toggle_task_complete,
            tasks::reorder_tasks,
            projects::get_projects,
            projects::get_project,
            projects::create_project,
            projects::update_project,
            projects::delete_project,
            labels::get_labels,
            labels::create_label,
            labels::update_label,
            labels::delete_label,
            ai::fetch_models,
            ai::generate_subtasks,
            ai::chat_with_ai,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}