use once_cell::sync::Lazy;
pub use std::{
    collections::hash_map::HashMap,
    sync::atomic::Ordering,
    sync::{Arc, Mutex},
    thread, time,
};

use inputbot::{KeybdKey, MouseButton};
use winapi::{
    // um::winuser::mouse_event, um::winuser::MOUSEEVENTF_LEFTDOWN, um::winuser::MOUSEEVENTF_LEFTUP,
    um::winuser::MOUSEEVENTF_MOVE,
};

type F = Arc<dyn Fn() + Send + Sync + 'static>;

type KeybdBindMap = HashMap<KeybdKey, F>;
type MouseBindMap = HashMap<MouseButton, F>;

type TKeybdBinds = Lazy<Mutex<KeybdBindMap>>;
type TMouseBinds = Lazy<Mutex<MouseBindMap>>;
static KEYBD_BINDS: TKeybdBinds = Lazy::new(|| Mutex::new(KeybdBindMap::new()));
static MOUSE_BINDS: TMouseBinds = Lazy::new(|| Mutex::new(MouseBindMap::new()));

fn get_keybd_key(key: &str) -> Option<KeybdKey> {
    match key {
        "Backquote" => Some(KeybdKey::BackquoteKey),
        "F1" => Some(KeybdKey::F1Key),
        "Numpad0" => Some(KeybdKey::Numpad0Key),
        "Numpad1" => Some(KeybdKey::Numpad1Key),
        "Numpad2" => Some(KeybdKey::Numpad2Key),
        "Numpad3" => Some(KeybdKey::Numpad3Key),
        "Numpad4" => Some(KeybdKey::Numpad4Key),
        "Numpad5" => Some(KeybdKey::Numpad5Key),
        "Numpad6" => Some(KeybdKey::Numpad6Key),
        "Numpad7" => Some(KeybdKey::Numpad7Key),
        "Numpad8" => Some(KeybdKey::Numpad8Key),
        "Numpad9" => Some(KeybdKey::Numpad9Key),
        "Add" => Some(KeybdKey::AddKey),
        "Equal" => Some(KeybdKey::EqualKey),
        "Minus" => Some(KeybdKey::MinusKey),
        "Subtract" => Some(KeybdKey::SubtractKey),
        "Shift" => Some(KeybdKey::ShiftKey),
        "LShift" => Some(KeybdKey::LShiftKey),
        "RShift" => Some(KeybdKey::RShiftKey),
        "Control" => Some(KeybdKey::ControlKey),
        "LControl" => Some(KeybdKey::LControlKey),
        "RControl" => Some(KeybdKey::RControlKey),
        "Alt" => Some(KeybdKey::AltKey),
        "LAlt" => Some(KeybdKey::LAltKey),
        "RAlt" => Some(KeybdKey::RAltKey),
        _ => None,
    }
}

// fn get_event_key(key: KeybdKey) -> &'static str {
//     match key {
//         KeybdKey::BackquoteKey => "BackquoteKey",
//         KeybdKey::F1Key => "F1Key",
//         KeybdKey::Numpad0Key => "Numpad0Key",
//         KeybdKey::Numpad1Key => "Numpad1Key",
//         KeybdKey::Numpad2Key => "Numpad2Key",
//         KeybdKey::Numpad3Key => "Numpad3Key",
//         KeybdKey::Numpad4Key => "Numpad4Key",
//         KeybdKey::Numpad5Key => "Numpad5Key",
//         KeybdKey::Numpad6Key => "Numpad6Key",
//         KeybdKey::Numpad7Key => "Numpad7Key",
//         KeybdKey::Numpad8Key => "Numpad8Key",
//         KeybdKey::Numpad9Key => "Numpad9Key",
//         KeybdKey::AddKey => "AddKey",
//         KeybdKey::EqualKey => "EqualKey",
//         KeybdKey::MinusKey => "MinusKey",
//         KeybdKey::SubtractKey => "SubtractKey",
//         KeybdKey::LShiftKey => "LShiftKey",
//         KeybdKey::RShiftKey => "RShiftKey",
//         KeybdKey::LControlKey => "LControlKey",
//         KeybdKey::RControlKey => "RControlKey",
//         KeybdKey::LAltKey => "LAltKey",
//         KeybdKey::RAltKey => "RAltKey",
//         _ => "none",
//     }
// }

fn get_mouse_key(key: &str) -> Option<MouseButton> {
    match key {
        "LeftButton" => Some(MouseButton::LeftButton),
        "RightButton" => Some(MouseButton::RightButton),
        "MiddleButton" => Some(MouseButton::MiddleButton),
        _ => None,
    }
}

fn add_callback(name_key: &str, ac_callback: F) {
    
    fn ac(odd_callback: &F, ac_callback: &F) -> F {
        let odd_callback = Arc::clone(odd_callback);
        let ac_callback = Arc::clone(ac_callback);
        return Arc::new(move || {
            odd_callback();
            ac_callback();
        })
    }

    if let Some(keybd_key) = { get_keybd_key(name_key) } {
        let mut keybd_binds = KEYBD_BINDS.lock().unwrap();
        
        let new_callback = match keybd_binds.get(&keybd_key) {
            Some(odd_callback) => ac(odd_callback, &ac_callback),
            None => Arc::clone(&ac_callback),
        };
        
        keybd_binds.insert(keybd_key, new_callback);
    } else if let Some(keybd_key) = { get_mouse_key(name_key) } {
        let mut keybd_binds = MOUSE_BINDS.lock().unwrap();
        
        let new_callback = match keybd_binds.get(&keybd_key) {
            Some(odd_callback) => ac(odd_callback, &ac_callback),
            None => Arc::clone(&ac_callback),
        };
        
        keybd_binds.insert(keybd_key, new_callback);
    }
}

pub fn bind_key(window: tauri::Window, name_key: String) {
    let parts = name_key.split("_");

    let count = parts.clone().count();

    let last = parts.clone().last().unwrap_or("");

    let e: String = format!("press{name_key}");

    match count {
        1 => {
            let ac = |event: String| -> F {
                return Arc::new(move || {
                    window.emit(&event, "").unwrap();
                });
            };
    
            add_callback(&name_key, ac(e));
        },
        2 => {
            let ac = |event: String, second_key: KeybdKey| -> F {
                return Arc::new(move || {
                    if second_key.is_pressed() {
                        window.emit(&event, "").unwrap();
                    }
                });
            };

            let second_key = get_keybd_key(parts.clone().nth(0).unwrap_or_default()).unwrap();
    
            add_callback(last, ac(e, second_key));
        },
        3 => {
            let ac = |event: String, second_key: KeybdKey, third_key: KeybdKey| -> F {
                return Arc::new(move || {
                    if second_key.is_pressed() && third_key.is_pressed() {
                        window.emit(&event, "").unwrap();
                    }
                });
            };
    
            let second_key = get_keybd_key(parts.clone().nth(0).unwrap_or_default()).unwrap();
            let third_key = get_keybd_key(parts.clone().nth(1).unwrap_or_default()).unwrap();
    
            add_callback(last, ac(e, second_key, third_key));
        },
        _ => ()
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    pressed: u32,
}

pub fn bind_hold_key(window: tauri::Window, name_key: String) {
    let e: String = format!("hold{name_key}");

    if let Some(keybd_key) = { get_keybd_key(&name_key) } {
        let ac = |event: String, hold_key: KeybdKey| -> F {
            return Arc::new(move || {
                window.emit(&event, Payload { pressed: 1 }).unwrap();
                thread::sleep(time::Duration::from_millis(10));
                while hold_key.is_pressed() {
                    window.emit(&event, Payload { pressed: 1 }).unwrap();
                    thread::sleep(time::Duration::from_millis(10));
                }
            });
        };
        add_callback(&name_key, ac(e, keybd_key));
    } else if let Some(keybd_key) = { get_mouse_key(&name_key) } {
        let ac = |event: String, hold_key: MouseButton| -> F {
            return Arc::new(move || {
                window.emit(&event, Payload { pressed: 1 }).unwrap();
                thread::sleep(time::Duration::from_millis(10));
                while hold_key.is_pressed() {
                    window.emit(&event, Payload { pressed: 1 }).unwrap();
                    thread::sleep(time::Duration::from_millis(10));
                }
            });
        };
        add_callback(&name_key, ac(e, keybd_key));
    }
}

pub fn active_handle() {
    let mouse_binds = MOUSE_BINDS.lock().unwrap();
    if !mouse_binds.is_empty() {
        for (key, cl) in mouse_binds.iter() {
            let cl = Arc::clone(cl);
            key.bind(move || cl());
        }
    }
    let keybd_binds = KEYBD_BINDS.lock().unwrap();
    if !keybd_binds.is_empty() {
        for (key, cl) in keybd_binds.iter() {
            let cl = Arc::clone(cl);
            key.bind(move || cl());
        }
    }
    inputbot::handle_input_events();
}

pub fn mouse_move(sensitivity: i32, times: u64, rate: u64) -> bool {
    let mut index = 1;
    while index <= times {
        inputbot::send_mouse_input(MOUSEEVENTF_MOVE, 0, 0, sensitivity);
        thread::sleep(time::Duration::from_millis(rate));
        index += 1;
    }
    return true;
}

pub fn mouse_click(times: u64, rate: u64) -> bool {
    let mut index = 1;
    while index <= times {
        MouseButton::LeftButton.press();
        thread::sleep(time::Duration::from_millis(20));
        MouseButton::LeftButton.release();
        thread::sleep(time::Duration::from_millis(rate));
        index += 1;
    }
    return true;
}
