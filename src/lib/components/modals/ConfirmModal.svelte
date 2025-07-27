<script lang="ts">
  interface Props {
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "danger" | "info";
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
    onConfirm,
    onCancel,
  }: Props = $props();
</script>

<div class="confirm-modal">
  <div class="icon">
    {#if variant === "danger"}🚨
    {:else if variant === "info"}ℹ️
    {:else}⚠️{/if}
  </div>
  <p>{message}</p>
  <div class="actions">
    <button onclick={onCancel} class="btn btn-secondary">
      {cancelText}
    </button>
    <button onclick={onConfirm} class="btn btn-{variant}">
      {confirmText}
    </button>
  </div>
</div>

<style>
  .confirm-modal {
    text-align: center;
  }

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .confirm-modal p {
    margin-bottom: 24px;
    font-size: 16px;
  }

  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-warning {
    background: #ff9500;
    color: white;
  }

  .btn-danger {
    background: #ff3b30;
    color: white;
  }

  .btn-info {
    background: #007aff;
    color: white;
  }

  .btn:hover {
    opacity: 0.9;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .btn-secondary {
      background: #505050;
      color: white;
    }
  }
</style>
