import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseChapterSnapshot } from "@/lib/totto-way/content";
import { isAuthorizedCron } from "@/lib/totto-way/cron";
import { INACTIVITY_DAYS, isInactive } from "@/lib/totto-way/leader";
import { notifyDailyReminder, notifyInactivity } from "@/lib/totto-way/notify";
import { unauthorized } from "@/lib/totto-way/api";
import { dayKey } from "@/lib/totto-way/xp";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Tope por ejecución: evita que un fallo de configuración dispare cientos de correos. */
const MAX_EMAILS = 200;

/**
 * Recordatorio diario con la lección pendiente y aviso de inactividad a los
 * líderes. Respeta la preferencia `dailyReminder` del colaborador y no
 * escribe a quien ya sumó puntos hoy.
 */
async function run(request: Request) {
  if (!isAuthorizedCron(request)) return unauthorized();

  const now = new Date();
  let reminders = 0;
  let alerts = 0;

  const franchises = await prisma.twSettings.findMany({ select: { franchiseId: true } });

  for (const { franchiseId } of franchises) {
    const [chapters, employees] = await Promise.all([
      prisma.twChapter.findMany({
        where: { franchiseId, status: "PUBLISHED" },
        orderBy: [{ order: "asc" }, { number: "asc" }],
        select: { publishedSnapshot: true },
      }),
      prisma.twEmployee.findMany({
        where: { franchiseId, storeId: { not: null } },
        select: {
          userId: true,
          prefs: true,
          lastActivityAt: true,
          store: { select: { id: true, name: true, timezone: true } },
          user: { select: { name: true, email: true, role: true } },
        },
      }),
    ]);

    const lessons = chapters
      .map((chapter) => parseChapterSnapshot(chapter.publishedSnapshot))
      .filter((snapshot): snapshot is NonNullable<typeof snapshot> => !!snapshot)
      .flatMap((snapshot) => snapshot.lessons);
    if (lessons.length === 0) continue;

    const userIds = employees.map((employee) => employee.userId);
    const done = await prisma.twLessonProgress.findMany({
      where: { userId: { in: userIds }, status: "COMPLETED" },
      select: { userId: true, lessonId: true },
    });
    const doneByUser = new Map<string, Set<string>>();
    for (const row of done) {
      if (!doneByUser.has(row.userId)) doneByUser.set(row.userId, new Set());
      doneByUser.get(row.userId)!.add(row.lessonId);
    }

    const inactiveByStore = new Map<string, string[]>();

    for (const employee of employees) {
      const prefs = (employee.prefs ?? {}) as Record<string, unknown>;
      const timeZone = employee.store?.timezone ?? "America/Bogota";
      const activeToday =
        employee.lastActivityAt && dayKey(employee.lastActivityAt, timeZone) === dayKey(now, timeZone);

      if (prefs.dailyReminder !== false && !activeToday && reminders < MAX_EMAILS) {
        const completed = doneByUser.get(employee.userId) ?? new Set<string>();
        const pending = lessons.find((lesson) => !completed.has(lesson.id));
        if (pending) {
          await notifyDailyReminder({
            to: employee.user.email,
            name: employee.user.name,
            lesson: pending.title,
            xp: pending.xp,
          });
          reminders += 1;
        }
      }

      if (isInactive(employee.lastActivityAt, now) && employee.store) {
        const list = inactiveByStore.get(employee.store.id) ?? [];
        list.push(employee.user.name ?? employee.user.email);
        inactiveByStore.set(employee.store.id, list);
      }
    }

    for (const [storeId, members] of inactiveByStore) {
      const leaders = employees.filter(
        (employee) => employee.store?.id === storeId && employee.user.role === "TW_LIDER_TIENDA",
      );
      for (const leader of leaders) {
        if (alerts >= MAX_EMAILS) break;
        const others = members.filter((name) => name !== (leader.user.name ?? leader.user.email));
        if (others.length === 0) continue;
        await notifyInactivity({
          to: leader.user.email,
          leaderName: leader.user.name,
          members: others,
          days: INACTIVITY_DAYS,
        });
        alerts += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, at: now.toISOString(), reminders, alerts });
}

export const GET = run;
export const POST = run;
