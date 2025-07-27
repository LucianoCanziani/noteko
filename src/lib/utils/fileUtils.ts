// src/lib/utils/fileUtils.ts
import type { FileType, SaveOption } from '../types';

export class FileUtils {
    static readonly SAVE_OPTIONS: SaveOption[] = [
        {
            type: 'html',
            title: 'HTML',
            description: 'Web format with full formatting',
            icon: '🌐'
        },
        {
            type: 'txt',
            title: 'Plain Text',
            description: 'Simple text without formatting',
            icon: '📄'
        }
    ];

    static getFileExtension(filePath: string): string {
        const parts = filePath.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }

    static getFileName(filePath: string): string {
        const parts = filePath.split(/[/\\]/);
        return parts[parts.length - 1];
    }

    static getFileNameWithoutExtension(filePath: string): string {
        const fileName = this.getFileName(filePath);
        const lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
    }

    static getFileTypeFromExtension(extension: string): FileType {
        switch (extension.toLowerCase()) {
            case 'html':
            case 'htm':
                return 'html';
            case 'txt':
            default:
                return 'txt';
        }
    }

    static getDefaultExtension(fileType: FileType): string {
        switch (fileType) {
            case 'html':
                return 'html';
            case 'txt':
            default:
                return 'txt';
        }
    }

    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isTextFile(filePath: string): boolean {
        const extension = this.getFileExtension(filePath);
        const textExtensions = ['txt', 'html', 'htm', 'json', 'xml', 'csv'];
        return textExtensions.includes(extension);
    }

    static generateFileName(content: string, fileType: FileType): string {
        // Extract title from content or use timestamp
        const lines = content.split('\n').filter(line => line.trim());
        let title = '';

        if (lines.length > 0) {
            // Try to extract title from first line (remove HTML tags if present)
            title = lines[0].replace(/<[^>]*>/g, '').trim();

            // Limit title length and clean it for filename
            title = title.substring(0, 50)
                .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase();
        }

        if (!title) {
            // Fallback to timestamp
            const now = new Date();
            title = `note_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
        }

        const extension = this.getDefaultExtension(fileType);
        return `${title}.${extension}`;
    }

    static validateFileName(fileName: string): boolean {
        // Check for invalid characters in filename
        const invalidChars = /[<>:"/\\|?*]/;
        return !invalidChars.test(fileName) && fileName.trim().length > 0;
    }

    static sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .trim();
    }

    static isRecentFile(filePath: string, recentFiles: string[]): boolean {
        return recentFiles.includes(filePath);
    }

    static formatLastModified(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
            }
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    static createBackupFileName(originalPath: string): string {
        const extension = this.getFileExtension(originalPath);
        const nameWithoutExt = this.getFileNameWithoutExtension(originalPath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        return `${nameWithoutExt}_backup_${timestamp}.${extension}`;
    }
}