use crate::storage::{log_productivity, ProductivityLog};
use active_win_pos_rs::get_active_window;
use chrono::Utc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager, Emitter};

pub struct TrackerState {
    pub is_running: Arc<AtomicBool>,
}

impl TrackerState {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }
}

pub fn start_tracking(handle: AppHandle) {
    let is_running = handle.state::<TrackerState>().is_running.clone();
    if is_running.load(Ordering::SeqCst) {
        return;
    }
    is_running.store(true, Ordering::SeqCst);

    tauri::async_runtime::spawn(async move {
        let mut last_window = String::new();
        let mut start_time = Utc::now().timestamp();

        loop {
            if !is_running.load(Ordering::SeqCst) {
                break;
            }

            // Get active window
            let current_window = match get_active_window() {
                Ok(win) => win.title,
                Err(_) => "Unknown".to_string(),
            };

            // Get idle time on Mac
            let idle_time = get_idle_time();

            // Categorize
            let activity_type = categorize_activity(&current_window, idle_time);

            // Log if window changed or 1 minute passed
            let now = Utc::now().timestamp();
            if current_window != last_window || (now - start_time) >= 60 {
                let log = ProductivityLog {
                    id: None,
                    timestamp: now,
                    window_title: current_window.clone(),
                    activity_type: activity_type.to_string(),
                    duration: (now - start_time) as u32,
                };

                let _ = log_productivity(log);
                
                // Emit update to frontend
                let _ = handle.emit("productivity-update", activity_type);
                
                last_window = current_window;
                start_time = now;
            }

            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    });
}

fn get_idle_time() -> f64 {
    // Use shell command to get idle time on macOS accurately
    let output = std::process::Command::new("ioreg")
        .args(["-c", "IOHIDSystem"])
        .output()
        .ok();

    if let Some(out) = output {
        let s = String::from_utf8_lossy(&out.stdout);
        if let Some(line) = s.lines().find(|l| l.contains("HIDIdleTime")) {
            if let Some(val_str) = line.split('=').last() {
                if let Ok(nanos) = val_str.trim().parse::<f64>() {
                    return nanos / 1_000_000_000.0;
                }
            }
        }
    }
    0.0
}

fn categorize_activity(window_title: &str, idle_time: f64) -> &'static str {
    if idle_time > 300.0 {
        return "Not Working";
    }

    let productive_apps = ["Visual Studio Code", "Xcode", "Terminal", "iTerm", "RustRover", "IntelliJ IDEA"];
    let slow_apps = ["YouTube", "Netflix", "Facebook", "Twitter", "Reddit", "Discord", "Slack"];

    for app in productive_apps {
        if window_title.contains(app) {
            return "Productive";
        }
    }

    for app in slow_apps {
        if window_title.contains(app) {
            return "Slow";
        }
    }

    "Productive" // Default to productive for unknown work apps or just general use
}
