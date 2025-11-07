// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod services;

use services::supabase_service::SupabaseService;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Add command handlers here
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

