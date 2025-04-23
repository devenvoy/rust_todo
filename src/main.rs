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
    let mut todos = storage::load()?;

    match cli.command {
        Commands::Add { text } => {
            let id = todos.iter().map(|t| t.id).max().unwrap_or(0) + 1;
            todos.push(Todo {
                id,
                content: text,
                done: false,
            });
            println!("Added #{id}");
        }
        Commands::List => {
            for t in &todos {
                println!(
                    "[{}] {:>3} {}",
                    if t.done { "❌" } else { " " },
                    t.id,
                    t.content
                );
            }
        }
        Commands::Done { id } => {
            if let Some(t) = todos.iter_mut().find(|t| t.id == id) {
                t.done = true;
                println!("Completed #{id}");
            }
        }
        Commands::Rn { id } => {
            todos.retain(|t| t.id != id);
            println!("Rmoved #{id}");
        }
    }
    storage::save(&todos)?;
    Ok(())
}
