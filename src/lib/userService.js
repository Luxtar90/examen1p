import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function ensureUserDoc(u) {
  if (!db || !u) return;
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  const providerIds = Array.isArray(u.providerData) ? u.providerData.map((p) => p.providerId) : [];
  const base = {
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    providerIds,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (!snap.exists()) {
    await setDoc(ref, base);
  } else {
    await updateDoc(ref, {
      email: base.email,
      displayName: base.displayName,
      providerIds: base.providerIds,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid) {
  if (!db || !uid) return null;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}