import type {
  Alert,
  Candidate,
  ChatMessage,
  Competency,
  DailyRecord,
  Point,
  PointId,
  TrainingModule,
  VoCEvent,
} from "./types";
import {
  ALL_POINTS,
  NARRATIVE_FLAGS,
  POINT_CITIES,
  POINT_MANAGERS,
  POINT_NAMES,
} from "./narrative";

const DAYS = 90;
const TODAY = new Date("2026-04-20T00:00:00Z");

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedForPoint(id: PointId): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h = (h ^ id.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function dateString(offsetDaysFromToday: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - offsetDaysFromToday);
  return d.toISOString().slice(0, 10);
}

type PointProfile = {
  baseRevenue: number;
  baseAvgTicket: number;
  baseFoodCostPct: number;
  baseLaborCostPct: number;
  baseNps: number;
  baseWait: number;
  baseOccupancy: number;
  staff: number;
  openVacancies: number;
  capacity: number;
  openedAt: string;
};

const PROFILES: Record<PointId, PointProfile> = {
  chapinero: {
    baseRevenue: 6_200_000,
    baseAvgTicket: 58_000,
    baseFoodCostPct: 29.5,
    baseLaborCostPct: 21.0,
    baseNps: 72,
    baseWait: 8,
    baseOccupancy: 82,
    staff: 28,
    openVacancies: 1,
    capacity: 95,
    openedAt: "2021-03-10",
  },
  "medellin-poblado": {
    baseRevenue: 5_600_000,
    baseAvgTicket: 54_000,
    baseFoodCostPct: 30.1,
    baseLaborCostPct: 22.0,
    baseNps: 68,
    baseWait: 11,
    baseOccupancy: 78,
    staff: 26,
    openVacancies: 0,
    capacity: 88,
    openedAt: "2022-05-18",
  },
  kennedy: {
    baseRevenue: 4_200_000,
    baseAvgTicket: 42_000,
    baseFoodCostPct: 31.2,
    baseLaborCostPct: 23.5,
    baseNps: 61,
    baseWait: 14,
    baseOccupancy: 84,
    staff: 22,
    openVacancies: 3,
    capacity: 80,
    openedAt: "2022-11-02",
  },
  "cali-granada": {
    baseRevenue: 2_100_000,
    baseAvgTicket: 48_000,
    baseFoodCostPct: 33.0,
    baseLaborCostPct: 28.0,
    baseNps: 59,
    baseWait: 12,
    baseOccupancy: 58,
    staff: 14,
    openVacancies: 6,
    capacity: 75,
    openedAt: "2026-03-30",
  },
  barranquilla: {
    baseRevenue: 4_800_000,
    baseAvgTicket: 51_000,
    baseFoodCostPct: 32.4,
    baseLaborCostPct: 22.4,
    baseNps: 64,
    baseWait: 10,
    baseOccupancy: 75,
    staff: 23,
    openVacancies: 1,
    capacity: 82,
    openedAt: "2022-08-12",
  },
  usaquen: {
    baseRevenue: 5_100_000,
    baseAvgTicket: 56_000,
    baseFoodCostPct: 30.0,
    baseLaborCostPct: 21.8,
    baseNps: 66,
    baseWait: 9,
    baseOccupancy: 76,
    staff: 24,
    openVacancies: 2,
    capacity: 85,
    openedAt: "2021-09-22",
  },
  cedritos: {
    baseRevenue: 4_900_000,
    baseAvgTicket: 52_000,
    baseFoodCostPct: 30.3,
    baseLaborCostPct: 22.1,
    baseNps: 65,
    baseWait: 10,
    baseOccupancy: 74,
    staff: 23,
    openVacancies: 1,
    capacity: 82,
    openedAt: "2022-02-14",
  },
  salitre: {
    baseRevenue: 4_600_000,
    baseAvgTicket: 50_000,
    baseFoodCostPct: 30.2,
    baseLaborCostPct: 22.3,
    baseNps: 63,
    baseWait: 11,
    baseOccupancy: 72,
    staff: 22,
    openVacancies: 2,
    capacity: 80,
    openedAt: "2023-01-08",
  },
  "medellin-laureles": {
    baseRevenue: 4_700_000,
    baseAvgTicket: 49_000,
    baseFoodCostPct: 30.5,
    baseLaborCostPct: 22.2,
    baseNps: 64,
    baseWait: 10,
    baseOccupancy: 73,
    staff: 22,
    openVacancies: 1,
    capacity: 80,
    openedAt: "2023-06-20",
  },
  bucaramanga: {
    baseRevenue: 4_400_000,
    baseAvgTicket: 47_000,
    baseFoodCostPct: 30.7,
    baseLaborCostPct: 22.6,
    baseNps: 62,
    baseWait: 11,
    baseOccupancy: 71,
    staff: 21,
    openVacancies: 2,
    capacity: 78,
    openedAt: "2024-02-15",
  },
};

function generateDaily(id: PointId): DailyRecord[] {
  const profile = PROFILES[id];
  const flag = NARRATIVE_FLAGS[id];
  const rand = mulberry32(seedForPoint(id));
  const rows: DailyRecord[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const date = dateString(i);
    const d = new Date(date + "T00:00:00Z");
    const dow = d.getUTCDay();
    const weekendLift = dow === 5 || dow === 6 ? 1.28 : dow === 0 ? 1.15 : 1;
    const noise = 0.92 + rand() * 0.16;

    let waitMult = 1;
    let npsDelta = 0;
    let revenueMult = 1;
    let foodDelta = 0;
    let staffActual = profile.staff;
    let openVac = profile.openVacancies;

    if (flag === "wait-problem" && i < 14) {
      waitMult = 1.32 + rand() * 0.1;
      npsDelta = -7 - Math.floor(rand() * 4);
    }
    if (flag === "food-cost") {
      foodDelta = 2.3;
    }
    if (flag === "ramping") {
      const daysSinceOpen = 21 - i;
      if (daysSinceOpen < 0) {
        revenueMult = 0;
        staffActual = 0;
        openVac = 0;
      } else {
        revenueMult = 0.35 + daysSinceOpen * 0.03;
        staffActual = Math.round(profile.staff * (0.5 + daysSinceOpen * 0.02));
        openVac = Math.max(2, profile.openVacancies - Math.floor(daysSinceOpen / 4));
      }
    }

    const revenue = Math.round(profile.baseRevenue * weekendLift * noise * revenueMult);
    const avgTicket = Math.round(profile.baseAvgTicket * (0.95 + rand() * 0.1));
    const tickets = avgTicket > 0 && revenue > 0 ? Math.round(revenue / avgTicket) : 0;

    rows.push({
      date,
      revenue,
      tickets,
      avgTicket,
      foodCostPct: Math.round((profile.baseFoodCostPct + foodDelta + (rand() - 0.5) * 0.8) * 10) / 10,
      laborCostPct: Math.round((profile.baseLaborCostPct + (rand() - 0.5) * 0.6) * 10) / 10,
      nps: Math.max(0, Math.min(100, Math.round(profile.baseNps + npsDelta + (rand() - 0.5) * 4))),
      waitTimeAvg: Math.round(profile.baseWait * waitMult * (0.9 + rand() * 0.2) * 10) / 10,
      occupancyPct: Math.max(0, Math.min(100, Math.round(profile.baseOccupancy * (0.88 + rand() * 0.2) * (revenueMult || 1)))),
      staffCount: staffActual,
      positionsOpen: openVac,
    });
  }
  return rows;
}

const HEADLINES: Record<PointId, string> = {
  chapinero: "Referente de la cadena · 72 NPS",
  "medellin-poblado": "Segundo mejor consistente",
  kennedy: "Espera +32% últimos 14 días",
  "cali-granada": "Apertura semana 3 · 70% staffing",
  barranquilla: "Food cost +2.3pp sobre media",
  usaquen: "Operación estable",
  cedritos: "Operación estable",
  salitre: "Operación estable",
  "medellin-laureles": "Operación estable",
  bucaramanga: "Operación estable",
};

export const POINTS: Point[] = ALL_POINTS.map<Point>((id) => ({
  id,
  name: POINT_NAMES[id],
  city: POINT_CITIES[id],
  manager: POINT_MANAGERS[id],
  openedAt: PROFILES[id].openedAt,
  capacity: PROFILES[id].capacity,
  flag: NARRATIVE_FLAGS[id],
  headline: HEADLINES[id],
  daily: generateDaily(id),
}));

export const POINTS_BY_ID: Record<PointId, Point> = POINTS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PointId, Point>
);

export function latest(p: Point): DailyRecord {
  return p.daily[p.daily.length - 1];
}

export function last30(p: Point): DailyRecord[] {
  return p.daily.slice(-30);
}

// ── Candidates ───────────────────────────────────────────────────────────

const CANDIDATE_CONVERSATION: ChatMessage[] = [
  {
    from: "bot",
    text: "Hola Daniela, soy el asistente de Don Benítez. Vi tu hoja de vida para cocinera en Medellín Poblado. ¿Tienes 2 min para confirmar 3 cosas?",
    at: "2026-04-20T10:14:00Z",
  },
  {
    from: "candidate",
    text: "Sí, listo.",
    at: "2026-04-20T10:16:00Z",
  },
  {
    from: "bot",
    text: "Perfecto. Tu experiencia dice 2 años en cocina caliente. ¿Has manejado plancha y freidora en el mismo turno?",
    at: "2026-04-20T10:16:30Z",
  },
  {
    from: "candidate",
    text: "Sí, en Andrés DC llevaba las dos estaciones los viernes.",
    at: "2026-04-20T10:18:00Z",
  },
  {
    from: "bot",
    text: "Excelente. Segunda: disponibilidad de turno viernes y sábado noche, que son nuestros picos. Tercera: ¿puedes venir a entrevista el jueves 24 a las 3 pm en Poblado?",
    at: "2026-04-20T10:18:30Z",
  },
];

const CANDIDATE_NAMES = [
  "Daniela Márquez",
  "Juan Esteban Pinilla",
  "Sofía Reyes",
  "Andrés Felipe Cortés",
  "Natalia Castro",
  "Camila Vargas",
  "Julián Mendoza",
  "Laura Hernández",
  "Sebastián Quintero",
  "Valentina Ríos",
  "Alejandra Lozano",
  "Mateo Gaviria",
  "Paula Serrano",
  "Cristian Ramírez",
  "Carolina Osorio",
  "Ricardo Beltrán",
  "Juliana Pardo",
  "David Ospina",
  "Manuela Zapata",
  "Felipe Arango",
  "Karen Suárez",
  "Oscar Medina",
  "Tatiana Guerrero",
  "Simón Acevedo",
  "Ángela Duque",
  "Iván Molina",
  "Catalina Forero",
  "Nicolás Torres",
  "Adriana Camacho",
  "Jorge Salazar",
];

const ROLES: Candidate["role"][] = ["Cocinero", "Mesero", "Cajero", "Anfitrión", "Gerente de punto"];

export const CANDIDATES: Candidate[] = CANDIDATE_NAMES.map((name, i) => {
  const rand = mulberry32(1000 + i);
  const role = ROLES[i % ROLES.length];
  const status: Candidate["status"] =
    i === 0
      ? "interviewing"
      : i < 6
      ? "hired"
      : i < 22
      ? "contacted"
      : "sourced";
  const point = ALL_POINTS[i % ALL_POINTS.length];
  const score = Math.round(55 + rand() * 42);
  return {
    id: `cand-${(i + 1).toString().padStart(3, "0")}`,
    name,
    city: POINT_CITIES[point],
    role,
    aiScore: score,
    status,
    lastTouch: dateString(i % 14),
    pointPreference: point,
    conversation: i === 0 ? CANDIDATE_CONVERSATION : undefined,
  };
});

export const FUNNEL_COUNTS = {
  sourced: 240,
  contacted: 87,
  interviewing: 23,
  hired: 6,
};

// ── Training modules ─────────────────────────────────────────────────────

const COMPETENCIES: Competency[] = ["Servicio", "Bar", "Cocina", "Caja", "Celebraciones"];

export const COMPETENCIES_LIST = COMPETENCIES;

export const TRAINING_MODULES: TrainingModule[] = [
  { id: "mod-001", title: "Atajos de bar en viernes pico", competency: "Bar", pointId: "chapinero", generatedAt: dateString(1), durationMin: 18 },
  { id: "mod-002", title: "Guion upsell de celebraciones", competency: "Celebraciones", pointId: "medellin-poblado", generatedAt: dateString(2), durationMin: 22 },
  { id: "mod-003", title: "Recuperación de tiempo en cocina caliente", competency: "Cocina", pointId: "kennedy", generatedAt: dateString(2), durationMin: 25 },
  { id: "mod-004", title: "Flujo de anfitrión con lista de espera", competency: "Servicio", pointId: "kennedy", generatedAt: dateString(3), durationMin: 20 },
  { id: "mod-005", title: "Control de proteína y mermas", competency: "Cocina", pointId: "barranquilla", generatedAt: dateString(4), durationMin: 24 },
  { id: "mod-006", title: "Onboarding meseros semana 1", competency: "Servicio", pointId: "cali-granada", generatedAt: dateString(5), durationMin: 30 },
  { id: "mod-007", title: "Cierre rápido de caja turno noche", competency: "Caja", pointId: "usaquen", generatedAt: dateString(6), durationMin: 15 },
  { id: "mod-008", title: "Role-play objeciones de precio", competency: "Servicio", pointId: "cedritos", generatedAt: dateString(8), durationMin: 18 },
  { id: "mod-009", title: "Coctelería mexicana premium", competency: "Bar", pointId: "medellin-laureles", generatedAt: dateString(10), durationMin: 26 },
  { id: "mod-010", title: "Preparación de mise en place", competency: "Cocina", pointId: "bucaramanga", generatedAt: dateString(12), durationMin: 22 },
  { id: "mod-011", title: "Celebraciones sorpresa: coreografía", competency: "Celebraciones", pointId: "salitre", generatedAt: dateString(14), durationMin: 28 },
  { id: "mod-012", title: "Manejo de caja con propina repartida", competency: "Caja", pointId: "salitre", generatedAt: dateString(16), durationMin: 16 },
];

// Gap severity per (competency, point). 0 = sin brecha, 3 = crítica.
export const COMPETENCY_GAPS: Record<Competency, Record<PointId, number>> = {
  Servicio: {
    chapinero: 0,
    usaquen: 1,
    cedritos: 1,
    salitre: 1,
    kennedy: 3,
    "medellin-poblado": 0,
    "medellin-laureles": 1,
    "cali-granada": 3,
    barranquilla: 1,
    bucaramanga: 2,
  },
  Bar: {
    chapinero: 0,
    usaquen: 1,
    cedritos: 2,
    salitre: 1,
    kennedy: 2,
    "medellin-poblado": 1,
    "medellin-laureles": 1,
    "cali-granada": 2,
    barranquilla: 1,
    bucaramanga: 2,
  },
  Cocina: {
    chapinero: 0,
    usaquen: 1,
    cedritos: 1,
    salitre: 1,
    kennedy: 2,
    "medellin-poblado": 1,
    "medellin-laureles": 1,
    "cali-granada": 2,
    barranquilla: 3,
    bucaramanga: 1,
  },
  Caja: {
    chapinero: 0,
    usaquen: 0,
    cedritos: 1,
    salitre: 1,
    kennedy: 1,
    "medellin-poblado": 0,
    "medellin-laureles": 1,
    "cali-granada": 2,
    barranquilla: 1,
    bucaramanga: 1,
  },
  Celebraciones: {
    chapinero: 1,
    usaquen: 2,
    cedritos: 2,
    salitre: 1,
    kennedy: 2,
    "medellin-poblado": 1,
    "medellin-laureles": 2,
    "cali-granada": 3,
    barranquilla: 2,
    bucaramanga: 3,
  },
};

// ── Alerts ───────────────────────────────────────────────────────────────

export const ALERTS: Alert[] = [
  {
    id: "alert-001",
    pointId: "kennedy",
    severity: "high",
    title: "Espera +32% en Kennedy los últimos 14 días",
    detail: "Wait-time promedio subió a 18.5 min vs. mediana cadena 10.8. NPS cayó 7pt.",
    suggestedModule: "pulso",
    createdAt: dateString(0),
  },
  {
    id: "alert-002",
    pointId: "barranquilla",
    severity: "medium",
    title: "Food cost Barranquilla +2.3pp sobre media",
    detail: "Desviación estable últimas 3 semanas. Probable merma de proteína.",
    suggestedModule: "finanzas",
    createdAt: dateString(1),
  },
  {
    id: "alert-003",
    pointId: "cali-granada",
    severity: "medium",
    title: "Cali · Granada en rampa — staffing 70%",
    detail: "Semana 3 de operación. 6 vacantes activas. Ingresos por debajo de objetivo rampa.",
    suggestedModule: "talento",
    createdAt: dateString(0),
  },
  {
    id: "alert-004",
    pointId: "salitre",
    severity: "low",
    title: "Salitre: celebraciones ejecutadas -18%",
    detail: "Conversión de upsell de celebraciones bajó tras cambio de anfitrión.",
    suggestedModule: "academia",
    createdAt: dateString(3),
  },
  {
    id: "alert-005",
    pointId: "bucaramanga",
    severity: "low",
    title: "Bucaramanga: NPS -4pt mes a mes",
    detail: "Comentarios mencionan temperatura de la comida. Revisar flujo cocina-mesero.",
    suggestedModule: "pulso",
    createdAt: dateString(5),
  },
];

// ── VoC (sentiment stream) ───────────────────────────────────────────────

const VOC_TOPICS = [
  "servicio",
  "comida",
  "espera",
  "precio",
  "ambiente",
  "celebraciones",
  "limpieza",
  "bar",
];

const VOC_POSITIVE_EXCERPTS = [
  "Los tacos estaban espectaculares, volvemos seguro.",
  "La mesera nos atendió súper bien, celebró el cumpleaños perfecto.",
  "Ambiente buenísimo, música justa, comida rica.",
  "El margarita estaba top. Regreso el fin de semana.",
  "Llegó rápido, bien servido, todo bien.",
];

const VOC_NEUTRAL_EXCERPTS = [
  "Comida bien, precio justo, nada fuera de lo normal.",
  "Estuvo ok, aunque esperábamos algo más.",
  "Normal, como siempre.",
  "Correcto en todo, sin sorpresas.",
];

const VOC_NEGATIVE_EXCERPTS = [
  "Esperamos 25 minutos por la mesa con reserva.",
  "La carne estaba fría cuando llegó.",
  "Mucho ruido, no se escuchaba la conversación.",
  "El baño necesitaba aseo.",
  "Pedí sin cebolla 3 veces y vino con cebolla.",
];

function buildVoC(): VoCEvent[] {
  const rand = mulberry32(42);
  const events: VoCEvent[] = [];
  for (let i = 0; i < 200; i++) {
    const point = ALL_POINTS[Math.floor(rand() * ALL_POINTS.length)];
    const flag = NARRATIVE_FLAGS[point];
    const skewNegative = flag === "wait-problem" || flag === "food-cost";
    const roll = rand();
    const sentiment =
      skewNegative && roll < 0.45
        ? "negative"
        : roll < 0.55
        ? "positive"
        : roll < 0.8
        ? "neutral"
        : "negative";
    const excerpt =
      sentiment === "positive"
        ? VOC_POSITIVE_EXCERPTS[Math.floor(rand() * VOC_POSITIVE_EXCERPTS.length)]
        : sentiment === "neutral"
        ? VOC_NEUTRAL_EXCERPTS[Math.floor(rand() * VOC_NEUTRAL_EXCERPTS.length)]
        : VOC_NEGATIVE_EXCERPTS[Math.floor(rand() * VOC_NEGATIVE_EXCERPTS.length)];
    events.push({
      id: `voc-${(i + 1).toString().padStart(3, "0")}`,
      pointId: point,
      sentiment,
      topic: VOC_TOPICS[Math.floor(rand() * VOC_TOPICS.length)],
      excerpt,
      at: dateString(Math.floor(rand() * 14)),
    });
  }
  return events;
}

export const VOC_EVENTS: VoCEvent[] = buildVoC();

// ── Aggregated KPIs for Panorama ─────────────────────────────────────────

export function consolidatedMTD() {
  const mtdStartDay = new Date("2026-04-01T00:00:00Z");
  let revenue = 0;
  let tickets = 0;
  let nps = 0;
  let npsCount = 0;
  let openPositions = 0;

  for (const point of POINTS) {
    for (const d of point.daily) {
      if (new Date(d.date + "T00:00:00Z") >= mtdStartDay) {
        revenue += d.revenue;
        tickets += d.tickets;
        if (d.nps > 0) {
          nps += d.nps;
          npsCount++;
        }
      }
    }
    openPositions += latest(point).positionsOpen;
  }

  return {
    revenue,
    avgTicket: tickets > 0 ? Math.round(revenue / tickets) : 0,
    nps: npsCount > 0 ? Math.round(nps / npsCount) : 0,
    openPositions,
  };
}

export function pointHourHeatmap(pointId: PointId): number[][] {
  // 7 days x 18 hours (11..28). Value = wait_time or occupancy proxy.
  const rand = mulberry32(seedForPoint(pointId) ^ 17);
  const flag = NARRATIVE_FLAGS[pointId];
  const rows: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 18; h++) {
      const hourReal = 11 + h;
      const base =
        hourReal === 13 || hourReal === 14
          ? 0.85
          : hourReal === 20 || hourReal === 21
          ? 0.9
          : hourReal < 12 || hourReal > 23
          ? 0.25
          : 0.55;
      const weekendLift = d >= 4 ? 1.15 : 1;
      const problemSpike =
        flag === "wait-problem" && (hourReal === 13 || hourReal === 20 || hourReal === 21)
          ? 1.3
          : 1;
      row.push(Math.min(1, base * weekendLift * problemSpike * (0.9 + rand() * 0.2)));
    }
    rows.push(row);
  }
  return rows;
}
