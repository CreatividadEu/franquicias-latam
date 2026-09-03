// Fondo del Sandbox: grid sutil + glow superior del acento del cliente +
// viñeta inferior. Server-safe (sin estado ni animación).
export default function SandboxBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="sb-grid absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 50% at 50% -8%, color-mix(in srgb, var(--sb-accent) 11%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 115%, rgba(0, 0, 0, 0.55), transparent 60%)",
        }}
      />
    </div>
  );
}
