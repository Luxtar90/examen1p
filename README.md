# NotasApp — Svelte + Firebase

Aplicación de notas multi‑usuario con autenticación por Email/Password y Google, respaldada por Firebase Authentication y Firestore. Cada usuario ve y gestiona solo sus propias notas.

## Requisitos

- Node.js 18 o superior.
- Cuenta y proyecto en Firebase.

## Configuración de Firebase

1) Crea un proyecto en Firebase Console.

2) Habilita Authentication:
- En `Authentication → Sign-in method`, activa `Email/Password`.
- (Opcional) Activa `Google` para iniciar sesión con Google.

3) Habilita Firestore Database:
- En `Firestore Database`, crea la base en modo de producción.

4) Dominios autorizados:
- En `Authentication → Settings → Authorized domains`, agrega `localhost` (y si usas Vite, `localhost:5173`).

5) Reglas de seguridad (Firestore):
- Usa el archivo `firestore.rules` del proyecto. Cópialas en la consola de Firebase → Firestore → Rules y publícalas.
- Las reglas permiten que cada usuario solo pueda leer/escribir sus propias notas y perfil.

6) Variables de entorno:
- Crea un archivo `.env` en la raíz del proyecto con tus claves de Firebase.

```
VITE_FIREBASE_API_KEY=TU_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=TU_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID
VITE_FIREBASE_APP_ID=TU_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID
```

Nota: Este proyecto verifica que todas las variables existan para inicializar Firebase.

## Ejecutar en local

1) Instala dependencias:
- `npm install`

2) Inicia el servidor de desarrollo:
- `npm run dev`

3) Abre la app:
- `http://localhost:5173/`

4) (Opcional) Build y preview de producción:
- `npm run build`
- `npm run preview`

## Qué incluye

- Autenticación por Email/Password y Google (con fallback a redirect si el popup falla por políticas del navegador).
- Registro con mensajes de error amigables. La validación local es relajada, pero Firebase exige contraseñas de 6+ caracteres.
- Perfil de usuario en `users/{uid}` (email, displayName, providers, timestamps). No se guardan contraseñas.
- Notas por usuario: crear, listar, editar, eliminar. Cada nota lleva el `uid` del propietario.
- Reglas de Firestore que restringen acceso por `uid` (usuarios solo acceden a sus datos).
- Verificación de propietario en cliente para evitar operaciones sobre notas ajenas.
- UI sencilla con Svelte y Vite.

## Estructura del proyecto

```
├── .env
├── firestore.rules
├── index.html
├── package.json
├── src/
│   ├── App.svelte
│   ├── components/
│   │   ├── Dashboard.svelte
│   │   ├── Login.svelte
│   │   ├── NoteForm.svelte
│   │   ├── NoteItem.svelte
│   │   └── Register.svelte
│   ├── lib/
│   │   ├── firebase.js
│   │   └── userService.js
│   ├── main.js
│   ├── stores/
│   │   └── auth.js
│   └── styles.css
└── vite.config.js
```

## Archivos clave

- `src/lib/firebase.js`: Inicializa Firebase (`Auth` y `Firestore`). Usa long‑polling para mayor compatibilidad de red.
- `src/stores/auth.js`: Observa `onAuthStateChanged`, expone `user` y `authInitialized`, y asegura el perfil en Firestore.
- `src/lib/userService.js`: Crea/actualiza el documento `users/{uid}` con metadatos del usuario.
- `src/components/Login.svelte`: Inicio de sesión por email y Google, feedback de errores, fallback a redirect para Google.
- `src/components/Register.svelte`: Registro por email/contraseña con mensajes de éxito/error.
- `src/components/Dashboard.svelte`: Lista y operaciones de notas, con comprobación de propietario antes de actualizar/eliminar.
- `firestore.rules`: Reglas de seguridad que restringen el acceso a datos por `uid`.

## Solución de problemas

- “Dominio no autorizado” (`auth/unauthorized-domain`): agrega `localhost`/`localhost:5173` en Authentication → Settings → Authorized domains.
- Contraseña débil (`auth/weak-password`): aunque la UI permite cualquier entrada, Firebase requiere 6+ caracteres.
- Método no habilitado (`auth/operation-not-allowed`): habilita Email/Password (y Google si lo usas) en Sign‑in method.
- Fallos de popup o COOP con Google: el login usa fallback a `signInWithRedirect` automáticamente.
- Errores de red (`auth/network-request-failed`): revisa conexión, proxies/firewall y bloqueadores.

## Scripts disponibles

- `npm run dev`: levanta el servidor de desarrollo.
- `npm run build`: compila la app para producción.
- `npm run preview`: sirve la build localmente.

## Notas

- Las contraseñas nunca se guardan en Firestore; solo las gestiona Firebase Authentication.
- Si quieres acceso sin contraseña, puedes habilitar “Anonymous” en Authentication y usar `signInAnonymously(auth)` (no incluido por defecto).