// El loading.tsx raíz es un skeleton de la plataforma; este lo sustituye para
// todo /manual y usa el papel del manual en vez del blanco global.
export default function ManualLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p style={{ fontWeight: 900 }}>Abriendo la caja…</p>
    </div>
  );
}
