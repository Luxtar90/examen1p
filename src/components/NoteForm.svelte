<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let note = null; // { id, title, content }
  let title = note?.title || '';
  let content = note?.content || '';
  let error = '';

  $: if (note) {
    title = note.title ?? '';
    content = note.content ?? '';
  }

  const valid = () => title.trim().length > 0;

  function submit(e) {
    e.preventDefault();
    error = '';
    if (!valid()) {
      error = 'El título es obligatorio.';
      return;
    }
    if (note?.id) {
      dispatch('update', { id: note.id, title: title.trim(), content: content.trim() });
    } else {
      dispatch('save', { title: title.trim(), content: content.trim() });
      title = '';
      content = '';
    }
  }
</script>

<form class="note-form" on:submit|preventDefault={submit}>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <div class="row">
    <input type="text" bind:value={title} placeholder="Título" />
  </div>
  <div class="row">
    <textarea rows="3" bind:value={content} placeholder="Contenido"></textarea>
  </div>
  <button type="submit">{note ? 'Actualizar' : 'Guardar'}</button>
</form>

<style>
  .note-form { border: 1px solid #e5e7eb; padding: 0.75rem; border-radius: 8px; }
  .row { margin: 0.5rem 0; }
  .error { color: #b00020; }
  input, textarea { width: 100%; padding: 0.5rem; }
  button { margin-top: 0.5rem; }
</style>