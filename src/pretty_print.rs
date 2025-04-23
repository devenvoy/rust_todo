use comfy_table::{Cell,Color, Row, Table, presets::UTF8_FULL};
use owo_colors::OwoColorize;
use textwrap::wrap;

use crate::todo_model::Todo;

pub fn print_table(todos: &[Todo]) {
    let mut table = Table::new();
    table.load_preset(UTF8_FULL).set_header(Row::from(vec![
        Cell::new("ID")
            .fg(Color::Yellow)
            .add_attribute(comfy_table::Attribute::Bold),
        Cell::new("Task").fg(Color::Cyan),
        Cell::new("Done").fg(Color::Magenta),
    ]));

    for t in todos {
        let status_cell = if t.done {
            Cell::new("✅")
        } else {
            Cell::new("  ").fg(Color::Red)
        };
        let wrapped = wrap(&t.content, 50).join("\n");
        table.add_row(Row::from(vec![
            Cell::new(t.id.unwrap_or(0)).fg(Color::Yellow),
            Cell::new(&wrapped), 
            status_cell,
        ]));
    }
    println!("{table}");
}

pub fn success(msg: &str) {
    println!("{}", msg.green());
}
pub fn warning(msg: &str) {
    println!("{}", msg.yellow());
}
pub fn error(msg: &str) {
    println!("{}", msg.red());
}
