<script lang="ts">
  import {
    notesStore,
    notesActions,
    type NotesState,
  } from "lib/stores/notesStore";

  import { invoke } from "@tauri-apps/api/core";

  export let editor: HTMLDivElement | undefined = undefined;

  export let appFunctions: {
    handleNewNote: () => void;
    handleOpenFile: () => Promise<void>;
    handleSave: () => Promise<void>;
    handleSaveAs: () => Promise<void>;
  };

  let storeState: NotesState;

  notesStore.subscribe((state) => {
    storeState = state;
  });

  $: isModified = storeState?.isModified || false;
  $: currentContent = storeState?.currentContent || "";
  $: hasContent = currentContent.trim().length > 0;

  function formatText(command: string, value?: string) {
    console.log(
      "calling formatText with command:",
      command,
      "and value: ",
      value
    );
    if (!editor) return;

    document.execCommand(command, false, value);

    console.log("Editor HTML after format:", editor.innerHTML);

    editor.focus();

    setTimeout(() => {
      if (editor) {
        notesActions.setContent(editor.innerHTML);
      }
    }, 10);
  }

  /*   function createLink() {
    const url = prompt("Enter URL:");
    if (url) {
      formatText("createLink", url);
    }
  } */

  const shortcuts = {
    // TEXT FORMATTING
    b: () => formatText("bold"),
    i: () => formatText("italic"),
    u: () => formatText("underline"),

    // FILE COMMANDS
    s: () => appFunctions.handleSave(),
    o: () => appFunctions.handleOpenFile(),
    n: () => appFunctions.handleNewNote(),

    // HEADINGS & BLOCKS
    "1": () => formatText("formatBlock", "h1"),
    "2": () => formatText("formatBlock", "h2"),
    p: () => formatText("formatBlock", "p"),

    // LISTS
    l: () => formatText("insertOrderedList"),
    k: () => formatText("insertUnorderedList"),

    // ALIGNMENT
    q: () => formatText("justifyLeft"),
    w: () => formatText("justifyCenter"),
    e: () => formatText("justifyRight"),
  };

  type ShortcutKey = keyof typeof shortcuts;

  function handleKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase() as ShortcutKey;
    const shortcut = shortcuts[key];

    if (shortcut) {
      event.preventDefault();
      shortcut();
    }
  }

  async function openFileLocation() {
    if (!storeState?.currentFilePath) return;
    try {
      await invoke("open_file_location", {
        filePath: storeState.currentFilePath,
      });
    } catch (error) {
      console.error("Error al abrir la carpeta:", error);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="toolbar">
  <!-- File Operations -->
  <div class="toolbar_group">
    <button
      onclick={appFunctions.handleNewNote}
      title="New (Ctrl+N)"
      class="toolbar_btn"
    >
      📄
    </button>
    <button
      onclick={appFunctions.handleOpenFile}
      title="Open (Ctrl+O)"
      class="toolbar_btn"
    >
      📂
    </button>
    <button
      onclick={appFunctions.handleSave}
      disabled={!hasContent}
      title="Save (Ctrl+S)"
      class="toolbar_btn"
    >
      💾
    </button>
    <button
      onclick={appFunctions.handleSaveAs}
      disabled={!hasContent}
      title="Save As..."
      class="toolbar_btn"
    >
      💾
      <span class="save_as_plus">+</span>
    </button>
  </div>

  <div class="toolbar_separator"></div>

  <!-- Text Formatting -->
  <div class="toolbar_group">
    <button
      onclick={() => formatText("formatBlock", "h1")}
      title="Title (Ctrl+1)"
      class="toolbar_btn"
    >
      <strong>T</strong>
    </button>
    <button
      onclick={() => formatText("formatBlock", "h2")}
      title="Subtitle (Ctrl+2)"
      class="toolbar_btn"
    >
      <strong>t</strong>
    </button>
    <button
      onclick={() => formatText("formatBlock", "p")}
      title="Normal Text (Ctrl+P)"
      class="toolbar_btn"
    >
      N
    </button>
  </div>

  <div class="toolbar_separator"></div>

  <!-- Text Style -->
  <div class="toolbar_group">
    <button
      onclick={() => formatText("bold")}
      title="Bold (Ctrl+B)"
      class="toolbar_btn"
    >
      <strong>B</strong>
    </button>
    <button
      onclick={() => formatText("italic")}
      title="Italic (Ctrl+I)"
      class="toolbar_btn"
    >
      <em>I</em>
    </button>
    <button
      onclick={() => formatText("underline")}
      title="Underline (Ctrl+U)"
      class="toolbar_btn"
    >
      <u>U</u>
    </button>
  </div>

  <div class="toolbar_separator"></div>

  <!-- Lists -->
  <div class="toolbar_group">
    <button
      onclick={() => formatText("insertOrderedList")}
      title="Numbered List (Ctrl+L)"
      class="toolbar_btn"
    >
      1.
    </button>
    <button
      onclick={() => formatText("insertUnorderedList")}
      title="Bullet List (Ctrl+K)"
      class="toolbar_btn"
    >
      •
    </button>

    <button
      onclick={() => {
        if (editor) {
          document.execCommand("insertHTML", false, "<hr>");
          editor.focus();
          setTimeout(() => {
            if (editor) {
              notesActions.setContent(editor.innerHTML);
            }
          }, 10);
        }
      }}
      title="Insert Line"
      aria-label="Insert Line"
      class="toolbar_btn hr_visual_button"
    >
      <div class="hr_visual"></div>
    </button>
  </div>

  <!--   <div class="toolbar_separator"></div> -->

  <!--  <div class="toolbar_group">
 <button
      onclick={createLink}
      class="toolbar_btn"
      title="Insert Link"
      aria-label="Insert Link"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" class="link_svg">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path
          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      </svg>
    </button> 
  
 </div> -->

  <div class="toolbar_separator"></div>

  <!-- Alignment -->
  <div class="toolbar_group">
    <!-- Align Left -->
    <button
      onclick={() => formatText("justifyLeft")}
      title="Align Left (Ctrl+Q)"
      class="toolbar_btn align_left"
      aria-label="Align Left"
    >
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </button>

    <!-- Align Center -->
    <button
      onclick={() => formatText("justifyCenter")}
      title="Align Center (Ctrl+W)"
      class="toolbar_btn align_center"
      aria-label="Align Center"
    >
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </button>

    <!-- Align Right -->
    <button
      onclick={() => formatText("justifyRight")}
      title="Align Right (Ctrl+E)"
      class="toolbar_btn align_right"
      aria-label="Align Right"
    >
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </button>
  </div>

  <!-- Status Area -->
  <div class="status_area">
    {#if storeState?.currentFilePath}
      <div class="file_indicator_cont">
        <button
          type="button"
          class="file_indicator"
          title={storeState.currentFilePath}
          onclick={openFileLocation}
          aria-label="Open file location"
        >
          📁 {storeState.currentFileName || "Untitled"}
        </button>
        {#if isModified}
          <div class="status_indicator" title="Document has unsaved changes">
            ●
          </div>
        {/if}
      </div>
    {:else if isModified}
      <div class="status_indicator" title="Document has unsaved changes">●</div>
    {/if}
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px;
    background-color: #f0f9ff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
  }

  .toolbar_group {
    display: flex;
    gap: 5px;
    padding: 0 10px;
  }

  .toolbar_separator {
    width: 1px;
    height: 80%;
    background-color: #c1d0e2;
    opacity: 0.8;
  }

  .status_area {
    margin-left: auto;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toolbar_btn {
    width: 30px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    position: relative;
    border: none;
    background-color: #ffffff00;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s;
    padding: 4px;
  }

  .toolbar_btn:hover:not(:disabled) {
    background-color: #dbeafe;
  }

  .toolbar_btn:active:not(:disabled) {
    background-color: #dbeafe;
  }

  .toolbar_btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .link_svg {
    stroke: #4b5563;
    stroke-width: 2.5;
    fill: none;
  }

  .toolbar_btn:hover .link_svg {
    stroke: #374151;
  }

  .save_as_plus {
    position: absolute;
    top: 3px;
    right: 3px;
    background: #dbeafe;
    width: 12px;
    height: 12px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 800;
  }

  /* Líneas para los botones de alineación */
  .line {
    height: 2px;
    background-color: #4b5563;
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  /* Ajustar botones de alineación para mostrar las líneas */
  .toolbar_btn:has(.line) {
    flex-direction: column;
    gap: 2px;
    padding: 6px 5px;
  }

  .align_left {
    align-items: flex-start;
  }

  .align_center {
    align-items: center;
  }

  .align_right {
    align-items: flex-end;
  }

  .toolbar_btn .line:nth-child(1) {
    width: 100%;
  }

  .toolbar_btn .line:nth-child(2) {
    width: 70%;
  }

  .toolbar_btn .line:nth-child(3) {
    width: 85%;
  }

  .toolbar_btn .line:nth-child(4) {
    width: 65%;
  }

  .hr_visual {
    width: 20px;
    height: 3px;
    border-radius: 3px;
    background-color: #4b5563;
  }

  .hr_visual_button .hr_visual {
    transform: scaleX(0.6);
    transition: transform 0.3s ease;
  }

  .hr_visual_button:hover .hr_visual {
    transform: scaleX(1.1);
    background-color: #374151;
  }

  .status_indicator {
    color: #ff6b6b;
    font-size: 20px;
    font-weight: bold;
  }

  .file_indicator_cont {
    position: relative;
  }
  .file_indicator_cont .status_indicator {
    position: absolute;
    top: -15px;
    right: -5px;
  }

  .file_indicator {
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #666;
    background-color: #dbeafe;
    padding: 4px 8px;
    border-radius: 4px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file_indicator:hover {
    background-color: #cbe2ff;
  }
</style>
