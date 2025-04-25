use todo_model::Todo;

mod storage;
mod todo_model;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


/*
fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    storage::initialize_db()?;
    let todos = storage::load()?;

    match cli.command {
        Commands::Add { text } => {
            let todo = Todo {
                id: None,
                content: text,
                done: false,
            };
            let id = storage::upsert(&todo)?;
            success(&format!("Added #{}", id));
        }
        Commands::List => print_table(&todos),
        Commands::Done { id } => {
            if let Some(t) = todos.iter().find(|t| t.id == Some(id)) {
                let mut todo = t.clone();
                todo.done = true;
                storage::upsert(&todo)?;
                warning(&format!("Completed #{}", id));
            }
        }
        Commands::Rn { id } => match storage::delete(id) {
            Ok(_) => error(&format!("Removed #{id}")),
            Err(_) => warning("Id Not Found"),
        },
    }
    Ok(())
}


*/