// Fondo del pitch: grid sutil de líneas + glow superior del acento + viñeta
// inferior. Server-safe (sin estado ni animación).
export default function GridBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="pt-grid absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 50% -5%, color-mix(in srgb, var(--pt-acento) 9%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 75% at 50% 118%, rgba(0, 0, 0, 0.6), transparent 62%)",
        }}
      />
    </div>
  );
}
