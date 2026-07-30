// El loading.tsx raíz es un skeleton claro (bg-gray-50): en una ruta oscura
// destella en blanco. Este lo sustituye para todo el grupo standalone.
export default function StandaloneLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="intel-eyebrow">Cargando modelo…</p>
    </div>
  );
}
