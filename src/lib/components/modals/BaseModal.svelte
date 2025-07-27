<script lang="ts">
  import { modalService, type ModalConfig } from "lib/services/modalService";
  import ConfirmModal from "./ConfirmModal.svelte";
  import SaveAsModal from "./SaveAsModal.svelte";

  let currentModal: ModalConfig | null = $state(null);

  modalService.subscribe((modal) => {
    currentModal = modal;
  });

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      modalService.close();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      modalService.close();
    }
  }

  async function handleConfirm() {
    if (currentModal?.type === "confirm" && currentModal.onConfirm) {
      await currentModal.onConfirm();
    }
  }

  async function handleCancel() {
    if (currentModal?.type === "confirm" && currentModal.onCancel) {
      await currentModal.onCancel();
      modalService.close();
    }
  }

  async function handleSave(fileType: string) {
    if (currentModal?.type === "saveAs" && currentModal.onSave) {
      await currentModal.onSave(fileType);
    }
  }
</script>

{#if currentModal}
  <div
    class="modal-overlay"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    tabindex="-1"
    role="dialog"
    aria-modal="true"
  >
    <div class="modal">
      <!-- Header -->
      {#if currentModal.title}
        <div class="modal-header">
          <h3>{currentModal.title}</h3>
          <button onclick={() => modalService.close()} class="close-btn">
            ×
          </button>
        </div>
      {/if}

      <div class="modal-content">
        <!-- Renderizar el componente correcto -->
        {#if currentModal.type === "confirm"}
          <ConfirmModal
            message={currentModal.message || ""}
            confirmText={currentModal.confirmText}
            cancelText={currentModal.cancelText}
            variant={currentModal.variant}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        {:else if currentModal.type === "saveAs"}
          <SaveAsModal onSave={handleSave} />
        {/if}
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 400px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    width: 30px;
    height: 30px;
    border-radius: 50px;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f0f0f0;
  }

  .modal-content {
    padding: 24px;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .modal {
      background: #404040;
      color: white;
    }

    .modal-header {
      border-bottom-color: #666;
    }

    .close-btn:hover {
      background-color: #606060;
    }
  }
</style>
