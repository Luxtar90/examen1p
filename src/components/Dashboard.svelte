<script>
  import { db, auth } from '../lib/firebase';
  import { user } from '../stores/auth';
  import NoteForm from './NoteForm.svelte';
  import NoteItem from './NoteItem.svelte';
  import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { signOut } from 'firebase/auth';
  import { onDestroy } from 'svelte';

  let notes = [];
  let unsub = null;
  let error = '';
  let indexLink = '';
  let fallbackSubscribed = false;

  $: if ($user && db) {
    // Cancelar suscripción previa si existe
    if (unsub) {
      unsub();
    }
    const q = query(
      collection(db, 'notes'),
      where('uid', '==', $user.uid),
      orderBy('createdAt', 'desc')
    );
    unsub = onSnapshot(
      q,
      (snap) => {
        notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      },
      (err) => {
        const code = err?.code;
        if (code === 'failed-precondition' && !fallbackSubscribed) {
          // Fallback: re-suscribimos sin orderBy y ordenamos en cliente
          error = 'La consulta requiere un índice compuesto en Firestore.';
          indexLink = 'https://console.firebase.google.com/v1/r/project/' +
            (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID') +
            '/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9' +
            'zdmVsdGUtZWJmOWMvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGVzL2luZGV4ZXMvXxABGgcKA3VpZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI';
          fallbackSubscribed = true;
          if (unsub) unsub();
          const qNoOrder = query(collection(db, 'notes'), where('uid', '==', $user.uid));
          unsub = onSnapshot(
            qNoOrder,
            (snap2) => {
              notes = snap2.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => {
                  const am = a?.createdAt?.toMillis?.() ?? 0;
                  const bm = b?.createdAt?.toMillis?.() ?? 0;
                  return bm - am; // desc
                });
            },
            (err2) => {
              error = err2?.message || 'Error cargando notas.';
            }
          );
        } else {
          error = err?.message || 'Error cargando notas.';
        }
      }
    );
  }

  onDestroy(() => {
    if (unsub) unsub();
  });

  async function handleCreate(e) {
    error = '';
    if (!db || !$user) {
      error = 'Firebase no está configurado o el usuario no está autenticado.';
      return;
    }
    const { title, content } = e.detail;
    try {
      await addDoc(collection(db, 'notes'), {
        uid: $user.uid,
        title,
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      error = err?.message || 'No se pudo crear la nota.';
    }
  }

  async function handleUpdate(e) {
    error = '';
    if (!db) {
      error = 'Firebase no está configurado.';
      return;
    }
    const { id, title, content } = e.detail;
    const current = notes.find((n) => n.id === id);
    if (!current) {
      error = 'Nota no encontrada.';
      return;
    }
    if (!$user || current.uid !== $user.uid) {
      error = 'No autorizado para actualizar esta nota.';
      return;
    }
    try {
      const ref = doc(db, 'notes', id);
      await updateDoc(ref, { title, content, updatedAt: serverTimestamp() });
    } catch (err) {
      error = err?.message || 'No se pudo actualizar la nota.';
    }
  }

  async function handleDelete(e) {
    error = '';
    if (!db) {
      error = 'Firebase no está configurado.';
      return;
    }
    const { id } = e.detail;
    const current = notes.find((n) => n.id === id);
    if (!current) {
      error = 'Nota no encontrada.';
      return;
    }
    if (!$user || current.uid !== $user.uid) {
      error = 'No autorizado para eliminar esta nota.';
      return;
    }
    try {
      const ref = doc(db, 'notes', id);
      await deleteDoc(ref);
    } catch (err) {
      error = err?.message || 'No se pudo eliminar la nota.';
    }
  }

  async function logout() {
    if (auth) {
      await signOut(auth);
    }
  }
</script>

<section>
  <div class="bar">
    <h2>Mis notas</h2>
    <button class="outline" on:click={logout}>Cerrar sesión</button>
  </div>
  {#if error}
    <p class="error">{error}
      {#if indexLink}
        <br /><a href={indexLink} target="_blank" rel="noreferrer">Crear índice compuesto para uid + createdAt</a>
      {/if}
    </p>
  {/if}
  <NoteForm on:save={handleCreate} />

  <div class="list">
    {#if notes.length === 0}
      <p>No hay notas aún. Crea la primera ✍️</p>
    {:else}
      {#each notes as note (note.id)}
        <NoteItem {note} on:update={handleUpdate} on:delete={handleDelete} />
      {/each}
    {/if}
  </div>
</section>

<style>
  .bar { display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0; }
  .list { margin-top: 0.75rem; }
  .error { color: #b00020; }
  .outline { background: transparent; border: 1px solid #111827; color: #111827; }
  .outline:hover { background: #f3f4f6; }
</style>