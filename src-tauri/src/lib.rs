use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::mpsc;
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::Emitter;

mod converters;

// ===== STRUCTS =====

#[derive(Debug, Serialize, Deserialize)]
struct FileContent {
    content: String,
    file_path: Option<String>,
    file_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SaveResult {
    file_path: String,
    file_name: String,
}

// ===== UTILITY FUNCTIONS =====

fn get_file_name_from_path(path: &PathBuf) -> String {
    path.file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

fn show_save_dialog(
    app_handle: &tauri::AppHandle,
    extension: &str,
    filter_name: &str,
) -> Result<Option<PathBuf>, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = mpsc::channel();

    app_handle
        .dialog()
        .file()
        .add_filter(filter_name, &[extension])
        .set_file_name(&format!("note.{}", extension))
        .save_file(move |file_path| {
            let _ = tx.send(file_path);
        });

    match rx.recv() {
        Ok(Some(path)) => path
            .into_path()
            .map(Some)
            .map_err(|e| format!("Failed to convert path: {}", e)),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

fn show_open_dialog(app_handle: &tauri::AppHandle) -> Result<Option<PathBuf>, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = mpsc::channel();

    app_handle
        .dialog()
        .file()
        .add_filter("All Supported", &["html", "txt"])
        .add_filter("HTML Files", &["html"])
        .add_filter("Text Files", &["txt"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });

    match rx.recv() {
        Ok(Some(path)) => path
            .into_path()
            .map(Some)
            .map_err(|e| format!("Failed to convert path: {}", e)),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

// ===== TAURI COMMANDS =====

#[tauri::command]
async fn save_file(
    content: String,
    file_path: String,
    file_type: String,
) -> Result<String, String> {
    if file_path.is_empty() {
        return Err("No file path provided".to_string());
    }

    let converted_content = match file_type.as_str() {
        "html" => content,
        "txt" => converters::html_to_text(&content),
        _ => return Err("Unsupported file type".to_string()),
    };

    let path_buf = PathBuf::from(&file_path);
    std::fs::write(&path_buf, converted_content)
        .map(|_| format!("File saved successfully: {}", path_buf.display()))
        .map_err(|e| format!("Failed to save file: {}", e))
}

#[tauri::command]
async fn save_file_as(
    content: String,
    file_type: String,
    app_handle: tauri::AppHandle,
) -> Result<SaveResult, String> {
    let converted_content = match file_type.as_str() {
        "html" => content,
        "txt" => converters::html_to_text(&content),
        _ => return Err("Unsupported file type".to_string()),
    };

    let (extension, filter_name) = match file_type.as_str() {
        "html" => ("html", "HTML Files"),
        "txt" => ("txt", "Text Files"),
        _ => return Err("Unsupported file type".to_string()),
    };

    match show_save_dialog(&app_handle, extension, filter_name)? {
        Some(path_buf) => {
            std::fs::write(&path_buf, converted_content)
                .map_err(|e| format!("Failed to save file: {}", e))?;

            Ok(SaveResult {
                file_path: path_buf.to_string_lossy().to_string(),
                file_name: get_file_name_from_path(&path_buf),
            })
        }
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
async fn open_file(app_handle: tauri::AppHandle) -> Result<FileContent, String> {
    match show_open_dialog(&app_handle)? {
        Some(path_buf) => {
            let extension = path_buf
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("")
                .to_lowercase();

            let file_name = get_file_name_from_path(&path_buf);
            let content = std::fs::read_to_string(&path_buf)
                .map_err(|e| format!("Failed to read file: {}", e))?;

            let html_content = match extension.as_str() {
                "html" => content,
                "txt" => converters::text_to_html(&content),
                _ => content,
            };

            Ok(FileContent {
                content: html_content,
                file_path: Some(path_buf.to_string_lossy().to_string()),
                file_name: Some(file_name),
            })
        }
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
async fn open_file_location(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &file_path])
            .spawn()
            .map_err(|e| format!("Failed to open and select file: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &file_path])
            .spawn()
            .map_err(|e| format!("Failed to open and select file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Intentar con diferentes gestores de archivos comunes
        let managers = ["nautilus", "dolphin", "thunar", "nemo"];
        let mut success = false;

        for manager in &managers {
            if let Ok(_) = std::process::Command::new(manager)
                .args(["--select", &file_path])
                .spawn()
            {
                success = true;
                break;
            }
        }

        // Si ningún gestor funcionó, abrir solo la carpeta
        if !success {
            let parent_dir = path.parent().ok_or("Could not get parent directory")?;
            std::process::Command::new("xdg-open")
                .arg(parent_dir)
                .spawn()
                .map_err(|e| format!("Failed to open folder: {}", e))?;
        }
    }

    Ok(())
}

#[tauri::command]
fn handle_menu_event(item: String) {
    println!("Menu item clicked: {}", item);
}

// ===== APP SETUP =====

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            handle_menu_event,
            save_file,
            save_file_as,
            open_file,
            open_file_location
        ])
        .setup(|app| {
            let new_item = MenuItem::with_id(app, "new", "New", true, None::<&str>)?;
            let open_item = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let save_item = MenuItem::with_id(app, "save", "Save", true, None::<&str>)?;
            let save_as_item = MenuItem::with_id(app, "save_as", "Save As...", true, None::<&str>)?;

            let file_menu = Submenu::with_id_and_items(
                app,
                "file",
                "File",
                true,
                &[&new_item, &open_item, &save_item, &save_as_item],
            )?;

            let menu = Menu::with_items(app, &[&file_menu])?;
            app.set_menu(menu)?;

            // Handle menu events
            app.on_menu_event(move |app, event| match event.id.as_ref() {
                "new" => {
                    let _ = app.emit("menu-event", "new");
                }
                "open" => {
                    let _ = app.emit("menu-event", "open");
                }
                "save" => {
                    let _ = app.emit("menu-event", "save");
                }
                "save_as" => {
                    let _ = app.emit("menu-event", "save_as");
                }
                _ => {}
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
