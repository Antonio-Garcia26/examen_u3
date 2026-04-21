import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./client";

export async function configurarPersistencia(
  recordarme: boolean,
): Promise<void> {
  // TODO: implementar persistencia según el valor de recordarme.
  // Si recordarme es true, usar browserLocalPersistence.
  // Si recordarme es false, usar browserSessionPersistence.
  const tipoPersistencia = recordarme
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(auth, tipoPersistencia);
}

export async function autenticarUsuario(
  correo: string,
  contrasena: string,
): Promise<UserCredential> {
  // TODO: implementar inicio de sesión con Firebase Authentication.
  return await signInWithEmailAndPassword(auth, correo, contrasena);
  throw new Error("Pendiente de implementar");
}

export async function cerrarSesionUsuario(): Promise<void> {
  // TODO: implementar cierre de sesión.
  await signOut(auth);
}
