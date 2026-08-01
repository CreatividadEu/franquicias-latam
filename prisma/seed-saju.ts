/**
 * SAJÚ Command Center — seed idempotente.
 *
 * Leads reales del pipeline de expansión, esfuerzos por canal y agenda
 * institucional. Todo se hace con `upsert` sobre claves únicas
 * ([name, country], [channel, title], [title, date]): ejecutarlo dos veces no
 * duplica nada y no pisa lo que el equipo haya editado en el panel
 * (los `update` se limitan a los campos de identidad del seed).
 *
 * Fecha de referencia: 2026-07-31. Las fechas relativas (+7d, +10d, +14d) se
 * calculan desde esa fecha, no desde «hoy», para que reejecutar el seed dentro
 * de un mes no mueva las agendas.
 *
 * Run: npx tsx prisma/seed-saju.ts   (o npm run seed:saju)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import type {
  SajuChannel,
  SajuEffortStatus,
  SajuInterest,
  SajuLeadType,
  SajuStage,
} from "@prisma/client";

const prisma = new PrismaClient();

/** Ancla del pipeline. Mediodía UTC → mismo día natural en Europe/Madrid. */
const REFERENCE = new Date(Date.UTC(2026, 6, 31, 12, 0, 0));

function inDays(days: number): Date {
  return new Date(REFERENCE.getTime() + days * 86_400_000);
}

function onDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

type LeadSeed = {
  name: string;
  country: string;
  company?: string;
  role?: string;
  city?: string;
  type: SajuLeadType;
  stage: SajuStage;
  interest: SajuInterest;
  keyInsight?: string;
  notes?: string;
  nextAction: string;
  nextActionDate: Date;
};

const LEADS: LeadSeed[] = [
  // ── Panamá ───────────────────────────────────────────────────────────────
  {
    name: "Moises Bresiner",
    country: "PA",
    role: "Director Logística",
    company: "Duty Free Americas (Grupo Falic)",
    type: "MULTI_UNIDAD",
    stage: "MATERIAL_ENVIADO",
    interest: "ALTO",
    notes: "Landing enviado, por concretar cita con ejecutivo.",
    nextAction: "Concretar cita con ejecutivo",
    nextActionDate: inDays(7),
  },
  {
    name: "Silvia Peñaranda de Ararat",
    country: "PA",
    company: "Cerámica Italia (familia propietaria)",
    type: "PUNTO_UNICO",
    stage: "EVALUACION_INTERNA",
    interest: "ALTO",
    notes: "Contactada, presentada, hablando en familia.",
    nextAction: "Seguimiento a decisión familiar",
    nextActionDate: inDays(10),
  },
  {
    name: "Salomon Betesh",
    country: "PA",
    company: "Grupo Betesh — Lacoste LATAM, Armani, Construcciones; socio de Florentino Pérez",
    type: "MULTI_UNIDAD",
    stage: "EVALUACION_INTERNA",
    interest: "ALTO",
    keyInsight: "Clave: el hijo, que sigue la marca — champion interno.",
    notes: "Contactado, discutiendo con familia.",
    nextAction: "Cultivar relación con el hijo / seguimiento a decisión",
    nextActionDate: inDays(10),
  },
  {
    name: "Alejandra Betancourt",
    country: "PA",
    role: "Marketing de franquicias — gestiona marketing de 1.000+ UPS Stores",
    company: "Empresa estadounidense de franquicias (ex-CNG, expat en Panamá)",
    type: "PUNTO_UNICO",
    stage: "CONTACTADO",
    interest: "MEDIO",
    keyInsight: "Doble ángulo posible: inversionista o aliada estratégica de marketing.",
    nextAction: "Definir ángulo y agendar conversación",
    nextActionDate: inDays(7),
  },

  // ── Guatemala ────────────────────────────────────────────────────────────
  {
    name: "Tendencia S.A.",
    country: "GT",
    company: "Franquiciados maestros de Totto en Guatemala",
    type: "MASTER_FRANQUICIA",
    stage: "CONTACTADO",
    interest: "ALTO",
    notes:
      "Muy interesados en la marca. De viaje; a su regreso se retoma la conversación.",
    nextAction: "Agendar presentación del modelo a su regreso",
    nextActionDate: inDays(14),
  },

  // ── España ───────────────────────────────────────────────────────────────
  {
    name: "Lead Barcelona (por confirmar nombre)",
    country: "ES",
    city: "Barcelona",
    type: "PUNTO_UNICO",
    stage: "NEGOCIACION",
    interest: "ALTO",
    notes: "Muy interesado en invertir en un punto.",
    nextAction: "Estructurar propuesta y negociar condiciones",
    nextActionDate: inDays(7),
  },
  {
    name: "Lead Madrid (por confirmar nombre)",
    country: "ES",
    city: "Madrid",
    type: "PUNTO_UNICO",
    stage: "NEGOCIACION",
    interest: "ALTO",
    notes: "Muy interesado en invertir en un punto.",
    nextAction: "Estructurar propuesta y negociar condiciones",
    nextActionDate: inDays(7),
  },
  {
    name: "Lead Valencia (por confirmar nombre)",
    country: "ES",
    city: "Valencia",
    type: "PUNTO_UNICO",
    stage: "CONTACTADO",
    interest: "ALTO",
    notes: "Muy interesada; de vacaciones, escribe a su regreso.",
    nextAction: "Retomar conversación a su regreso",
    nextActionDate: inDays(14),
  },
];

/**
 * Los esfuerzos llevan id fijo: dos países pueden compartir título y canal
 * (la pauta de Forbes corre igual en PA y en GT), así que la idempotencia no
 * puede colgar del texto — cuelga de este identificador.
 */
type EffortSeed = {
  id: string;
  channel: SajuChannel;
  title: string;
  country?: string;
  outlet?: string;
  status: SajuEffortStatus;
  plannedFor?: Date;
};

const EFFORTS: EffortSeed[] = [
  {
    id: "saju-eff-outreach-pa",
    channel: "OUTREACH_SELECTIVO",
    country: "PA",
    title: "Outreach selectivo Panamá — red Falic, Betesh, Cerámica Italia",
    status: "EN_CURSO",
  },
  {
    id: "saju-eff-outreach-gt",
    channel: "OUTREACH_SELECTIVO",
    country: "GT",
    title: "Outreach Tendencia S.A. (masters Totto)",
    status: "EN_CURSO",
  },
  {
    id: "saju-eff-outreach-es",
    channel: "OUTREACH_SELECTIVO",
    country: "ES",
    title: "Outreach inversionistas BCN / MAD / VLC",
    status: "EN_CURSO",
  },
  {
    id: "saju-eff-pr-foro-es",
    channel: "PR",
    country: "ES",
    title: "Foro de Marcas Renombradas — presentación institucional",
    status: "PLANEADO",
    plannedFor: onDate(2026, 8, 10),
  },
  {
    id: "saju-eff-pr-pa",
    channel: "PR",
    country: "PA",
    title: "Pauta PR — Forbes + equivalente local a La República",
    outlet: "Forbes CA / medio local",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-pr-gt",
    channel: "PR",
    country: "GT",
    title: "Pauta PR — Forbes + equivalente local a La República",
    outlet: "Forbes CA / medio local",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-pr-es",
    channel: "PR",
    country: "ES",
    title: "Pauta PR — Forbes España + prensa económica",
    outlet: "Forbes España",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-reels-pa",
    channel: "REELS_ADS",
    country: "PA",
    title: "Campaña Reels / Ads — Panamá",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-reels-gt",
    channel: "REELS_ADS",
    country: "GT",
    title: "Campaña Reels / Ads — Guatemala",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-reels-es",
    channel: "REELS_ADS",
    country: "ES",
    title: "Campaña Reels / Ads — España",
    status: "PLANEADO",
  },
  {
    id: "saju-eff-linkedin-global",
    channel: "LINKEDIN",
    title: "Calendario de posts LinkedIn + contenido patrocinado",
    status: "PLANEADO",
  },
];

const MILESTONES = [
  {
    title: "Reunión — Programa de Franquicias y Financiación",
    counterpart: "Oliver Vico — Director Depto. de Franquicias",
    org: "Banco Sabadell",
    country: "ES",
    date: onDate(2026, 8, 3),
    tentative: false,
    notes:
      "Presentar el proyecto y aplicar al programa de franquicias y financiación del banco, del que somos aliados.",
  },
  {
    title: "Presentación de la marca — Foro de Marcas Renombradas de España",
    counterpart: "Pablo López Gil (oficina directa del Rey)",
    org: "Foro de Marcas Renombradas de España",
    country: "ES",
    date: onDate(2026, 8, 10),
    tentative: true,
    notes: "Presentación de la marca al Presidente del Foro.",
  },
];

async function main() {
  console.log("🌱 Seeding SAJÚ command center…");

  for (const lead of LEADS) {
    const data = {
      company: lead.company ?? null,
      role: lead.role ?? null,
      city: lead.city ?? null,
      type: lead.type,
      stage: lead.stage,
      interest: lead.interest,
      keyInsight: lead.keyInsight ?? null,
      notes: lead.notes ?? null,
      nextAction: lead.nextAction,
      nextActionDate: lead.nextActionDate,
      source: "OUTREACH_SELECTIVO" as SajuChannel,
    };

    const created = await prisma.sajuLead.upsert({
      where: { name_country: { name: lead.name, country: lead.country } },
      update: data,
      create: { name: lead.name, country: lead.country, ...data },
      select: { id: true },
    });

    // El evento de alta también es idempotente: sólo se crea si no existe.
    const description = `Lead cargado en el pipeline (${lead.stage}).`;
    const existingEvent = await prisma.sajuLeadEvent.findFirst({
      where: { leadId: created.id, description },
      select: { id: true },
    });
    if (!existingEvent) {
      await prisma.sajuLeadEvent.create({
        data: {
          leadId: created.id,
          type: "NOTA",
          description,
          occurredAt: REFERENCE,
        },
      });
    }
  }
  console.log(`  ✓ ${LEADS.length} leads`);

  for (const effort of EFFORTS) {
    const data = {
      channel: effort.channel,
      title: effort.title,
      country: effort.country ?? null,
      outlet: effort.outlet ?? null,
      status: effort.status,
      plannedFor: effort.plannedFor ?? null,
    };
    await prisma.sajuChannelEffort.upsert({
      where: { id: effort.id },
      update: data,
      create: { id: effort.id, ...data },
    });
  }
  console.log(`  ✓ ${EFFORTS.length} esfuerzos de canal`);

  for (const milestone of MILESTONES) {
    const data = {
      counterpart: milestone.counterpart,
      org: milestone.org,
      country: milestone.country,
      tentative: milestone.tentative,
      notes: milestone.notes,
    };
    await prisma.sajuMilestone.upsert({
      where: { title_date: { title: milestone.title, date: milestone.date } },
      update: data,
      create: { title: milestone.title, date: milestone.date, ...data },
    });
  }
  console.log(`  ✓ ${MILESTONES.length} hitos institucionales`);

  console.log("✅ SAJÚ command center listo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
