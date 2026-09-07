"use server";

/**
 * Acciones del Panel líder. Cada una revalida la sesión, comprueba el permiso
 * del rol y que la persona objetivo esté dentro del scope del líder: nunca se
 * confía en el userId que llega del cliente.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/totto-way/award";
import { getTwSessionOrNull, type TwSession } from "@/lib/totto-way/auth";
import { parseChapterSnapshot } from "@/lib/totto-way/content";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { notifyCheckpointValidated } from "@/lib/totto-way/notify";
import { canValidateCheckpoints, employeeWhere } from "@/lib/totto-way/scope";

export type LeaderActionResult = { ok: true; message: string } | { ok: false; error: string };

const Ids = z.object({ userId: z.string().min(1).max(64), checkpointId: z.string().min(1).max(64) });

async function requireLeader(): Promise<TwSession | null> {
  const session = await getTwSessionOrNull();
  if (!session || !canValidateCheckpoints(session.user.role)) return null;
  return session;
}

/** La persona debe estar en una tienda que el líder puede ver. */
async function memberInScope(session: TwSession, userId: string) {
  return prisma.twEmployee.findFirst({
    where: { ...employeeWhere(session.scope), userId },
    select: { userId: true, storeId: true, user: { select: { name: true, email: true } } },
  });
}

/**
 * Valida el checkpoint de un capítulo y paga los +150 XP. Vuelve a comprobar
 * en servidor que la persona terminó todas las lecciones del capítulo.
 */
export async function validateCheckpoint(input: { userId: string; checkpointId: string }): Promise<LeaderActionResult> {
  const session = await requireLeader();
  if (!session) return { ok: false, error: "No tienes permiso para validar checkpoints." };

  const parsed = Ids.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const member = await memberInScope(session, parsed.data.userId);
  if (!member) return { ok: false, error: "Esa persona no está en tu equipo." };

  const checkpoint = await prisma.twCheckpoint.findFirst({
    where: { id: parsed.data.checkpointId, chapter: { franchiseId: session.franchiseId, status: "PUBLISHED" } },
    select: { id: true, xp: true, chapter: { select: { title: true, publishedSnapshot: true } } },
  });
  if (!checkpoint) return { ok: false, error: "El checkpoint no existe o su capítulo no está publicado." };

  const snapshot = parseChapterSnapshot(checkpoint.chapter.publishedSnapshot);
  if (!snapshot) return { ok: false, error: "El capítulo no tiene una versión publicada." };

  const completed = await prisma.twLessonProgress.count({
    where: {
      userId: member.userId,
      status: "COMPLETED",
      lessonId: { in: snapshot.lessons.map((lesson) => lesson.id) },
    },
  });
  if (completed < snapshot.lessons.length) {
    return { ok: false, error: "Todavía le faltan lecciones del capítulo." };
  }

  const existing = await prisma.twCheckpointValidation.findUnique({
    where: { checkpointId_userId: { checkpointId: checkpoint.id, userId: member.userId } },
    select: { validatedAt: true },
  });
  if (existing) return { ok: false, error: "Este checkpoint ya estaba validado." };

  await prisma.twCheckpointValidation.create({
    data: {
      checkpointId: checkpoint.id,
      userId: member.userId,
      validatedBy: session.user.id,
      xpAwarded: checkpoint.xp,
    },
  });

  await awardXp({
    franchiseId: session.franchiseId,
    userId: member.userId,
    storeId: member.storeId,
    source: "CHECKPOINT",
    points: checkpoint.xp,
    refId: checkpoint.id,
    meta: { chapter: checkpoint.chapter.title, validatedBy: session.user.id },
  });

  await notifyCheckpointValidated({
    to: member.user.email,
    name: member.user.name,
    chapter: checkpoint.chapter.title,
    xp: checkpoint.xp,
    validatedBy: session.user.name,
  });

  revalidatePath(NAV_HREF.leader);
  return { ok: true, message: `Validado · +${checkpoint.xp} XP para ${member.user.name ?? "el colaborador"}` };
}

const MilestoneSchema = z.object({
  userId: z.string().min(1).max(64),
  title: z.string().trim().min(3).max(120),
  desc: z.string().trim().max(400).default(""),
});

/** Reconocimiento manual del líder en la línea de tiempo del colaborador. */
export async function addRecognition(input: { userId: string; title: string; desc?: string }): Promise<LeaderActionResult> {
  const session = await requireLeader();
  if (!session) return { ok: false, error: "No tienes permiso para añadir reconocimientos." };

  const parsed = MilestoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "El reconocimiento necesita un título de al menos 3 caracteres." };

  const member = await memberInScope(session, parsed.data.userId);
  if (!member) return { ok: false, error: "Esa persona no está en tu equipo." };

  await prisma.twJourneyMilestone.create({
    data: {
      userId: member.userId,
      type: "CUSTOM",
      title: parsed.data.title,
      desc: parsed.data.desc,
      icon: "star",
      createdBy: session.user.id,
    },
  });

  revalidatePath(NAV_HREF.leader);
  return { ok: true, message: `Reconocimiento añadido a ${member.user.name ?? "el colaborador"}` };
}
