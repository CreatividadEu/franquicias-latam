import { Skeleton } from "./_components/atoms";

/** Esqueleto del panel: misma retícula que la vista real, sin saltos. */
export default function Loading() {
  return (
    <div className="cc-shell">
      <div className="cc-topbar">
        <Skeleton height={44} width={280} />
        <Skeleton height={34} width={130} />
      </div>

      <Skeleton height={78} />

      <div className="cc-kpis" style={{ marginTop: 16 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={112} />
        ))}
      </div>

      <div className="cc-section">
        <Skeleton height={20} width={180} />
        <div style={{ marginTop: 16 }}>
          <Skeleton height={300} />
        </div>
      </div>

      <div className="cc-section">
        <Skeleton height={20} width={180} />
        <div className="cc-grid-3" style={{ marginTop: 16 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={220} />
          ))}
        </div>
      </div>

      <div className="cc-section">
        <Skeleton height={20} width={180} />
        <div className="cc-grid-4" style={{ marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={200} />
          ))}
        </div>
      </div>
    </div>
  );
}
