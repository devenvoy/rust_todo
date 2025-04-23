# TODO CLI 
```
rust_todo
├─ Cargo.lock
├─ Cargo.toml
├─ README.md
└─ src
   ├─ main.rs
   ├─ storage
   │  └─ mod.rs
   └─ todo_model
      └─ mod.rs

```

| Concept | Where it showed up | Why it matters |
|---------|-------------------|----------------|
| **`cargo new`, `cargo add`, workspaces** | Project scaffolding, adding `clap`, `serde`, etc. | Teaches the *Cargo* build system, dependency resolution, and semantic-versioning. |
| **Modules & Crates** (`mod` files) | `model.rs`, `storage.rs`, `main.rs` | Keeps code organized; introduces Rust’s privacy rules (`pub`). |
| **Structs** | `Todo { id, text, done }` | Basic data-shaping; foundation for ownership/borrowing. |
| **Enums & Pattern Matching** | `Commands` enum + `match cli.command { … }` | Idiomatic control flow and exhaustive compile-time checking. |
| **Traits & Derive Macros** | `#[derive(Serialize, Deserialize, Debug, Clone)]` | Zero-boilerplate implementations of common behavior. |
| **Ownership & Borrowing** | `for t in &todos`, `save(&todos)` | Core safety guarantee—no data races, no use-after-free. |
| **Immutability vs Mutability** | `let mut todos` vs `for t in &todos` | Clear intent; compiler enforces rules. |
| **Lifetimes (implicit)** | Passing slices/references across functions | You feel them when the compiler asks for `&` or `mut`. |
| **Error Handling with `Result` and `?`** | `storage::load()?`, `serde_json::from_str` | Propagates errors succinctly; no exceptions. |
| **Std IO & Filesystem** | `fs::read_to_string`, `fs::write` | Shows how Rust wraps system calls safely. |
| **Third-party Crates** (`clap`, `serde`, `dirs_next`, `anyhow`) | CLI parsing, JSON, platform paths, rich errors | Demonstrates Rust’s ecosystem and trait-based design. |
| **Macros** (`println!`, `format!`, `clap` derives) | All formatted output and CLI declarations | Compile-time string-format checks; DRY code. |
| **Iterators** | `todos.iter()`, `retain`, `map().max()` | Functional style without extra allocations. |
| **Generics & Trait Bounds** (light) | `save(todos: &[Todo])` uses `AsRef<[u8]>` internally | First taste of zero-cost abstractions. |
| **Testing** | `cargo test` scaffolding for unit tests | Cultural norm: test early, test often. |
| **Tooling** (`cargo fmt`, `clippy`, `rust-analyzer`) | Auto-format, lint, inline diagnostics | Enforces style and catches mistakes at dev-time. |
| **Compile-time Docs** | `cargo doc --open` | Rustdoc hyperlinks every item; encourages writing comments. |
| **Release Builds & Binaries** | `cargo build --release` (~2 MB exe) | Shows LLVM optimizations and static linking. |


<br><br><br><br>


| Piece | What it does | Why it matters |
|--------------|----------|----------------|
| **`for t in &todos`** | todos is a Vec<Todo>. The **`&`** borrows it immutably, giving the loop read-only access. <br>Rust desugars this to `for t in (&todos).into_iter();` Vec’s iterator yields `&Todo` by default, so each **`t`** is a reference `(&Todo)`. | Borrowing avoids moving the vector into the loop, letting other code use todos later. |
| **`"[{}] {:>3} {}"`** | The format string, like `printf`, but type-safe:  <br>• `{}` inserts its argument with the Display trait. <br>• `{:>3}` means “format the next argument right-aligned in a field 3 characters wide.” | The field width keeps the IDs vertically aligned even when you hit double-digit task numbers. |
| `if t.done {"❌"} else {" "}` | Inline if expression (Rust has no ternary `? :`). Returns a string slice of the red-cross emoji if the task is complete, otherwise a single space. | Because it’s an expression, the whole if fits inside the argument list—no semicolon needed.|
|**`t.id`** | `u32` **ID** printed in that `{:>3}` slot. | Using numeric IDs makes it easy to reference tasks in other commands (done 3, rm 3). |
| **`t.content`** | The actual task text. | content (or text—name it as you like) implements Display because String does. |