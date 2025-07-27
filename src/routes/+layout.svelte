<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { TauriEvents } from "lib/tauri/events";
  import { notesActions } from "lib/stores/notesStore";
  import "../app.css";

  let unlistenMenuEvents: (() => void) | null = null;

  onMount(async () => {
    await notesActions.loadRecentFiles();

    unlistenMenuEvents = await TauriEvents.listenToMenuEvents((event) => {
      console.log("Global menu event:", event);
    });
  });

  onDestroy(async () => {
    if (unlistenMenuEvents) {
      unlistenMenuEvents();
    }
    await TauriEvents.unlistenAll();
  });
</script>

<main class="app-container">
  <slot />
</main>
