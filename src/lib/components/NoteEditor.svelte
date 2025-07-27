<script lang="ts">
  import { notesActions, notesStore } from "lib/stores/notesStore";
  import type { NotesState } from "lib/stores/notesStore";

  export let placeholder: string = "Make the magic happen...";

  let editor: HTMLDivElement;
  let storeState: NotesState;
  let debounceTimer: number;

  notesStore.subscribe((state) => {
    storeState = state;

    if (editor && state.currentContent !== editor.innerHTML) {
      editor.innerHTML = state.currentContent;
    }
  });

  export { editor };

  function handleContentChange() {
    if (!editor) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const content = editor.innerHTML;
      if (content !== storeState?.currentContent) {
        notesActions.setContent(content);
      }
    }, 100);
  }
</script>

<div
  class="note_editor"
  contenteditable="true"
  bind:this={editor}
  oninput={handleContentChange}
  {placeholder}
  role="textbox"
  tabindex="0"
></div>

<style>
  .note_editor {
    flex: 1;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    outline: none;
    font-size: 16px;
    line-height: 1.6;
    overflow-y: auto;
    border: none;
  }

  .note_editor:focus {
    border: none;
  }

  .note_editor[contenteditable="true"]:empty:before {
    content: attr(placeholder);
    color: #999;
    font-style: italic;
    pointer-events: none;
  }

  /* Styling for content inside editor */
  .note_editor :global(h1) {
    font-size: 28px;
    font-weight: bold;
    margin: 16px 0 8px 0;
    color: #333;
  }

  .note_editor :global(h2) {
    font-size: 22px;
    font-weight: bold;
    margin: 14px 0 6px 0;
    color: #444;
  }

  .note_editor :global(p) {
    margin: 8px 0;
    font-size: 16px;
  }

  .note_editor :global(hr) {
    border: none;
    height: 2px;
    background-color: #e0e0e0;
    margin: 16px 0;
  }

  .note_editor :global(a) {
    color: #0078d4;
    text-decoration: none;
  }

  .note_editor :global(a:hover) {
    text-decoration: underline;
  }

  .note_editor :global(strong) {
    font-weight: bold;
  }

  .note_editor :global(em) {
    font-style: italic;
  }

  .note_editor :global(u) {
    text-decoration: underline;
  }

  @media (prefers-color-scheme: dark) {
    .note_editor {
      background-color: #404040;
      border-color: #555;
      color: #fff;
    }

    .note_editor:focus {
      border-color: #0078d4;
    }

    .note_editor[contenteditable="true"]:empty:before {
      color: #bbb;
    }

    .note_editor :global(h1),
    .note_editor :global(h2) {
      color: #fff;
    }

    .note_editor :global(hr) {
      background-color: #666;
    }

    .note_editor :global(a) {
      color: #4da6ff;
    }
  }
</style>
