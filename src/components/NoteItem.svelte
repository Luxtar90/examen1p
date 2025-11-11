<script>
  import { createEventDispatcher } from 'svelte';
  import NoteForm from './NoteForm.svelte';
  const dispatch = createEventDispatcher();

  export let note; // { id, title, content, createdAt, updatedAt }
  let editing = false;

  function onUpdate(e) {
    dispatch('update', e.detail);
    editing = false;
  }

  function onDelete() {
    dispatch('delete', { id: note.id });
  }
</script>

<div class="note">
  {#if editing}
    <NoteForm note={note} on:update={onUpdate} />
    <button class="secondary" on:click={() => (editing = false)}>Cancelar</button>
  {:else}
    <div class="content">
      <h3>{note.title}</h3>
      {#if note.content}
        <p>{note.content}</p>
      {/if}
    </div>
    <div class="actions">
      <button on:click={() => (editing = true)}>Editar</button>
      <button class="danger" on:click={onDelete}>Eliminar</button>
    </div>
  {/if}
</div>

<style>
  .note { border: 1px solid #e5e7eb; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.75rem; }
  .content h3 { margin: 0; }
  .actions { margin-top: 0.5rem; }
  .actions button { margin-right: 0.5rem; }
  .danger { background: #b00020; color: #fff; }
  .secondary { background: #e5e7eb; }
</style>