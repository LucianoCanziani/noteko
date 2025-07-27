import { writable } from 'svelte/store';

export interface FileInfo {
    path: string;
    name: string;
    lastModified: Date;
}

export interface NotesState {
    currentContent: string;
    currentFilePath: string;
    currentFileName: string;
    currentFileType: string;
    isModified: boolean;
    recentFiles: FileInfo[];
    selectedNoteId: string | null;
}

const initialState: NotesState = {
    currentContent: '',
    currentFileName: '',
    currentFilePath: '',
    currentFileType: 'html',
    isModified: false,
    recentFiles: [],
    selectedNoteId: null
};

export const notesStore = writable<NotesState>(initialState);

export const notesActions = {
    setContent: (content: string) => {
        notesStore.update(state => ({
            ...state,
            currentContent: content,
            isModified: true
        }));
    },


    setCurrentFile: (path: string, fileName: string, content: string, fileType?: string) => {

        let detectedType = fileType;
        if (!detectedType && path) {
            const extension = path.split('.').pop()?.toLowerCase();
            detectedType = extension === 'txt' ? 'txt' :
                'html';
        }

        notesStore.update(state => ({
            ...state,
            currentFilePath: path,
            currentFileName: fileName,
            currentContent: content,
            currentFileType: detectedType || 'html',
            isModified: false
        }));
    },

    markAsModified: () => {
        notesStore.update(state => ({
            ...state,
            isModified: true
        }));
    },

    markAsSaved: () => {
        notesStore.update(state => ({
            ...state,
            isModified: false
        }));
    },

    clearDocument: () => {
        notesStore.update(state => ({
            ...state,
            currentContent: '',
            currentFilePath: '',
            currentFileName: '',
            currentFileType: 'html',
            isModified: false
        }));
    },

    setLoading: (loading: boolean) => {
        notesStore.update(state => ({
            ...state
        }));
    },

    addToRecentFiles: (path: string, name: string) => {
        notesStore.update(state => {
            const existing = state.recentFiles.findIndex(f => f.path === path);
            let newRecentFiles = [...state.recentFiles];

            if (existing >= 0) {
                newRecentFiles.splice(existing, 1);
            }

            newRecentFiles.unshift({
                path,
                name,
                lastModified: new Date()
            });

            // Keep only last 30 files
            newRecentFiles = newRecentFiles.slice(0, 30);

            return {
                ...state,
                recentFiles: newRecentFiles
            };
        });
    },

    loadRecentFiles: async () => {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('notes-recent-files');
                if (stored) {
                    const files = JSON.parse(stored);
                    notesStore.update(state => ({
                        ...state,
                        recentFiles: files.map((f: any) => ({
                            ...f,
                            lastModified: new Date(f.lastModified)
                        }))
                    }));
                }
            }
        } catch (error) {
            console.warn('Failed to load recent files:', error);
        }
    },

    saveRecentFiles: () => {
        const unsubscribe = notesStore.subscribe(state => {
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('notes-recent-files', JSON.stringify(state.recentFiles));
                }
            } catch (error) {
                console.warn('Failed to save recent files:', error);
            }
        });

        return unsubscribe;
    }
};