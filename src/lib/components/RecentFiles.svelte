<script lang="ts">
  import type { FileInfo } from "lib/stores/notesStore";

  interface Props {
    files: FileInfo[];
    show: boolean;
    onClose: () => void;
  }

  let { files, show, onClose }: Props = $props();

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getFileIcon(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
        return "🌐";
      case "txt":
        return "📄";
      default:
        return "📄";
    }
  }

  async function openRecentFile(file: FileInfo) {
    onClose();
    console.log("Opening recent file:", file.path);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

{#if show}
  <div
    class="modal-overlay"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    tabindex="-1"
    role="presentation"
  >
    <div
      class="modal"
      role="dialog"
      aria-labelledby="recent-title"
      aria-modal="true"
    >
      <h3 id="recent-title">Recent Files</h3>

      {#if files.length === 0}
        <div class="empty-state">
          <p>No recent files found</p>
          <p class="empty-hint">Open a file to see it here</p>
        </div>
      {:else}
        <div class="files-list">
          {#each files as file}
            <button
              class="file-item"
              onclick={() => openRecentFile(file)}
              type="button"
            >
              <div class="file-info">
                <div class="file-header">
                  <span class="file-icon">{getFileIcon(file.name)}</span>
                  <span class="file-name">{file.name}</span>
                </div>
                <div class="file-meta">
                  <span class="file-path" title={file.path}>{file.path}</span>
                  <span class="file-date">{formatDate(file.lastModified)}</span>
                </div>
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <div class="modal-actions">
        <button onclick={onClose} class="close-btn" type="button">
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 500px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-state p {
    margin: 8px 0;
    color: #666;
  }

  .empty-hint {
    font-size: 14px;
    color: #999;
  }

  .files-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e0e0e0;
    background-color: #ffffff;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .file-item:hover {
    border-color: #0078d4;
    background-color: #f8f9fa;
  }

  .file-info {
    flex: 1;
  }

  .file-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .file-icon {
    font-size: 16px;
  }

  .file-name {
    font-weight: 500;
    font-size: 14px;
  }

  .file-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .file-path {
    font-size: 12px;
    color: #666;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-date {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .close-btn {
    padding: 8px 16px;
    border: 1px solid #d0d0d0;
    background-color: #ffffff;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f0f0f0;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .modal {
      background-color: #404040;
      color: #fff;
    }

    .empty-state p {
      color: #ccc;
    }

    .empty-hint {
      color: #999;
    }

    .file-item {
      background-color: #505050;
      border-color: #666;
      color: #fff;
    }

    .file-item:hover {
      background-color: #606060;
      border-color: #4da6ff;
    }

    .file-path {
      color: #ccc;
    }

    .file-date {
      color: #999;
    }

    .close-btn {
      background-color: #505050;
      border-color: #666;
      color: #fff;
    }

    .close-btn:hover {
      background-color: #606060;
    }
  }
</style>
