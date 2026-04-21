"use client";

import { useMemo, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import {
  autenticarUsuario,
  cerrarSesionUsuario,
  configurarPersistencia,
} from "@/firebase/auth";

type AuthUser = {
  email: string;
};

function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function LoginExam() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase && usuarioFirebase.email) {
        setUsuario({ email: usuarioFirebase.email });
      } else {
        setUsuario(null);
      }
    });
    return () => desuscribir();
  }, []);

  const tituloBoton = useMemo(() => {
    return cargando ? "Entrando..." : "Entrar";
  }, [cargando]);

  async function procesarAcceso(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // TODO: limpiar errores previos.
    setError("");
    // TODO: validar campos vacíos.
    if (!correo.trim() || !contrasena.trim()) {
      setError("Por favor, llena todos los campos.");
      return;
    }
    // TODO: validar formato de correo.
    if (!esCorreoValido(correo)) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }
    // TODO: activar estado de carga.
    setCargando(true);
    try {
      //Configurar persistencia según recordarme.
      await configurarPersistencia(recordarme);

      //Autenticar usuario.
      const credencial = await autenticarUsuario(correo, contrasena);

      //Guardar usuario autenticado en estado.
      if (credencial.user && credencial.user.email) {
        setUsuario({ email: credencial.user.email });
      }
    } catch (err) {
      //Manejar errores y mostrarlos en pantalla.
      console.error(err);
      setError("Error al iniciar sesión. Verifica tu correo y contraseña.");
    } finally {
      //Limpiar estado de carga.
      setCargando(false);
    }
  }

  async function salir() {
    try {
      //Cerrar sesión en Firebase.
      await cerrarSesionUsuario();
      //Limpiar el usuario en estado.
      setUsuario(null);
      //Limpiar formulario si se desea.
      setCorreo("");
      setContrasena("");
      setRecordarme(false);
      setError("");
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[oklch(37.9%_0.146_265.522)]">
      <section className="w-full max-w-md bg-[oklch(93.2%_0.032_255.585)] p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso escolar</h1>
          <p className="text-sm text-gray-500 mt-2">
            Completa la funcionalidad de inicio de sesión.
          </p>
        </div>

        {!usuario ? (
          <form onSubmit={procesarAcceso} className="space-y-4">
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="alumno@correo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                placeholder="******"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                id="recordarme"
                type="checkbox"
                checked={recordarme}
                onChange={(event) => setRecordarme(event.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="recordarme"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Recordarme
              </label>
            </div>

            {error ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[oklch(64.6%_0.222_41.116)] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {tituloBoton}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
              <p className="text-sm font-medium">Inicio de sesión correcto</p>
              <h2 className="text-lg font-bold mt-1">
                Bienvenido, {usuario.email}
              </h2>
            </div>

            <button
              type="button"
              onClick={salir}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
