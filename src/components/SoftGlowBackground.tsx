type SoftGlowBackgroundProps = {
  debug?: boolean;
};

export function SoftGlowBackground({ debug = false }: SoftGlowBackgroundProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`soft-glow-layer absolute inset-0 ${
            debug ? "soft-glow-debug" : ""
          }`}
        />
        <div className="soft-glow-veil absolute inset-0 z-10" />
        <div className="soft-glow-noise absolute inset-0 z-20" />
      </div>
    </div>
  );
}
