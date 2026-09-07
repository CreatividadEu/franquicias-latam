/**
 * Totto Way — seed de demo (idempotente).
 *
 * Fuente literal: docs/totto-way/design/tottoway-data.js (USERS, CHAPTERS,
 * LESSONS, QUIZ, LEAGUE_*, JOURNEY, INSPIRE, BENEFITS). Crea la franquicia
 * TOTTO si no existe, 6 tiendas, los usuarios demo, el Capítulo 01 publicado
 * (8 lecciones + quiz + checkpoint) y los capítulos 02–07 en borrador.
 * Re-ejecutarlo actualiza contenido y no duplica nada; los datos de demo del
 * alumno (progreso, eventos XP, hitos) se regeneran para los usuarios demo.
 *
 * Run: npm run seed:totto-way
 *   TOTTO_WAY_SEED_PASSWORD=otra npm run seed:totto-way   → clave demo distinta
 */
import "dotenv/config";
import { PrismaClient, type Prisma, type UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildChapterSnapshot, slugify, type TwBlock } from "../src/lib/totto-way/content";
import { badgeFor, BADGE_RULES } from "../src/lib/totto-way/xp";

const prisma = new PrismaClient();

const PASSWORD = (process.env.TOTTO_WAY_SEED_PASSWORD ?? "totto2026").trim();
const FRANCHISE_SLUG = (process.env.TOTTO_WAY_FRANCHISE_SLUG ?? "totto").trim();
const DEMO_DOMAIN = "totto-way.demo";
const POSTER = (file: string) => `/totto-way/manual/${file}`;

// ── Datos literales (tottoway-data.js) ─────────────────────────────────────

const STORES = [
  { code: "santafe", name: "Totto Santafé", city: "Bogotá", pos: 1, pts: 18420, delta: 2, team: 9 },
  { code: "andino", name: "Totto Andino", city: "Bogotá", pos: 2, pts: 17910, delta: 0, team: 8 },
  { code: "el-tesoro", name: "Totto El Tesoro", city: "Medellín", pos: 3, pts: 17250, delta: -1, team: 7 },
  { code: "unicentro-cali", name: "Totto Unicentro Cali", city: "Cali", pos: 4, pts: 15880, delta: 1, team: 6 },
  { code: "buenavista", name: "Totto Buenavista", city: "Barranquilla", pos: 5, pts: 14300, delta: -2, team: 6 },
  { code: "cacique", name: "Totto Cacique", city: "Bucaramanga", pos: 6, pts: 13100, delta: 0, team: 5 },
] as const;

type DemoUser = {
  key: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  store: (typeof STORES)[number]["code"] | null;
  code: string;
  xp: number;
  streak: number;
  since: string;
  leaguePos?: number;
  leaguePts?: number;
  onboarded: boolean;
};

const USERS: DemoUser[] = [
  { key: "u1", name: "Camila Rojas", email: `camila.rojas@${DEMO_DOMAIN}`, role: "TW_ASESOR", roleTitle: "Asesor comercial", store: "andino", code: "TA-0412", xp: 2450, streak: 12, since: "2025-03-10", leaguePos: 3, leaguePts: 2450, onboarded: true },
  { key: "u2", name: "Andrés Molina", email: `andres.molina@${DEMO_DOMAIN}`, role: "TW_LIDER_TIENDA", roleTitle: "Líder de tienda", store: "andino", code: "TA-0101", xp: 6120, streak: 34, since: "2022-08-01", onboarded: true },
  { key: "u3", name: "Laura Pérez", email: `laura.perez@${DEMO_DOMAIN}`, role: "FRANCHISE_OWNER", roleTitle: "Franquiciado", store: "unicentro-cali", code: "TF-0001", xp: 1800, streak: 5, since: "2026-01-15", onboarded: false },
  { key: "u4", name: "Sofía Herrera", email: `sofia.herrera@${DEMO_DOMAIN}`, role: "TW_ASESOR", roleTitle: "Asesor comercial", store: "santafe", code: "TS-0207", xp: 3120, streak: 9, since: "2024-05-20", leaguePos: 1, leaguePts: 3120, onboarded: true },
  { key: "u5", name: "Julián Castro", email: `julian.castro@${DEMO_DOMAIN}`, role: "TW_ASESOR", roleTitle: "Asesor comercial", store: "el-tesoro", code: "TT-0318", xp: 2890, streak: 7, since: "2024-09-02", leaguePos: 2, leaguePts: 2890, onboarded: true },
  { key: "u6", name: "Diego Ortiz", email: `diego.ortiz@${DEMO_DOMAIN}`, role: "TW_AUX_LOGISTICO", roleTitle: "Auxiliar logístico", store: "andino", code: "TA-0433", xp: 2310, streak: 3, since: "2025-06-16", leaguePos: 4, leaguePts: 2310, onboarded: true },
  { key: "u7", name: "Valentina Ruiz", email: `valentina.ruiz@${DEMO_DOMAIN}`, role: "TW_ASESOR", roleTitle: "Asesor comercial", store: "unicentro-cali", code: "TC-0155", xp: 2100, streak: 4, since: "2025-08-11", leaguePos: 5, leaguePts: 2100, onboarded: true },
  { key: "u8", name: "Formador Totto Way", email: `formador@${DEMO_DOMAIN}`, role: "TW_FORMADOR", roleTitle: "Formador", store: null, code: "TW-FORM", xp: 0, streak: 0, since: "2026-01-01", onboarded: true },
];

const CHAPTERS = [
  { n: 1, title: "Introducción", sub: "Bienvenida, empresa, cultura y ecosistema SER", color: "#FCCE01" },
  { n: 2, title: "Ser TOTTO", sub: "Identidad del asesor, imagen y actitud", color: "#F6303E" },
  { n: 3, title: "Experiencia de compra", sub: "Los 7 pasos de la venta TOTTO", color: "#000000" },
  { n: 4, title: "Producto", sub: "Líneas, materiales, tecnologías, garantía", color: "#FCCE01" },
  { n: 5, title: "Visual & tienda", sub: "Exhibición, orden, estándares visuales", color: "#F6303E" },
  { n: 6, title: "Operación & caja", sub: "Procesos, inventario, POS, cierre", color: "#000000" },
  { n: 7, title: "Liderazgo en tienda", sub: "Equipo, metas, coaching, indicadores", color: "#FCCE01" },
];

const MISSIONS_01 = [
  { code: "M01", title: "Bienvenida y alcance" },
  { code: "M02", title: "Nuestra empresa y cultura" },
  { code: "M03", title: "Roles y responsabilidades" },
  { code: "M04", title: "Modelo de Excelencia: SER · LOOK · GPS" },
  { code: "M05", title: "Políticas de servicio" },
  { code: "M06", title: "Políticas fundamentales" },
];

type LessonSeed = {
  key: string;
  m: string;
  title: string;
  type: "READING" | "VIDEO";
  min: number;
  xp: number;
  done: boolean;
  poster?: string;
  body: string[];
  takeaway: string;
  rule?: string;
};

const LESSONS_01: LessonSeed[] = [
  { key: "l1", m: "M01", title: "Bienvenida a la expedición", type: "READING", min: 4, xp: 50, done: true, body: [
    "Este manual es tu mapa. No es un reglamento: es la forma en que TOTTO hace las cosas, explicada para que puedas aplicarla desde el primer día en tienda.",
    "Está dirigido a asesores comerciales, líderes de tienda, auxiliares logísticos, jefes comerciales y franquiciados. Cada rol encontrará señales visuales que indican qué le corresponde.",
  ], takeaway: "Léelo en orden la primera vez. Después, úsalo como consulta rápida en tienda." },
  { key: "l2", m: "M02", title: "Quiénes somos: Misión, Visión, Propósito", type: "READING", min: 6, xp: 80, done: true, body: [
    "**Misión:** impulsamos a las personas a moverse, crecer y vivir cada aventura al máximo.",
    "**Visión:** ser la marca que conecta con las historias de quienes no se detienen.",
    "**Propósito:** impulsamos tus sueños, contigo siempre vamos.",
  ], takeaway: "Como asesor no vendes morrales. Vendes acompañamiento, confianza y movimiento." },
  { key: "l3", m: "M02", title: "Principios y valores TOTTO", type: "READING", min: 5, xp: 80, done: true, body: [
    "Innovación · Humildad · Respeto · Integridad · Gana-gana. Estos cinco principios ordenan cada decisión en tienda: desde cómo saludas hasta cómo resuelves una garantía.",
  ], takeaway: "Gana-gana: el cliente gana, la tienda gana, tú ganas. Si alguien pierde, no es TOTTO." },
  { key: "l4", m: "M02", title: "Modelo de negocio y unidades", type: "VIDEO", min: 7, xp: 100, done: true, poster: POSTER("p10-img_p9_1.png"), body: [
    "TOTTO opera tiendas propias, franquicias, canal digital y distribución mayorista en más de 45 países. En tienda representas la promesa completa de la marca.",
  ], takeaway: "Cada tienda es una embajada de la marca. Tu tienda es TOTTO para ese cliente." },
  { key: "l5", m: "M03", title: "Roles del equipo en tienda", type: "READING", min: 6, xp: 80, done: true, body: [
    "Asesor comercial, líder de tienda, auxiliar logístico y jefe comercial: cuatro roles, una sola experiencia. El cliente nunca debería notar dónde termina uno y empieza otro.",
  ], takeaway: "Si ves algo fuera de lugar, es tuyo. No hay \"eso no me toca\"." },
  { key: "l6", m: "M04", title: "Ecosistema SER: las 8 herramientas", type: "VIDEO", min: 9, xp: 120, done: false, poster: POSTER("p21-img_p20_1.png"), body: [
    "SER es el sistema que conecta todas las herramientas de tienda: Geovictoria, TOTTO 360°, Torre de Control, NPS, Atlas 360°, POS, Inventario y Academia.",
    "Ocho herramientas en seis relaciones: TOTTO 360° trabaja en pareja con Torre de Control; NPS con Atlas 360°.",
  ], takeaway: "Ninguna herramienta vive sola. Un dato que entra en una, mueve a las otras." },
  { key: "l7", m: "M05", title: "Geovictoria: registro de jornada", type: "VIDEO", min: 8, xp: 120, done: false, poster: POSTER("p40-img_p39_1.png"), body: [
    "Marca entrada y salida en Geovictoria al iniciar y terminar tu turno. Marca también pausas. El registro alimenta nómina, cobertura de piso y la Liga.",
  ], takeaway: "Sin marcación no hay turno. Sin turno no hay XP.", rule: "Sin marcación no hay turno. Sin turno no hay XP." },
  { key: "l8", m: "M06", title: "Protocolo de antena y seguridad", type: "READING", min: 5, xp: 80, done: false, body: [
    "Cuando suena la antena: acércate con calma, saluda, explica que el sistema se activó, pide revisar el ticket y el producto. Evita introducir tus manos en sus pertenencias. Agradece siempre.",
  ], takeaway: "La antena protege el inventario; tu actitud protege la marca." },
];

const QUIZ_L6 = [
  { q: "¿Cuántas herramientas componen el ecosistema SER?", options: ["Seis", "Ocho", "Diez"], correctIndex: 1, explanation: "Ocho: Geovictoria, TOTTO 360°, Torre de Control, NPS, Atlas 360°, POS, Inventario y Academia." },
  { q: "¿Con qué herramienta trabaja en pareja TOTTO 360°?", options: ["Geovictoria", "NPS", "Torre de Control"], correctIndex: 2, explanation: "TOTTO 360° y Torre de Control trabajan en pareja; NPS lo hace con Atlas 360°." },
  { q: "¿Qué pasa con un dato que entra a una herramienta SER?", options: ["Se queda ahí", "Mueve a las otras", "Se borra al cierre"], correctIndex: 1, explanation: "Ninguna herramienta vive sola." },
];

const JOURNEY_U1 = [
  { date: "2025-03-10", type: "JOINED", title: "Te uniste a la expedición", desc: "Ingreso como asesora comercial · Totto Andino", icon: "flag" },
  { date: "2025-04-22", type: "CHAPTER_DONE", title: "Primer Capítulo completado", desc: "Introducción · 8/8 lecciones · 620 XP", icon: "book" },
  { date: "2025-06-15", type: "BADGE", title: "Insignia Explorador", desc: "2.000 XP acumulados", icon: "badge" },
  { date: "2025-08-30", type: "NPS", title: "NPS 9.4 del mes", desc: "Mejor puntaje del equipo", icon: "star" },
  { date: "2026-09-01", type: "STREAK", title: "Racha de 12 días", desc: "Estás aquí", icon: "fire" },
] as const;

const INSPIRE = [
  { type: "PODCAST", len: 24, title: "Hecho para durar", who: "Natán Bursztyn · Fundador", desc: "Cómo una marroquinera en quiebra en Samper Mendoza se convirtió en una marca de 45 países.", quote: "Hay que subir por las escaleras y no por el ascensor.", featured: true },
  { type: "ARTICLE", len: 8, title: "Forbes: Hecho para durar", who: "Forbes Colombia · Jul 2026", desc: "520 tiendas, 45 países y una sucesión familiar con Benny y Natalie Bursztyn al frente.", externalUrl: "https://forbes.co/negocios/hecho-para-durar-como-yonatan-bursztin-convirtio-a-totto-en-una-marca-global" },
  { type: "VIDEO", len: 6, title: "Lo que llega fácil, se va fácil", who: "Natán Bursztyn · Premio Vida y Obra 2025", desc: "La lección de La Soledad: todo lo valioso se forja con esfuerzo.", quote: "Lo que llega fácil, se va fácil." },
  { type: "MESSAGE", len: 2, title: "La esencia de TOTTO es su gente", who: "Marie Claude Joachim · Talento Humano", desc: "Por qué el 96 % del equipo dice que este es un excelente lugar para trabajar." },
  { type: "PODCAST", len: 18, title: "Vender en 10 segundos", who: "Serie Asesores TOTTO", desc: "Cinco productos cada diez segundos en el mundo. Cómo se siente eso desde el piso de venta." },
  { type: "STORY", len: 5, title: "De 12 referencias a 39.800", who: "Archivo TOTTO", desc: "1988: los primeros morrales de lona en la Feria Internacional de Bogotá." },
] as const;

const BENEFITS = [
  { cat: "Producto", title: "Descuento de colaborador", desc: "Descuento especial en producto TOTTO para ti y tu familia directa.", icon: "bag", countries: [] as string[] },
  { cat: "Ahorro", title: "Fondo de Empleados", desc: "Ahorra del 5 % al 20 % de tu salario por nómina, con rendimientos y crédito automático. Ingreso tras 2 meses de prueba.", icon: "piggy", countries: ["CO"] },
  { cat: "Salud", title: "Seguro médico y prestaciones", desc: "Seguro médico, pensiones, cesantías, primas y vacaciones de ley.", icon: "heart", countries: ["CO"] },
  { cat: "Carrera", title: "Rutas de carrera internas", desc: "El 69 % de las nuevas posiciones se cubren con gente de la casa. Tu progreso en Totto Way cuenta.", icon: "ladder", countries: [] },
  { cat: "Formación", title: "Academia TOTTO", desc: "Capacitación para todos los colaboradores, sin importar el cargo.", icon: "book", countries: [] },
  { cat: "Bienestar", title: "Great Place to Work", desc: "Top 10 de mejores empresas para trabajar en Colombia (GPTW 2023).", icon: "star", countries: ["CO"] },
  { cat: "Inclusión", title: "Programa INCLUYETTE", desc: "Modelo de empleo inclusivo premiado y replicado.", icon: "people", countries: ["CO"] },
  { cat: "Reconocimiento", title: "Liga de la Expedición", desc: "Puntos, insignias y premios trimestrales por tienda e individuales.", icon: "trophy", countries: [] },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function blocksFor(lesson: LessonSeed): TwBlock[] {
  const blocks: TwBlock[] = lesson.body.map((text) => ({ type: "paragraph", text }));
  if (lesson.rule) blocks.push({ type: "rule", text: lesson.rule });
  blocks.push({ type: "simple_translation", text: lesson.takeaway });
  return blocks;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

function dayKeyOf(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

// ── Seed ───────────────────────────────────────────────────────────────────

async function main() {
  const sector = await prisma.sector.upsert({
    where: { slug: "retail" },
    update: {},
    create: { name: "Retail", slug: "retail", emoji: "\u{1F457}" },
  });

  const franchise = await prisma.franchise.upsert({
    where: { slug: FRANCHISE_SLUG },
    update: {},
    create: {
      name: "TOTTO",
      slug: FRANCHISE_SLUG,
      description: "TOTTO (Nalsani S.A.S.) — morrales, maletas y accesorios. Plataforma de formación en tienda Totto Way.",
      investmentMin: 0,
      investmentMax: 0,
      sectorId: sector.id,
      active: true,
      published: false,
      logoUrl: "/totto-way/logo-black.png",
    },
  });
  const franchiseId = franchise.id;

  await prisma.twSettings.upsert({
    where: { franchiseId },
    update: {},
    create: { franchiseId, showGamification: true, sequentialUnlock: true, leagueEnabledCountries: [] },
  });

  // Tiendas
  const storeIds = new Map<string, string>();
  for (const store of STORES) {
    const row = await prisma.twStore.upsert({
      where: { franchiseId_code: { franchiseId, code: store.code } },
      update: { name: store.name, city: store.city },
      create: { franchiseId, code: store.code, name: store.name, city: store.city, country: "CO" },
    });
    storeIds.set(store.code, row.id);
  }

  // Usuarios + empleados
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const userIds = new Map<string, string>();
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, franchiseId },
      create: { email: u.email, passwordHash, name: u.name, role: u.role, franchiseId },
    });
    userIds.set(u.key, user.id);
    const storeId = u.store ? storeIds.get(u.store)! : null;
    await prisma.twEmployee.upsert({
      where: { userId: user.id },
      update: { storeId, roleTitle: u.roleTitle, employeeCode: u.code, xpTotal: u.xp, streakDays: u.streak, onboardedAt: u.onboarded ? new Date(u.since) : null },
      create: {
        userId: user.id,
        franchiseId,
        storeId,
        employeeCode: u.code,
        roleTitle: u.roleTitle,
        since: new Date(u.since),
        onboardedAt: u.onboarded ? new Date(u.since) : null,
        xpTotal: u.xp,
        streakDays: u.streak,
        lastActivityAt: u.streak > 0 ? new Date() : null,
        locale: "es",
      },
    });
    if (u.role === "FRANCHISE_OWNER" && storeId) {
      await prisma.twStoreAccess.upsert({
        where: { userId_storeId: { userId: user.id, storeId } },
        update: {},
        create: { userId: user.id, storeId },
      });
    }
  }

  // Capítulos
  const chapterIds = new Map<number, string>();
  for (const [index, ch] of CHAPTERS.entries()) {
    const slug = `${String(ch.n).padStart(2, "0")}-${slugify(ch.title)}`;
    const row = await prisma.twChapter.upsert({
      where: { franchiseId_number: { franchiseId, number: ch.n } },
      update: { title: ch.title, subtitle: ch.sub, color: ch.color, order: index, slug },
      create: { franchiseId, number: ch.n, slug, title: ch.title, subtitle: ch.sub, color: ch.color, order: index, status: "DRAFT" },
    });
    chapterIds.set(ch.n, row.id);
  }

  // Capítulo 01: misiones, lecciones, quiz, checkpoint
  const ch01 = chapterIds.get(1)!;
  const missionIds = new Map<string, string>();
  for (const [index, m] of MISSIONS_01.entries()) {
    const row = await prisma.twMission.upsert({
      where: { chapterId_code: { chapterId: ch01, code: m.code } },
      update: { title: m.title, order: index },
      create: { chapterId: ch01, code: m.code, title: m.title, order: index },
    });
    missionIds.set(m.code, row.id);
  }

  const lessonIds = new Map<string, string>();
  for (const [index, l] of LESSONS_01.entries()) {
    const slug = slugify(l.title);
    const data = {
      missionId: missionIds.get(l.m)!,
      title: l.title,
      type: l.type,
      minutes: l.min,
      xp: l.xp,
      order: index,
      blocks: blocksFor(l) as unknown as Prisma.InputJsonValue,
      keyTakeaway: l.takeaway,
      ruleBanner: l.rule ?? null,
      posterUrl: l.poster ?? null,
      screenshots: l.poster ? [l.poster] : [],
      docRefs: [],
    };
    const row = await prisma.twLesson.upsert({
      where: { chapterId_slug: { chapterId: ch01, slug } },
      update: data,
      create: { chapterId: ch01, slug, ...data },
    });
    lessonIds.set(l.key, row.id);
  }

  await prisma.twQuiz.upsert({
    where: { lessonId: lessonIds.get("l6")! },
    update: { questions: QUIZ_L6, passScore: 3, bonusXp: 40 },
    create: { lessonId: lessonIds.get("l6")!, questions: QUIZ_L6, passScore: 3, bonusXp: 40 },
  });

  const existingCheckpoint = await prisma.twCheckpoint.findFirst({ where: { chapterId: ch01 } });
  const checkpoint =
    existingCheckpoint ??
    (await prisma.twCheckpoint.create({
      data: {
        chapterId: ch01,
        title: "Checkpoint del Capítulo 01",
        instructions: "Con tu líder de tienda: recorre las 8 herramientas del ecosistema SER, marca tu jornada en Geovictoria y explica el protocolo de antena con tus palabras.",
        xp: 150,
        validatorRole: "TW_LIDER_TIENDA",
      },
    }));

  // Publicar 01 (snapshot congelado)
  const tree = await prisma.twChapter.findUniqueOrThrow({
    where: { id: ch01 },
    include: { missions: true, lessons: { include: { quiz: true } }, checkpoints: true },
  });
  const version = tree.publishedAt ? tree.version + 1 : tree.version;
  const snapshot = buildChapterSnapshot(
    {
      ...tree,
      lessons: tree.lessons.map((l) => ({ ...l, videoSrc: null })),
    },
    new Date(),
    version,
  );
  await prisma.twChapter.update({
    where: { id: ch01 },
    data: { status: "PUBLISHED", version, publishedAt: new Date(), publishedSnapshot: snapshot as unknown as Prisma.InputJsonValue },
  });

  // Badges
  const badgeIds = new Map<string, string>();
  for (const rule of BADGE_RULES) {
    const name = { EXPLORADOR: "Explorador", GUIA: "Guía", LIDER_RUTA: "Líder de ruta", CUMBRE: "Cumbre" }[rule.code];
    const row = await prisma.twBadge.upsert({
      where: { franchiseId_code: { franchiseId, code: rule.code } },
      update: { name, minXp: rule.minXp, icon: rule.icon },
      create: { franchiseId, code: rule.code, name, minXp: rule.minXp, icon: rule.icon },
    });
    badgeIds.set(rule.code, row.id);
  }

  // Temporada activa + scores
  let season = await prisma.twLeagueSeason.findFirst({ where: { franchiseId, name: "Q3 2026" } });
  if (!season) {
    season = await prisma.twLeagueSeason.create({
      data: {
        franchiseId,
        name: "Q3 2026",
        startsAt: new Date("2026-07-01T05:00:00Z"),
        endsAt: new Date("2026-09-30T04:59:59Z"),
        prizeText: "La tienda #1 gana un día de expedición para todo el equipo. El #1 individual, un kit TOTTO completo.",
        status: "ACTIVE",
      },
    });
  }
  const weekKey = "2026-W35";
  for (const store of STORES) {
    const entityId = storeIds.get(store.code)!;
    const prevPosition = store.pos + store.delta;
    await prisma.twLeagueScore.upsert({
      where: { seasonId_entityType_entityId: { seasonId: season.id, entityType: "STORE", entityId } },
      update: { points: store.pts, position: store.pos, prevPosition },
      create: { seasonId: season.id, entityType: "STORE", entityId, points: store.pts, position: store.pos, prevPosition },
    });
    await prisma.twLeagueSnapshot.upsert({
      where: { seasonId_weekKey_entityType_entityId: { seasonId: season.id, weekKey, entityType: "STORE", entityId } },
      update: { points: store.pts, position: prevPosition },
      create: { seasonId: season.id, weekKey, entityType: "STORE", entityId, points: store.pts, position: prevPosition },
    });
  }
  for (const u of USERS) {
    if (!u.leaguePos) continue;
    const entityId = userIds.get(u.key)!;
    const points = u.leaguePts ?? u.xp;
    // La foto de la semana pasada invierte a los dos primeros: así la tabla
    // enseña un ▲ y un ▼ reales en la demo.
    const prevPosition = u.leaguePos === 1 ? 2 : u.leaguePos === 2 ? 1 : u.leaguePos;
    await prisma.twLeagueScore.upsert({
      where: { seasonId_entityType_entityId: { seasonId: season.id, entityType: "USER", entityId } },
      update: { points, position: u.leaguePos, prevPosition },
      create: { seasonId: season.id, entityType: "USER", entityId, points, position: u.leaguePos, prevPosition },
    });
    await prisma.twLeagueSnapshot.upsert({
      where: { seasonId_weekKey_entityType_entityId: { seasonId: season.id, weekKey, entityType: "USER", entityId } },
      update: { points, position: prevPosition },
      create: { seasonId: season.id, weekKey, entityType: "USER", entityId, points, position: prevPosition },
    });
  }

  // Progreso, eventos XP e insignias de los usuarios demo (regenerados)
  const demoUserIds = [...userIds.values()];
  await prisma.twXpEvent.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.twLessonProgress.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.twUserBadge.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.twJourneyMilestone.deleteMany({ where: { userId: { in: demoUserIds } } });
  // También las validaciones: si no, el checkpoint que el Panel líder deja
  // pendiente en la demo desaparece en cuanto alguien lo valida una vez.
  await prisma.twCheckpointValidation.deleteMany({ where: { userId: { in: demoUserIds } } });

  for (const u of USERS) {
    const userId = userIds.get(u.key)!;
    const storeId = u.store ? storeIds.get(u.store)! : null;
    let accounted = 0;
    // u1 va por la mitad del capítulo; u6 lo terminó y deja el checkpoint
    // pendiente de validación para el Panel líder de su tienda.
    const lessonPlan = u.key === "u1" ? LESSONS_01.filter((l) => l.done) : u.key === "u6" ? LESSONS_01 : [];
    if (lessonPlan.length > 0) {
      for (const [index, l] of lessonPlan.entries()) {
        const completedAt = daysAgo(30 - index * 3);
        await prisma.twLessonProgress.create({
          data: { userId, lessonId: lessonIds.get(l.key)!, status: "COMPLETED", startedAt: completedAt, completedAt, xpEarned: l.xp },
        });
        await prisma.twXpEvent.create({
          data: { franchiseId, userId, storeId, source: "LESSON", points: l.xp, dayKey: dayKeyOf(completedAt), refId: lessonIds.get(l.key), createdAt: completedAt },
        });
        accounted += l.xp;
      }
    }
    if (u.xp > accounted) {
      const createdAt = daysAgo(45);
      await prisma.twXpEvent.create({
        data: { franchiseId, userId, storeId, source: "MANUAL", points: u.xp - accounted, dayKey: dayKeyOf(createdAt), meta: { reason: "Saldo inicial (demo)" }, createdAt },
      });
    }
    const current = badgeFor(u.xp);
    for (const rule of BADGE_RULES) {
      if (rule.minXp <= current.minXp) {
        await prisma.twUserBadge.create({ data: { userId, badgeId: badgeIds.get(rule.code)!, earnedAt: new Date(u.since) } });
      }
    }
    if (u.key === "u1") {
      for (const m of JOURNEY_U1) {
        await prisma.twJourneyMilestone.create({
          data: { userId, type: m.type, title: m.title, desc: m.desc, date: new Date(m.date), icon: m.icon },
        });
      }
    }
    if (u.key === "u6") {
      await prisma.twJourneyMilestone.create({
        data: {
          userId,
          type: "JOINED",
          title: "Te uniste a la expedición",
          desc: `Ingreso como ${u.roleTitle.toLowerCase()} · ${STORES.find((s) => s.code === u.store)?.name ?? ""}`,
          date: new Date(u.since),
          icon: "flag",
        },
      });
      await prisma.twJourneyMilestone.create({
        data: {
          userId,
          type: "CHAPTER_DONE",
          title: "Capítulo 01 completado",
          desc: `Introducción · ${LESSONS_01.length}/${LESSONS_01.length} lecciones`,
          date: daysAgo(2),
          icon: "book",
        },
      });
    }
  }

  // El checkpoint queda SIN validar a propósito: es lo que el líder de Totto
  // Andino encuentra pendiente para Diego en el Panel líder.
  void checkpoint;

  // Inspira y beneficios (contenido editorial: se reemplaza completo)
  await prisma.twInspireItem.deleteMany({ where: { franchiseId } });
  for (const [index, item] of INSPIRE.entries()) {
    await prisma.twInspireItem.create({
      data: {
        franchiseId,
        type: item.type,
        title: item.title,
        who: item.who,
        desc: item.desc,
        lengthMin: item.len,
        quote: "quote" in item ? item.quote : null,
        externalUrl: "externalUrl" in item ? item.externalUrl : null,
        featured: "featured" in item ? item.featured : false,
        publishedAt: daysAgo(10 + index),
        order: index,
      },
    });
  }
  await prisma.twBenefit.deleteMany({ where: { franchiseId } });
  for (const [index, b] of BENEFITS.entries()) {
    await prisma.twBenefit.create({
      data: { franchiseId, category: b.cat, title: b.title, desc: b.desc, icon: b.icon, countries: b.countries, eligibilityRoles: [], order: index },
    });
  }

  console.log(`Totto Way listo → /totto-way  (franquicia ${franchise.name}, ${STORES.length} tiendas, ${USERS.length} usuarios demo)`);
  console.log(`Usuarios demo (clave "${PASSWORD}"):`);
  for (const u of USERS) console.log(`  ${u.email.padEnd(36)} ${u.code.padEnd(8)} ${u.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
