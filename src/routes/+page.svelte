<script lang="ts">
  import { onMount } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import Toolbar from "lib/components/Toolbar.svelte";
  import NoteEditor from "lib/components/NoteEditor.svelte";
  import BaseModal from "lib/components/modals/BaseModal.svelte";
  import { FileService } from "lib/services/fileService";
  import { notesStore, notesActions } from "lib/stores/notesStore";
  import type { NotesState } from "lib/stores/notesStore";

  let editor: HTMLDivElement;

  onMount(() => {
    notesActions.loadRecentFiles();

    const unsubscribeRecentFiles = notesActions.saveRecentFiles();

    const unlisten = listen("menu-event", (event) => {
      console.log("Menu event received:", event.payload);

      switch (event.payload) {
        case "new":
          FileService.newFile(editor);
          break;
        case "open":
          FileService.openFile(editor);
          break;
        case "save":
          FileService.saveFile();
          break;
        case "save_as":
          FileService.saveFileAs();
          break;
      }
    });

    return () => {
      unsubscribeRecentFiles();
      unlisten.then((f) => f());
    };
  });

  function getAppFunctions() {
    return {
      handleNewNote: () => FileService.newFile(editor),
      handleOpenFile: () => FileService.openFile(editor),
      handleSave: () => FileService.saveFile(),
      handleSaveAs: () => FileService.saveFileAs(),
    };
  }
</script>

<main class="notes-app">
  <!-- Upper menu -->
  <Toolbar {editor} appFunctions={getAppFunctions()} />

  <!-- Where you type stuff -->
  <NoteEditor bind:editor placeholder="Start typing stuff..." />

  <!-- BaseModal - where every modal is displayed -->
  <BaseModal />
</main>

<style>
  .notes-app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
  }
</style>
