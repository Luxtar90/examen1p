<script>
  import { auth } from '../lib/firebase';
  import { onMount } from 'svelte';
  import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
  } from 'firebase/auth';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let success = '';

  const canSubmit = () => email.trim() && password.length > 0;

  function mapAuthErr(code) {
    switch (code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas.';
      case 'auth/operation-not-allowed':
        return 'Método Email/Password no habilitado en Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera e inténtalo de nuevo.';
      case 'auth/network-request-failed':
        return 'Fallo de red. Verifica conexión, bloqueadores o firewall.';
      case 'auth/unauthorized-domain':
        return 'Dominio no autorizado. Agrega localhost:5173 en Firebase > Authentication > Settings.';
      default:
        return null;
    }
  }

  $: disabledHint = !canSubmit() ? 'Completa email y contraseña.' : '';

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    if (!auth) {
      error = 'Firebase no está configurado.';
      return;
    }
    if (!canSubmit()) {
      error = 'Completa email y contraseña.';
      return;
    }
    loading = true;
    try {
      console.debug('[Login] signing in', email);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      success = 'Sesión iniciada. Redirigiendo…';
      // La redirección la maneja App.svelte reaccionando al store de usuario.
    } catch (err) {
      console.error('[Login] error', err);
      const friendly = mapAuthErr(err?.code);
      error = friendly || err?.message || 'Error al iniciar sesión.';
    } finally {
      loading = false;
    }
  }

  async function loginWithGoogle() {
    error = '';
    if (!auth) {
      error = 'Firebase no está configurado.';
      return;
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    loading = true;
    try {
      await signInWithPopup(auth, provider);
      // Redirección automática al Dashboard por el store de usuario.
    } catch (err) {
      const msg = String(err?.message || '');
      const code = String(err?.code || '');
      // Fallback a redirect si hay bloqueo por COOP/popup
      if (msg.includes('Cross-Origin-Opener-Policy') || code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (err2) {
          error = err2?.message || 'No se pudo iniciar sesión con Google (redirect).';
        }
      } else {
        error = err?.message || 'No se pudo iniciar sesión con Google.';
      }
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    // Maneja el resultado del redirect (si se usó fallback)
    if (!auth) return;
    try {
      await getRedirectResult(auth);
      // En caso de éxito, onAuthStateChanged actualizará el store y la UI.
    } catch (err) {
      // No interrumpe la UI; muestra el error si existe.
      if (err?.message) {
        error = err.message;
      }
    }
  });
</script>

<form class="card" on:submit|preventDefault={handleSubmit} novalidate>
  <h2>Iniciar sesión</h2>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if success}
    <p class="success">{success}</p>
  {/if}
  <label>
    Email
    <input type="email" bind:value={email} placeholder="tu@email.com" required />
  </label>
  <label>
    Contraseña
    <input type="password" bind:value={password} placeholder="Contraseña" required />
  </label>
  <button type="submit" disabled={loading}>
    {#if loading}Ingresando…{/if}
    {#if !loading}Entrar{/if}
  </button>

  {#if disabledHint && !loading}
    <p class="hint">{disabledHint}</p>
  {/if}

  <div class="oauth">
    <hr />
    <button type="button" class="google" on:click={loginWithGoogle} disabled={loading}>
      Entrar con Google
    </button>
  </div>
</form>

<style>
  .card { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 8px; }
  .error { color: #b00020; }
  .success { color: #0f7b0f; }
  label { display: block; margin: 0.5rem 0; }
  input { width: 100%; padding: 0.5rem; }
  button { margin-top: 0.5rem; }
  .oauth { margin-top: 0.75rem; }
  .oauth hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.75rem 0; }
  .google { background: #fff; color: #111827; border: 1px solid #e5e7eb; }
  .hint { color: #6b7280; font-size: 0.9rem; }
</style>