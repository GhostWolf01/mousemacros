// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Menu;

pub mod keyword_event;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn mouse_move(sensitivity: i32, times: u64, rate: u64) -> bool {
    return keyword_event::mouse_move(sensitivity, times, rate);
}

#[tauri::command]
async fn mouse_click(times: u64, rate: u64) -> bool {
    return keyword_event::mouse_click(times, rate);
}

#[tauri::command]
async fn bind_key(window: tauri::Window, name_key: String) {
    keyword_event::bind_key(window, name_key);
}

#[tauri::command]
async fn bind_hold_key(window: tauri::Window, name_key: String) {
    keyword_event::bind_hold_key(window, name_key);
}

#[tauri::command]
async fn active_handle() {
    keyword_event::active_handle();
}

fn main() {
    let menu = Menu::new();
    tauri::Builder::default()
        .menu(menu)
        .invoke_handler(tauri::generate_handler![
            bind_key,
            bind_hold_key,
            mouse_move,
            mouse_click,
            active_handle
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
