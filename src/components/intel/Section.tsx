import type { ReactNode } from "react";

/** Cabecera de sección: título a la izquierda, nota al aire a la derecha. */
export function SectionHead({
  title,
  note,
  id,
}: {
  title: string;
  note?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 id={id} className="intel-section-title">
        {title}
      </h2>
      {note ? <p className="intel-section-note">{note}</p> : null}
    </div>
  );
}

/** Tarjeta de sección con cabecera. */
export default function Section({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  return (
    <section aria-labelledby={id} className={`intel-card intel-card-pad ${className}`}>
      <SectionHead id={id} title={title} note={note} />
      {children}
    </section>
  );
}
