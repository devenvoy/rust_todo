use clap::{Parser, Subcommand};
use todo_model::Todo;

mod storage;
mod todo_model;

#[derive(Parser)]
#[command(name = "rust-todo")]
#[command(about = "A tiny rust command line todo")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Add { text: String },
    List,
    Done { id: u32 },
    Rn { id: u32 },
}

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
            println!("Added #{}", id);
        }
        Commands::List => {
            for t in &todos {
                println!(
                    "[{}] {:>3} {}",
                    if t.done { "❌" } else { " " },
                    t.id.unwrap_or(0),
                    t.content
                );
            }
        }
        Commands::Done { id } => {
            if let Some(t) = todos.iter().find(|t| t.id == Some(id)) {
                let mut todo = t.clone();
                todo.done = true;
                storage::upsert(&todo)?;
                println!("Completed #{}", id);
            }
        }
        Commands::Rn { id } => match storage::delete(id) {
            Ok(i) => println!("Removed #{i}"),
            Err(_) => println!("Id Not Found"),
        },
    }
    Ok(())
}
