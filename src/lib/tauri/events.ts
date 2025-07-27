import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

export type MenuEvent = 'new' | 'open' | 'save' | 'save_as';

export interface MenuEventPayload {
    action: MenuEvent;
}

export class TauriEvents {
    private static listeners: Map<string, UnlistenFn> = new Map();

    static async listenToMenuEvents(callback: (event: MenuEvent) => void): Promise<UnlistenFn> {
        const unlisten = await listen<MenuEvent>('menu-event', (event) => {
            callback(event.payload);
        });

        this.listeners.set('menu-events', unlisten);
        return unlisten;
    }

    static async unlistenAll(): Promise<void> {
        for (const [key, unlisten] of this.listeners.entries()) {
            try {
                unlisten();
                this.listeners.delete(key);
            } catch (error) {
                console.warn(`Failed to unlisten ${key}:`, error);
            }
        }
    }

    static async unlisten(key: string): Promise<void> {
        const unlisten = this.listeners.get(key);
        if (unlisten) {
            try {
                unlisten();
                this.listeners.delete(key);
            } catch (error) {
                console.warn(`Failed to unlisten ${key}:`, error);
            }
        }
    }
}

// File operations wrapper
export class FileOperations {
    static async saveFile(content: string, fileType: string = 'html'): Promise<string> {
        try {
            const result = await invoke<string>('save_file', {
                content,
                fileType
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to save file: ${error}`);
        }
    }

    static async openFile(): Promise<{ content: string; file_type: string }> {
        try {
            const result = await invoke<{ content: string; file_type: string }>('open_file');
            return result;
        } catch (error) {
            throw new Error(`Failed to open file: ${error}`);
        }
    }

    static async greet(name: string): Promise<string> {
        try {
            const result = await invoke<string>('greet', { name });
            return result;
        } catch (error) {
            throw new Error(`Failed to greet: ${error}`);
        }
    }
}