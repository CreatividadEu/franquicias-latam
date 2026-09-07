import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { Placeholder } from "../../../_components/atoms";

export const dynamic = "force-dynamic";

/** Hito 1b: solo valida el capítulo. La vista completa (lecciones, aside, PDF) llega en 1c. */
export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const session = await requireTwSession();
  const { chapter: slug } = await params;
  const chapter = await prisma.twChapter.findFirst({
    where: { franchiseId: session.franchiseId, slug, status: "PUBLISHED" },
    select: { number: true, title: true },
  });
  if (!chapter) notFound();
  const t = createTranslator(session.locale);
  return <Placeholder title={`${String(chapter.number).padStart(2, "0")} · ${chapter.title}`} body={t("placeholder.body")} />;
}
