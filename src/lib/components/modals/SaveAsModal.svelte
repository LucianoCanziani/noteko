<script lang="ts">
  interface Props {
    onSave: (fileType: string) => void;
  }

  let { onSave }: Props = $props();

  const saveOptions = [
    {
      type: "html",
      title: "HTML",
      icon: "/icons/html.svg",
      desc: "Web format",
    },
    {
      type: "txt",
      title: "Plain Text",
      icon: "/icons/plaintext.svg",
      desc: "Simple text",
    },
    /*   {
      type: "pdf",
      title: "PDF",
      icon: "/icons/pdf.svg",
      desc: "Portable Document Format",
    }, */
  ];
</script>

<div class="save-modal">
  <p>Choose format to save your note:</p>
  <div class="save-options">
    {#each saveOptions as option}
      <button onclick={() => onSave(option.type)} class="save-option">
        <img
          src={option.icon}
          alt={option.title}
          width="35"
          height="35"
          loading="eager"
          decoding="sync"
          class="option-icon"
        />
        <div class="option-text">
          <strong>{option.title}</strong>
          <small>{option.desc}</small>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .save-modal p {
    margin-top: 0px;
    margin-bottom: 16px;
    color: #666;
  }

  .save-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .save-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;
    width: 100%;
    text-align: left;
  }

  .save-option:hover {
    border-color: #000000;
  }

  .option-icon {
    font-size: 20px;
  }

  .option-text strong {
    display: block;
    font-size: 14px;
  }

  .option-text small {
    color: #666;
    font-size: 12px;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .save-modal p,
    .option-text small {
      color: #ccc;
    }

    .save-option {
      background: #505050;
      border-color: #666;
      color: white;
    }

    .save-option:hover {
      border-color: #4da6ff;
    }
  }
</style>
