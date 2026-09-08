import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, intlLocale } from "@/lib/totto-way/i18n";
import { getChapterView } from "@/lib/totto-way/queries";
import { lessonsByMission } from "@/lib/totto-way/progress";
import { BlockRenderer } from "../../_components/BlockRenderer";
import "./manual.css";

export const metadata: Metadata = { title: "Manual impreso", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Vista de impresión del manual (decisión D5 del PLAN): el mismo contenido
 * publicado, maquetado en páginas carta apaisadas. Usa el mismo BlockRenderer
 * que la lección, así que el impreso y la plataforma no pueden divergir.
 *
 * Vive fuera del grupo (app) a propósito: sin barra lateral ni cabecera, para
 * que "Imprimir" del navegador dé un PDF limpio.
 */
export default async function ManualPage({ params }: { params: Promise<{ chapter: string }> }) {
  const session = await requireTwSession();
  const { chapter: slug } = await params;
  const view = await getChapterView(session, slug);
  if (!view || !view.unlocked) notFound();

  const t = createTranslator(session.locale);
  const { snapshot } = view;
  const number = String(snapshot.number).padStart(2, "0");
  const missions = lessonsByMission(snapshot);
  const stamp = new Intl.DateTimeFormat(intlLocale(session.locale), { dateStyle: "long" }).format(new Date(snapshot.publishedAt));

  // Una página por lección más la portada: es la unidad que el manual usa.
  // Se numeran de antemano en vez de ir contando durante el render.
  const pages = missions.flatMap((mission) => mission.lessons.map((lesson) => ({ mission, lesson })));
  const total = pages.length + 1;

  return (
    <main className="tw-manual">
      <p className="tw-manual__hint" data-print-hide>
        {t("chapter.printHint")}
      </p>

      <section className="tw-manual__page tw-manual__page--cover">
        <div className="tw-manual__cover-mark" aria-hidden />
        <span className="tw-manual__eyebrow tw-manual__eyebrow--yellow">Totto Way · {t("chapter.manual")}</span>
        <span className="tw-manual__numeral">{number}</span>
        <h1>{snapshot.title}</h1>
        <p className="tw-manual__sub">{snapshot.subtitle}</p>
        <footer className="tw-manual__foot">
          <span>
            TOTTO Way® · v{snapshot.version} · {stamp}
          </span>
          <span>Pág. 01 / {total}</span>
        </footer>
      </section>

      {pages.map(({ mission, lesson }, index) => (
        <section key={lesson.id} className="tw-manual__page">
          <header className="tw-manual__head">
            <span>
              <b>{mission.code}</b> · {mission.title}
            </span>
            <span>
              Capítulo {number} · {snapshot.title}
            </span>
          </header>

          <div className="tw-manual__body">
            <span className="tw-manual__eyebrow">
              {mission.code} · {t(`types.${lesson.type}` as never)} · {lesson.minutes} min
            </span>
            <h2>{lesson.title}</h2>
            <div className="tw-manual__content">
              <BlockRenderer blocks={lesson.blocks} />
            </div>
          </div>

          <footer className="tw-manual__foot">
            <span>TOTTO Way® · Manual de Usuario Comercial · v{snapshot.version}</span>
            <span>
              Pág. {String(index + 2).padStart(2, "0")} / {total}
            </span>
          </footer>
        </section>
      ))}
    </main>
  );
}
