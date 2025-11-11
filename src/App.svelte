<script>
  import { user, authInitialized } from './stores/auth';
  import { isFirebaseConfigured } from './lib/firebase';
  import Dashboard from './components/Dashboard.svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';

  let route = 'login'; // 'login' | 'register' | 'dashboard'

  $: if ($authInitialized) {
    if ($user) {
      route = 'dashboard';
    } else if (route === 'dashboard') {
      route = 'login';
    }
  }

  const go = (r) => (route = r);
</script>

<div class="container">
  <header class="topbar">
    <h1>NotasApp</h1>
    {#if !$user}
      <nav>
        <button class:active={route === 'login'} on:click={() => go('login')}>Iniciar sesión</button>
        <button class:active={route === 'register'} on:click={() => go('register')}>Registrarse</button>
      </nav>
    {/if}
  </header>

  {#if !isFirebaseConfigured}
    <div class="banner">
      <strong>Configura Firebase:</strong> crea el archivo <code>.env</code> con tus claves (ver <code>.env.example</code>), habilita Authentication (email/contraseña) y Firestore.
    </div>
  {/if}

  {#if $authInitialized}
    {#if route === 'dashboard' && $user}
      <Dashboard />
    {:else if route === 'login'}
      <Login />
    {:else if route === 'register'}
      <Register />
    {/if}
  {:else}
    <p>Cargando…</p>
  {/if}
</div>

<style>
  .container { max-width: 900px; margin: 0 auto; padding: 1rem; }
  .topbar { display: flex; justify-content: space-between; align-items: center; }
  nav button { margin-left: 0.5rem; }
  button.active { font-weight: bold; text-decoration: underline; }
  .banner { background: #fff3cd; border: 1px solid #ffeeba; padding: 0.75rem; border-radius: 6px; margin: 0.75rem 0; }
</style>