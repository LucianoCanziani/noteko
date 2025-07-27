import { invoke } from "@tauri-apps/api/core";
import { modalService } from "./modalService";
import { notesStore, notesActions } from "lib/stores/notesStore";
import type { NotesState } from "lib/stores/notesStore";

export interface FileResult {
    content: string;
    file_path?: string;
    file_name?: string;
}

export interface SaveResult {
    file_path: string;
    file_name: string;
}

export class FileService {
    private static currentState: NotesState;

    static {
        notesStore.subscribe((state: NotesState) => {
            this.currentState = state;
        });
    }

    /**
     * Resets editor
     * Checks for unsaved changes and asks user to save if necessary
     */
    static async newFile(editor?: HTMLDivElement): Promise<void> {
        if (this.currentState?.isModified) {
            const shouldSave = await modalService.confirm({
                title: "Unsaved Changes",
                message: "You have unsaved changes. Do you want to save them first?",
                confirmText: "Save & Continue",
                cancelText: "Discard Changes",
                variant: "warning",
                onConfirm: async () => {
                    if (this.currentState.currentFilePath) {
                        await this.saveToExistingFile();
                    } else {
                        await this.saveFileAs();
                    }
                    this.createNewNote(editor);
                },
                onCancel: async () => {
                    this.createNewNote(editor);
                },
            });

            if (!shouldSave) {
                this.createNewNote(editor);
            }
        } else {
            this.createNewNote(editor);
        }
    }

    /**
     * Opens a file 
     * Checks for unsaved changes and asks user to save if necessary
     * After that, it opens the file opener with this.runFileOpener()
     */
    static async openFile(editor?: HTMLDivElement): Promise<void> {
        if (this.currentState?.isModified) {
            await modalService.confirm({
                title: "Unsaved Changes",
                message: "You have unsaved changes. Do you want to save them first?",
                confirmText: "Save & Open",
                cancelText: "Discard & Open",
                variant: "warning",
                onConfirm: async () => {
                    if (this.currentState.currentFilePath) {
                        await this.saveToExistingFile();
                    } else {
                        await this.saveFileAs();
                    }
                    await this.runFileOpener(editor);
                },
                onCancel: async () => {
                    await this.runFileOpener(editor);
                },
            });
        } else {
            await this.runFileOpener(editor);
        }
    }

    // Opens the search folder to select a file
    private static async runFileOpener(editor?: HTMLDivElement): Promise<void> {
        try {
            notesActions.setLoading(true);
            const result = await this.openFileDialog();

            if (result) {
                const fileType = this.detectFileType(result.file_path || "");

                notesActions.setCurrentFile(
                    result.file_path || "",
                    result.file_name || "",
                    result.content,
                    fileType
                );

                if (editor) {
                    editor.innerHTML = result.content;
                }

                if (result.file_path) {
                    const fileName = this.extractFileName(result.file_path);
                    notesActions.addToRecentFiles(result.file_path, fileName);
                }
            }
        } catch (error) {
            console.error("Failed to open file:", error);
            await this.handleFileError(error, "Open File");
        } finally {
            notesActions.setLoading(false);
        }
    }

    /**
     * Saves the current file
     */
    static async saveFile(): Promise<void> {
        if (!this.currentState?.currentContent.trim()) {
            return;
        }

        try {
            if (this.currentState.currentFilePath) {
                await this.saveToExistingFile();
            } else {
                await this.saveFileAs();
            }
        } catch (error) {
            console.error("Failed to save file:", error);
            await this.handleFileError(error, "Save File");
        }
    }

    /**
     * Saves current file as a new file
     * It allows to select the file type
     */
    static async saveFileAs(): Promise<void> {
        if (!this.currentState?.currentContent.trim()) {
            return;
        }

        try {
            const selectedFormat = await modalService.saveAs({
                title: "Save As",
                onSave: async (fileType: string) => {
                    await this.saveAsNewFile(fileType);
                },
            });

            if (selectedFormat) {
                console.log(`File saved as ${selectedFormat}`);
            }
        } catch (error) {
            console.error("Save As cancelled or failed:", error);
            throw error;
        }
    }

    /**
     * New note!
     */
    private static createNewNote(editor?: HTMLDivElement): void {
        notesActions.clearDocument();
        if (editor) {
            editor.innerHTML = "";
            editor.focus();
        }
    }

    /**
     * File Dialog
     */
    private static async openFileDialog(): Promise<FileResult | null> {
        try {
            const result = await invoke("open_file");

            if (result && typeof result === "object" && "content" in result) {
                return result as FileResult;
            }

            return null;
        } catch (error) {
            console.error("Failed to open file:", error);
            throw new Error(`Failed to open file: ${error}`);
        }
    }

    /**
     * Saves to existing file
     */
    private static async saveToExistingFile(): Promise<void> {
        if (!this.currentState) return;

        try {
            notesActions.setLoading(true);
            await this.saveFileToPath(
                this.currentState.currentContent,
                this.currentState.currentFilePath,
                this.currentState.currentFileType
            );
            notesActions.markAsSaved();
        } catch (error) {
            console.error("Failed to save file:", error);
            await this.handleFileError(error, "Save File");
            throw error;
        } finally {
            notesActions.setLoading(false);
        }
    }

    /**
     * Saves as new file
     */
    private static async saveAsNewFile(fileType: string): Promise<void> {
        if (!this.currentState?.currentContent.trim()) {
            return;
        }

        try {
            notesActions.setLoading(true);
            const result = await this.saveFileAsDialog(
                this.currentState.currentContent,
                fileType
            );

            notesActions.setCurrentFile(
                result.file_path,
                result.file_name,
                this.currentState.currentContent,
                fileType
            );

            notesActions.addToRecentFiles(result.file_path, result.file_name);
            notesActions.markAsSaved();
        } catch (error) {
            console.error("Failed to save file:", error);
            await this.handleFileError(error, "Save File As");
            throw error;
        } finally {
            notesActions.setLoading(false);
        }
    }

    /**
     * Save file to specific path
     */
    private static async saveFileToPath(
        content: string,
        filePath: string,
        fileType: string
    ): Promise<void> {
        try {
            await invoke("save_file", {
                content,
                filePath,
                fileType,
            });
        } catch (error) {
            console.error("Failed to save file:", error);
            throw new Error(`Failed to save file: ${error}`);
        }
    }

    /**
     * Save file as dialog
     */
    private static async saveFileAsDialog(
        content: string,
        fileType: string
    ): Promise<SaveResult> {
        try {
            const result = await invoke("save_file_as", {
                content,
                fileType,
            });

            if (result && typeof result === "object" && "file_path" in result) {
                return result as SaveResult;
            }

            throw new Error("Invalid save result");
        } catch (error) {
            console.error("Failed to save file as:", error);
            throw new Error(`Failed to save file: ${error}`);
        }
    }

    /**
     * Detects file type
     */
    static detectFileType(filePath: string): string {
        if (!filePath) return "html";

        const extension = filePath.split(".").pop()?.toLowerCase();

        switch (extension) {
            case "txt":
                return "txt";
            default:
                return "html";
        }
    }

    /**
     * Extracts filename from path
     */
    static extractFileName(filePath: string): string {
        if (!filePath) return "Untitled";
        return filePath.split("/").pop() || "Untitled";
    }

    /**
     * Handles file errors with modals
     */
    static async handleFileError(error: unknown, operation: string): Promise<void> {
        const message = error instanceof Error ? error.message : String(error);

        await modalService.confirm({
            title: `${operation} Error`,
            message: `Failed to ${operation.toLowerCase()}: ${message}`,
            confirmText: "OK",
            variant: "danger",
            onConfirm: () => { },
            onCancel: () => { },
        });
    }
}