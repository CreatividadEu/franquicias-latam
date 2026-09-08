import { prisma } from "@/lib/prisma";
import { jsonError, unauthorized } from "@/lib/totto-way/api";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { buildCertificate, certificateFolio } from "@/lib/totto-way/certificate";
import { parseChapterSnapshot } from "@/lib/totto-way/content";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Descarga el certificado de un capítulo. Solo lo emite si el servidor
 * comprueba que el colaborador completó TODAS las lecciones publicadas: el
 * cliente no puede pedir un certificado que no se ganó.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ chapter: string }> }) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();
  if (!session.employee) return jsonError("Solo los colaboradores tienen certificado.", 403);

  const { chapter: slug } = await params;
  const chapter = await prisma.twChapter.findFirst({
    where: { slug, franchiseId: session.franchiseId, status: "PUBLISHED" },
    select: { id: true, number: true, title: true, publishedSnapshot: true },
  });
  if (!chapter) return jsonError("Ese capítulo no existe o no está publicado.", 404);

  const snapshot = parseChapterSnapshot(chapter.publishedSnapshot);
  if (!snapshot || snapshot.lessons.length === 0) return jsonError("El capítulo no tiene lecciones publicadas.", 404);

  const lessonIds = snapshot.lessons.map((lesson) => lesson.id);
  const progress = await prisma.twLessonProgress.findMany({
    where: { userId: session.user.id, status: "COMPLETED", lessonId: { in: lessonIds } },
    select: { completedAt: true, xpEarned: true },
  });

  if (progress.length < lessonIds.length) {
    return jsonError("Todavía te faltan lecciones de este capítulo.", 403, {
      done: progress.length,
      total: lessonIds.length,
    });
  }

  const completedAt = progress.reduce<Date>(
    (latest, row) => (row.completedAt && row.completedAt > latest ? row.completedAt : latest),
    progress[0]?.completedAt ?? new Date(),
  );
  const xpEarned = progress.reduce((sum, row) => sum + row.xpEarned, 0);

  const pdf = await buildCertificate({
    userId: session.user.id,
    name: session.user.name ?? session.user.email,
    roleTitle: session.employee.roleTitle,
    store: session.employee.store?.name ?? null,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    completedAt,
    xpEarned,
  });

  const folio = certificateFolio(session.user.id, chapter.id, chapter.number);
  return new Response(pdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="totto-way-${folio}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
