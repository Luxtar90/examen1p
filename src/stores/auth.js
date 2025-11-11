import { writable } from 'svelte/store';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ensureUserDoc } from '../lib/userService';

export const user = writable(null);
export const authInitialized = writable(false);

if (auth) {
  onAuthStateChanged(auth, (u) => {
    user.set(u);
    authInitialized.set(true);
    // Crea/actualiza el perfil del usuario en Firestore (sin contraseñas)
    if (u) {
      ensureUserDoc(u).catch(() => {});
    }
  });
} else {
  // Si Firebase no está configurado, igual marcamos inicializado para que la UI lo indique.
  authInitialized.set(true);
}