/**
 * Mi viaje (PLAN §4.5): la historia del colaborador. Los hitos se generan
 * desde eventos (ingreso, capítulos, insignias, NPS, rachas) y el líder puede
 * añadir reconocimientos. Aquí solo la parte pura: ordenar la línea de tiempo
 * y resolver la ruta de carrera.
 */
import type { TwMilestoneType, UserRole } from "@prisma/client";

export type MilestoneInput = {
  id: string;
  type: TwMilestoneType;
  title: string;
  desc: string;
  date: Date;
  icon: string;
};

export type TimelineItem = MilestoneInput & {
  /** El hito más reciente ya ocurrido: se pinta en negro con punto rojo. */
  current: boolean;
  done: boolean;
};

/**
 * Ordena de más antiguo a más reciente y marca el hito actual. Los hitos con
 * fecha futura (programados) quedan como pendientes.
 */
export function buildTimeline(milestones: readonly MilestoneInput[], now = new Date()): TimelineItem[] {
  const sorted = [...milestones].sort((a, b) => a.date.getTime() - b.date.getTime());
  let currentIndex = -1;
  sorted.forEach((item, index) => {
    if (item.date.getTime() <= now.getTime()) currentIndex = index;
  });
  return sorted.map((item, index) => ({
    ...item,
    done: item.date.getTime() <= now.getTime(),
    current: index === currentIndex,
  }));
}

export type CareerStep = {
  role: UserRole | "TW_ASESOR_SENIOR";
  title: string;
  /** Números de capítulo que hay que completar para optar al paso. */
  requiredChapters: number[];
};

/** Ruta de carrera del manual: 69 % de las vacantes se cubren internamente. */
export const CAREER_PATH: CareerStep[] = [
  { role: "TW_ASESOR", title: "Asesor comercial", requiredChapters: [1] },
  { role: "TW_ASESOR_SENIOR", title: "Asesor senior", requiredChapters: [1, 2, 3] },
  { role: "TW_LIDER_TIENDA", title: "Líder de tienda", requiredChapters: [1, 2, 3, 4, 5] },
  { role: "TW_JEFE_COMERCIAL", title: "Jefe comercial", requiredChapters: [1, 2, 3, 4, 5, 6, 7] },
];

export type CareerProgress = CareerStep & {
  /** Capítulos completados de los que exige el paso. */
  done: number;
  total: number;
  complete: boolean;
  /** El paso que ocupa hoy el colaborador. */
  current: boolean;
};

/** Cruza la ruta de carrera con los capítulos ya completados. */
export function careerProgress(completedChapters: readonly number[], role: UserRole): CareerProgress[] {
  const completed = new Set(completedChapters);
  const roleIndex = CAREER_PATH.findIndex((step) => step.role === role);
  return CAREER_PATH.map((step, index) => {
    const done = step.requiredChapters.filter((number) => completed.has(number)).length;
    return {
      ...step,
      done,
      total: step.requiredChapters.length,
      complete: done === step.requiredChapters.length,
      current: index === roleIndex,
    };
  });
}
