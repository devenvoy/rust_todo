use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Todo {
    pub id: Option<u32>,
    pub content: String,
    pub done: bool,
}
