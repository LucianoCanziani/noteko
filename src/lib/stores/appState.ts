import { writable } from 'svelte/store';

interface AppState {
    noteContent: string;
    currentFilePath: string;
    isModified: boolean;
    showSaveModal: boolean;
}

const initialState: AppState = {
    noteContent: "",
    currentFilePath: "",
    isModified: false,
    showSaveModal: false
};

export const appState = writable<AppState>(initialState);

export const appActions = {
    setNoteContent: (content: string) => {
        appState.update(state => ({ ...state, noteContent: content, isModified: true }));
    },

    setCurrentFilePath: (path: string) => {
        appState.update(state => ({ ...state, currentFilePath: path }));
    },

    setModified: (modified: boolean) => {
        appState.update(state => ({ ...state, isModified: modified }));
    },

    showSaveModal: () => {
        appState.update(state => ({ ...state, showSaveModal: true }));
    },

    hideSaveModal: () => {
        appState.update(state => ({ ...state, showSaveModal: false }));
    },

    resetState: () => {
        appState.set(initialState);
    },

    newNote: () => {
        appState.update(state => ({
            ...state,
            noteContent: "",
            currentFilePath: "",
            isModified: false
        }));
    }
};