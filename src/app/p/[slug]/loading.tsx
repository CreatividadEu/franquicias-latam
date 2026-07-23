// Fallback oscuro del segmento: evita que el loading claro global flashee
// antes del pitch (fondo #0B0F0A desde el primer frame, sin spinner).
export default function PitchLoading() {
  return <div className="fixed inset-0 bg-[#0B0F0A]" aria-hidden />;
}
