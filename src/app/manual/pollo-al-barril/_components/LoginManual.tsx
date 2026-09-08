"use client";

import { useState } from "react";

/**
 * Puerta del manual. La comprobación es del servidor: aquí solo se recogen los
 * datos y se refresca la página cuando la cookie ya está puesta.
 */
export default function LoginManual({ slug }: { slug: string }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual/${slug}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });
      if (res.ok) {
        // Recarga entera: la página es un componente de servidor y tiene que
        // volver a leer la cookie para traer los costos guardados.
        window.location.reload();
        return;
      }
      const datos = await res.json().catch(() => ({}));
      setError(datos.error ?? "No se pudo entrar");
      setEnviando(false);
    } catch {
      setError("Sin conexión. Revisa tu internet e inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="loginwrap">
      <form className="loginbox" onSubmit={entrar}>
        <span className="kicker">Manual de costeo</span>
        <h1>POLLO AL BARRIL</h1>
        <p className="loginlede">
          Documento de trabajo privado. Entra para ver y editar tus costos.
        </p>

        <label htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        {error ? (
          <p className="loginerror" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
