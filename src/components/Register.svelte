<script>
  import { auth } from '../lib/firebase';
  import { createUserWithEmailAndPassword } from 'firebase/auth';

  let email = '';
  let password = '';
  let confirm = '';
  let error = '';
  let success = '';
  let loading = false;

  // Validación relajada: cualquier carácter y longitud; confirmación opcional
  const valid = () => email.trim() && password.length > 0;

  function mapAuthErr(code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El email ya está registrado.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/weak-password':
        return 'Contraseña muy débil (mínimo 6).';
      case 'auth/unauthorized-domain':
        return 'Dominio no autorizado. Agrega localhost:5173 en Firebase > Authentication > Settings.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
      case 'auth/operation-not-allowed':
        return 'Método Email/Password no habilitado en Firebase Authentication.';
      case 'auth/network-request-failed':
        return 'Fallo de red. Verifica conexión, bloqueadores o firewall.';
      default:
        return null;
    }
  }

  $: disabledHint = !valid() ? 'Completa email y contraseña (confirmación opcional).' : '';

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';
    if (!auth) {
      error = 'Firebase no está configurado.';
      return;
    }
    if (!valid()) {
      error = 'Completa email y contraseña (confirmación opcional).';
      return;
    }
    loading = true;
    try {
      console.debug('[Register] creating user', email);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // La redirección la maneja App.svelte por el store de usuario.
      success = 'Cuenta creada. Redirigiendo…';
    } catch (err) {
      console.error('[Register] error', err);
      const friendly = mapAuthErr(err?.code);
      error = friendly || err?.message || 'Error al registrarse.';
    } finally {
      loading = false;
    }
  }
</script>

<form class="card" on:submit|preventDefault={handleSubmit}>
  <h2>Registrarse</h2>
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
  <label>
    Confirmar contraseña
    <input type="password" bind:value={confirm} />
  </label>
  <button type="submit">
    {#if loading}Creando cuenta…{/if}
    {#if !loading}Registrarme{/if}
  </button>
  {#if disabledHint && !loading}
    <p class="hint">{disabledHint}</p>
  {/if}
</form>

<style>
  .card { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 8px; }
  .error { color: #b00020; }
  .success { color: #0f7b0f; }
  .hint { color: #6b7280; font-size: 0.9rem; }
  label { display: block; margin: 0.5rem 0; }
  input { width: 100%; padding: 0.5rem; }
  button { margin-top: 0.5rem; }
</style>