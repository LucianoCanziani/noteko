export class EditorUtils {
    static formatText(command: string, value?: string): void {
        document.execCommand(command, false, value);
    }

    static insertHTML(html: string): void {
        document.execCommand('insertHTML', false, html);
    }

    static insertHorizontalLine(): void {
        this.insertHTML('<hr>');
    }

    static createLink(): void {
        const url = prompt('Enter URL:');
        if (url) {
            this.formatText('createLink', url);
        }
    }

    static makeTitle(): void {
        this.formatText('formatBlock', 'h1');
    }

    static makeSubtitle(): void {
        this.formatText('formatBlock', 'h2');
    }

    static makeNormalText(): void {
        this.formatText('formatBlock', 'p');
    }

    static bold(): void {
        this.formatText('bold');
    }

    static italic(): void {
        this.formatText('italic');
    }

    static underline(): void {
        this.formatText('underline');
    }

    static alignLeft(): void {
        this.formatText('justifyLeft');
    }

    static alignCenter(): void {
        this.formatText('justifyCenter');
    }

    static alignRight(): void {
        this.formatText('justifyRight');
    }

    static undo(): void {
        this.formatText('undo');
    }

    static redo(): void {
        this.formatText('redo');
    }

    static insertList(ordered: boolean = false): void {
        const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
        this.formatText(command);
    }

    static insertImage(): void {
        const url = prompt('Enter image URL:');
        if (url) {
            this.insertHTML(`<img src="${url}" alt="Image" style="max-width: 100%;">`);
        }
    }

    static insertTable(rows: number = 3, cols: number = 3): void {
        let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';

        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
            }
            tableHTML += '</tr>';
        }

        tableHTML += '</table>';
        this.insertHTML(tableHTML);
    }

    static getSelectedText(): string {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
    }

    static replaceSelectedText(newText: string): void {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
        }
    }

    static focusEditor(editor: HTMLElement): void {
        editor.focus();
    }

    static clearEditor(editor: HTMLElement): void {
        editor.innerHTML = '';
    }

    static getEditorContent(editor: HTMLElement): string {
        return editor.innerHTML;
    }

    static setEditorContent(editor: HTMLElement, content: string): void {
        editor.innerHTML = content;
    }

    static isEditorEmpty(editor: HTMLElement): boolean {
        const content = editor.textContent || editor.innerText || '';
        return content.trim().length === 0;
    }

    static htmlToPlainText(html: string): string {
        // Strip all HTML tags and return plain text
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
}