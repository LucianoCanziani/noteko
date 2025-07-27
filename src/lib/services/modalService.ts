import { writable } from 'svelte/store';

export interface ConfirmConfig {
    type: 'confirm';
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'info';
    onConfirm: () => void | Promise<void>;
    onCancel: () => void | Promise<void>;
}

export interface SaveAsConfig {
    type: 'saveAs';
    title?: string;
    onSave: (fileType: string) => Promise<void>;
}

export type ModalConfig = ConfirmConfig | SaveAsConfig;

const { subscribe, set } = writable<ModalConfig | null>(null);

export const modalService = {
    subscribe,

    close: () => {
        set(null);
    },

    confirm: (config: Omit<ConfirmConfig, 'type'>): Promise<boolean> => {
        return new Promise((resolve) => {
            const modalConfig: ConfirmConfig = {
                type: 'confirm',
                ...config,
                onConfirm: async () => {
                    try {
                        await config.onConfirm();
                        resolve(true);
                    } catch (error) {
                        console.error('❌ Confirm error:', error);
                        resolve(false);
                    }
                    modalService.close();
                }
            };
            set(modalConfig);
        });
    },

    saveAs: (config: Omit<SaveAsConfig, 'type'>): Promise<string | null> => {
        return new Promise((resolve) => {
            set({
                type: 'saveAs',
                ...config,
                onSave: async (fileType: string) => {
                    try {
                        await config.onSave(fileType);
                        resolve(fileType);
                    } catch (error) {
                        console.error('❌ Save error:', error);
                        resolve(null);
                    }
                    modalService.close();
                }
            });
        });
    }
};