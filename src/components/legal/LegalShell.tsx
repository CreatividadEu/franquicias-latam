import Image from "next/image";
import Link from "next/link";

// ── Shell compartido para páginas legales ────────────────────────────────────
// Tema oscuro de la marca, índice de contenidos anclado y tipografía cómoda
// de leer. Cada página define sus secciones como data; el shell arma el resto.

export type LegalSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

export function LegalShell({
  title,
  intro,
  updated,
  sections,
  crossLink,
}: {
  title: string;
  intro: React.ReactNode;
  updated: string;
  sections: LegalSection[];
  crossLink: { href: string; label: string };
}) {
  return (
    <main className="min-h-screen bg-[#05080F] text-[#DFE8FA]">
      <div className="mx-auto max-w-[760px] px-5 pb-24 pt-10 sm:px-6">
        <header className="mb-12">
          <Link href="/" aria-label="Volver al inicio" className="inline-flex">
            <Image
              src="/logo_latam/franquicias_latam_logo.png"
              alt="Franquicias LATAM"
              width={480}
              height={120}
              className="h-16 w-auto brightness-0 invert"
            />
          </Link>
          <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.14em] text-[#5E6F8F]">
            Última actualización: {updated}
          </p>
          <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-[#AEBADB]">
            {intro}
          </div>
        </header>

        <nav
          aria-label="Contenido"
          className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#5E6F8F]">
            Contenido
          </h2>
          <ol className="mt-4 space-y-2 text-[15px]">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[#8FDCEC] transition-colors hover:text-white"
                >
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {index + 1}. {section.title}
              </h2>
              <div className="legal-body mt-4 space-y-4 text-[15.5px] leading-relaxed text-[#AEBADB]">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-[#5E6F8F]">
          <p>
            Documento relacionado:{" "}
            <Link
              href={crossLink.href}
              className="text-[#8FDCEC] underline underline-offset-4 hover:text-white"
            >
              {crossLink.label}
            </Link>
          </p>
          <p className="mt-3">
            ¿Dudas sobre este documento o sobre tus datos? Escríbenos a{" "}
            <a
              href="mailto:datos@franquiciaslatam.co"
              className="text-[#8FDCEC] underline underline-offset-4 hover:text-white"
            >
              datos@franquiciaslatam.co
            </a>
            .
          </p>
          <p className="mt-6">
            © {new Date().getFullYear()} Franquicias LATAM · Madrid · Bogotá.
          </p>
        </footer>
      </div>
    </main>
  );
}

// Elementos de apoyo para el cuerpo de las secciones.
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[#37E6C3]">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalStrong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}
