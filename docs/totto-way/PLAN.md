# Totto Way · Plan de arquitectura e implementación

> Módulo LMS de formación en tienda de TOTTO dentro de Franquicias LATAM.
> Estado: **borrador para aprobación**. Nada de lo descrito aquí está implementado todavía.
> Fecha: 2026-09-06 · Rama de trabajo propuesta: `feat/totto-way/*` (desde `main`, ver §13).

---

## 0. Resumen ejecutivo

Totto Way se construye como **módulo por marca** siguiendo el patrón de `src/app/saju/` (carpeta propia, CSS namespaced, `_components/`, README) y reutilizando la infraestructura del repo: Prisma + Supabase, JWT propio, Resend, Twilio, Anthropic SDK, i18n por JSON (patrón sandbox) y `node --test`.

Tres cosas **no existen hoy** en el repo y hay que crearlas desde cero:

1. **Scoping multi-tenant.** `FRANCHISE_OWNER` está en el enum pero no se usa en ningún archivo de `src/`; `User` no tiene `franchiseId`. Toda la plataforma es single-admin.
2. **Modelo de contenido / CMS.** No hay modelos de lecciones ni editor de bloques. Totto Way fija esa decisión para el repo.
3. **Sesión de usuario no-admin.** Solo existe `admin_token` + `getAdminUser()`. Hay que añadir `tw_token` + `getTottoWayUser()`.

Decisiones que necesito confirmar antes de implementar (detalle en §15):

| # | Decisión | Propuesta |
|---|---|---|
| D1 | Ubicación del prototipo | Mover `.claude/totto-way/design/` → `docs/totto-way/design/` y commitear (16 MB, 96 % son PNG del manual). |
| D2 | Modelo Claude del asistente | `claude-sonnet-5` (el `claude-sonnet-4-5` del brief ya está superado) + `claude-haiku-4-5` para sugerencias. Configurable por env. |
| D3 | Embeddings para RAG | Anthropic no tiene endpoint de embeddings. Propongo **Voyage AI** (`voyage-3.5`, partner recomendado de Anthropic) + pgvector. Fallback sin clave nueva: búsqueda full-text de Postgres en español + re-ranking con Claude. |
| D4 | Video | MP4 progresivo en Supabase Storage (bucket privado, URLs firmadas) en fases 1–3. HLS/transcoding (Mux o Cloudflare Stream) solo si el volumen lo pide en fase 4. |
| D5 | Manual PDF | Fase 1: el PDF del Capítulo 01 diseñado es un asset estático. Fase 3: vista de impresión `/totto-way/manual/[chapter]` renderizada desde los mismos bloques JSON. |
| D6 | E2E de navegador | Añadir `@playwright/test` como devDependency en fase 4. Fases 1–3: e2e a nivel de route handlers/server actions con stubs de Prisma (patrón `tests/api-sms-verify.test.ts`). |
| D7 | Sequencing con sandbox | La rama `feat/sandbox-m3-estrategia` tiene cambios sin commitear en `prisma/schema.prisma` y una migración nueva. Totto Way nace de `main` en un **worktree** aparte; la migración `totto_way_init` se rebasa cuando M3 del sandbox se mergee. |
| D8 | Fuente Centra No1 | Solo hay Regular (12 KB, sospechosamente pequeño) y Medium (72 KB). Verificar cobertura de glifos (¿ ¡ ñ ® ·) y licencia de self-hosting antes de fase 1. Fallback: Helvetica Neue. |

---

## 1. Hallazgos del repo (lo que condiciona el diseño)

### 1.1 Stack y convenciones confirmadas
- Next.js 16.1.6 App Router, React 19.2, TypeScript, Tailwind v4 (`@theme inline` en `globals.css`, sin `tailwind.config`), shadcn con solo 8 primitivas en `src/components/ui/` (`badge, button, card, dialog, input, input-otp, progress, table`). **No hay** `tabs`, `sheet`, `select`, `dropdown-menu`, `accordion`, `toast`.
- Prisma 6.19 con `prisma.config.ts` (usa `DIRECT_URL`). Migraciones SQL idempotentes (`DO $$ … EXCEPTION WHEN duplicate_object`) con RLS habilitado sin políticas (patrón sandbox). Desde este Mac las migraciones van por el session pooler `:5432`.
- Fuentes: Satoshi global vía `next/font/local` (`--font-inter`); cada módulo carga las suyas en su `layout.tsx`.
- Middleware es `src/proxy.ts` (Next 16). Guarda `/admin/*` solo por **presencia** de cookie; su matcher excluye `/api`.
- `recharts` está instalado pero **no se usa** en ningún archivo. Los gráficos existentes son SVG a mano.
- Anthropic: siete archivos lo usan. Patrón de streaming reutilizable en `src/app/api/demos/don-benitez-os/_lib/anthropic.ts` (`streamTextResponse`). Rate limit en memoria en `src/app/api/business-intel/route.ts`. `src/lib/sandbox/ai.ts` tiene el patrón más maduro: cliente memoizado, Zod, caché por hash, reintentos.
- `src/lib/safeApiJson.ts` es un helper **de cliente** (`fetchJsonSafely`, `parseJsonResponse`), no de servidor. `api/franchise-bot/ask` no llama a Claude: es matching de FAQs por keywords.
- Storage: `src/lib/supabaseAdmin.ts` (solo Storage), buckets `franchise-assets` (público) y `sandbox-assets` (privado, `src/lib/sandbox/storage.ts` con URLs firmadas). Totto Way añade un tercero.
- Email: `src/lib/resend.ts` con dos funciones hardcodeadas (HTML inline, sin plantilla). SMS: `src/lib/twilio.ts` solo Verify (OTP), no mensajería genérica.
- i18n: patrón sandbox (`messages/sandbox.{es,en}.json` + `src/lib/sandbox/i18n.ts`, `t()` con rutas de puntos e interpolación, test que exige mismas claves). Sin librería.
- Tests: `node --import tsx --test --test-concurrency=1 tests/*.test.ts`. Stubs manuales de Prisma.

### 1.2 Módulos existentes con los que Totto Way se integra
| Módulo | Qué hay | Cómo se integra |
|---|---|---|
| **admin** | `src/app/admin/*`, `AdminSidebar.tsx` (array `navItems`), login `POST /api/admin/auth`, cookie `admin_token`, JWT `{userId, role}` 7 días. | Entrada "Totto Way" en `navItems` → `/totto-way/estudio`. SSO: un ADMIN con `admin_token` obtiene `tw_token` sin volver a loguearse (§5.3). |
| **profile** | No hay perfil de persona. `FranchiseProfile` es el perfil de landing de una franquicia. | El perfil del colaborador es nuevo (`Employee` + preferencias). No se duplica nada porque no hay nada que duplicar; se reutiliza `User` (email, passwordHash, name, role). |
| **dashboard** | `admin/page.tsx` (KPIs leads), `saju/dashboard` (command center), `demos/don-benitez-os` (incluye un **academy-workspace** con progreso por sede, tabla de módulos y rutas por rol). | Se reutilizan patrones (KPI band, tabla de equipo, `ToastProvider`, `Portal`, `LeadDrawer` como drawer genérico) copiándolos a `_components/` con tokens Totto; el CSS de saju no se comparte por diseño. |
| **content** | No existe CMS ni editor rich-text. `FranchiseLandingEditor.tsx` (2.488 líneas) es un formulario controlado. | Totto Way introduce el **editor de bloques** (§7). Dependencia nueva mínima: ninguna en fase 1 (bloques JSON con formularios); se evalúa `@tiptap` solo si el párrafo necesita inline marks. |
| **site** | Raíz pública sin route group; `HomeSiteNavbar/Footer`. `/totto-demo` no está noindex. | Totto Way es privado (`robots: noindex` + `X-Robots-Tag`). Redirect `/totto-demo → /totto-way` en `next.config.ts`. |
| **Franchise** | `model Franchise` con `slug`, `featureFlags`, `moduleConfig`, `botConfig`. | Totto = un registro `Franchise` (`slug: "totto"`). Todas las tablas `tw_*` cuelgan de `franchiseId`. |

### 1.3 Lo que hay de Totto hoy
- `src/app/totto-demo/page.tsx` (1.779 líneas): 100 % hardcodeado, sin `fetch`, cinco espacios (no tres). Reutilizable: `ProgressRing`, `AnimatedNumber` y poco más. El seed real viene de `tottoway-data.js`, no de `TRAINING_MODULES`.
- `src/app/api/totto-demo/route.ts`: la página nunca lo llama; usa `fetch` crudo y `claude-sonnet-4-20250514`. Se elimina.
- `src/lib/intel/totto-model.ts` + `(standalone)/intel/totto`: simulador financiero de falsificación. **No se toca**; solo comparte el nombre de marca.
- Prototipo en `.claude/totto-way/design/` (no en `docs/`): dos `.dc.html` con **estilos inline** (sin clases), `tottoway-data.js`, 40 PNG del manual, 2 TTF. El manual impreso tiene 54 páginas carta apaisada, 8 misiones, +1.300 XP en total. **No existe taxonomía de códigos DOC**: "DOC" es un sello genérico que aparece dos veces en la leyenda. Hay que definirla (§7.3).

---

## 2. Arquitectura

```
src/app/totto-way/                      ← módulo por marca (patrón saju)
  layout.tsx                            fonts Centra (next/font/local) + metadata noindex + <div class="tw-root">
  totto-way.css                         design system Totto, todo bajo .tw-root
  README.md
  login/page.tsx                        split screen, sin shell
  onboarding/page.tsx                   3 pantallas, primer login
  (app)/                                route group con shell (sidebar / bottom nav / header / asistente)
    layout.tsx                          requireTottoWayUser() + <TwShell>
    page.tsx                            Inicio
    aprender/page.tsx                   grid 7 capítulos
    aprender/[chapter]/page.tsx         capítulo
    aprender/[chapter]/[lesson]/page.tsx lección (reading | video | checklist | checkpoint)
    liga/page.tsx
    mi-viaje/page.tsx
    inspira/page.tsx · inspira/[id]/page.tsx
    beneficios/page.tsx
    perfil/page.tsx
    lider/page.tsx                      Panel líder (guard por rol)
    estudio/…                           Estudio de contenido (guard TW_FORMADOR | ADMIN)
    manual/[chapter]/page.tsx           vista de impresión (fase 3)
  _components/                          UI Totto (ver §6)

src/lib/totto-way/                      ← dominio, sin React
  auth.ts        getTottoWayUser, requireTottoWayUser, scope por rol, mint/clear tw_token
  scope.ts       TwScope { franchiseId, storeIds | "all", role } + helpers where()
  xp.ts          reglas puras: puntos por evento, insignias, racha, caps diarios   (testeado)
  league.ts      cálculo de temporada, posiciones, deltas                            (testeado)
  progress.ts    estado de lección/capítulo, desbloqueo secuencial                  (testeado)
  content.ts     esquema Zod de bloques + validación de publicación                 (testeado)
  queries.ts     lecturas Prisma con scope
  i18n.ts        t() sobre messages/totto-way.{es,en}.json                          (testeado)
  storage.ts     bucket totto-way-assets (privado, signed URLs)
  notify.ts      emails/SMS de Totto Way sobre resend/twilio
  assistant/     prompts.ts, tools.ts, retrieval.ts, stream.ts
  api.ts         requireTwApi(), jsonError(), readJson() (patrón sandbox/admin.ts)

src/app/api/totto-way/
  auth/route.ts          POST login (email o código + password) → tw_token
  auth/sso/route.ts      POST admin_token → tw_token (ADMIN entra como formador)
  logout/route.ts
  assistant/route.ts     POST streaming (text/event-stream) con tool use
  media/sign/route.ts    URL firmada para subir video/poster (estudio)
  webhooks/geovictoria/route.ts  · webhooks/nps/route.ts
  cron/league/route.ts   recalcula LeagueScore + snapshot semanal (Vercel Cron + CRON_SECRET)
  cron/reminders/route.ts recordatorio diario e inactividad > 7 días

messages/totto-way.es.json (base es-CO) · messages/totto-way.en.json
prisma/migrations/<ts>_totto_way_init/migration.sql
prisma/seed-totto-way.ts  ← literal de tottoway-data.js
tests/totto-way-*.test.ts
```

Principios:
- **Server Components + Server Actions** para lecturas y mutaciones (patrón `saju/dashboard/actions.ts`: cada acción revalida la sesión en servidor). Route handlers solo para: login/logout (cookies), streaming del asistente, webhooks, cron y firmas de storage.
- **El cliente nunca es fuente de autoridad**: XP, desbloqueo, validaciones y ≥ 90 % de video se calculan en servidor.
- **Todo `tw_*` con `franchiseId`** y consultas siempre a través de `TwScope`.
- CSS: un archivo, todo bajo `.tw-root`, tokens declarados dentro del namespace (igual que `.saju-root`). Tailwind solo para layout utilitario dentro del módulo; los componentes de marca usan clases `tw-*`.

---

## 3. Modelo de datos (Prisma, migración `totto_way_init`)

Todos los modelos con `@@map("tw_*")`, `franchiseId` (FK a `franchises`, `onDelete: Cascade`) e índices por `franchiseId`. Enums nuevos con prefijo `Tw`.

### 3.1 Cambios en modelos existentes
```prisma
enum UserRole {
  ADMIN
  FRANCHISE_OWNER          // = franquiciado
  TW_ASESOR
  TW_LIDER_TIENDA
  TW_AUX_LOGISTICO
  TW_JEFE_COMERCIAL
  TW_FORMADOR
}

model User {
  …                        // sin cambios en columnas existentes
  franchiseId   String?    // NUEVO. null para ADMIN de plataforma
  franchise     Franchise? @relation(…)
  employee      TwEmployee?
  storeAccess   TwStoreAccess[]
}
```
`Franchise` recibe las relaciones inversas (`stores`, `users`, `twSettings`). Migración aditiva: `ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS …` (fuera de transacción, en pasos separados) + `ALTER TABLE users ADD COLUMN franchiseId`.

### 3.2 Organización y acceso
```
TwStore          id, franchiseId, code, name, city, country(ISO-2), timezone, active
TwEmployee       userId(@unique), franchiseId, storeId, employeeCode(@unique por franchise), roleTitle,
                 since, onboardedAt?, xpTotal(cache), streakDays(cache), lastActivityAt, locale, prefs(Json)
TwStoreAccess    userId, storeId          // multi-tienda para JEFE_COMERCIAL y FRANCHISE_OWNER
TwSettings       franchiseId(@id), showGamification, sequentialUnlock, dailyReminderHour, leagueEnabledCountries[]
```
Decisión: `TwSettings` no está en el brief pero es donde viven `showGamification` (§5 del brief) y el desbloqueo secuencial "config por admin" (§4.3). Por país se resuelve con `leagueEnabledCountries` sobre `TwStore.country`.

### 3.3 Contenido
```
TwChapter        id, franchiseId, number(1–7), slug, title, subtitle, color, order, status(DRAFT|PUBLISHED), version,
                 publishedAt?, publishedSnapshot(Json?)   // árbol congelado al publicar
TwMission        id, chapterId, code(M01…), title, order
TwLesson         id, missionId, chapterId, slug, title, type(READING|VIDEO|CHECKLIST|CHECKPOINT), minutes, xp, order,
                 blocks(Json)            // array de bloques del vocabulario Totto (§7)
                 keyTakeaway, ruleBanner?, videoAssetId?, posterUrl?, screenshots[], docRefs[]
TwQuiz           id, lessonId(@unique), questions(Json), passScore, bonusXp
TwCheckpoint     id, chapterId, title, instructions, xp, validatorRole(UserRole)
TwMediaAsset     id, franchiseId, kind(VIDEO|POSTER|SUBTITLE|PDF|IMAGE), storagePath, durationSec?, status(UPLOADED|READY), meta
```
Versionado: editar toca el árbol DRAFT; **publicar** incrementa `version` y guarda `publishedSnapshot` (capítulo + misiones + lecciones + quiz serializados). Las pantallas del alumno leen siempre del snapshot; el estudio lee del árbol vivo. Es lo más simple que cumple "publicar versiones" sin tablas de historial.

### 3.4 Progreso y gamificación
```
TwLessonProgress       userId, lessonId, status(NOT_STARTED|IN_PROGRESS|COMPLETED), startedAt, completedAt,
                       videoSeconds, videoDuration, quizScore, xpEarned          @@unique([userId, lessonId])
TwCheckpointValidation checkpointId, userId, validatedBy, validatedAt, xpAwarded @@unique([checkpointId, userId])
TwXpEvent              id, franchiseId, userId, storeId, source(LESSON|QUIZ|CHECKPOINT|ATTENDANCE|NPS|INSPIRE|MANUAL),
                       points, dayKey(YYYY-MM-DD en TZ de la tienda), refId?, meta, createdAt
                       @@unique([userId, source, dayKey]) parcial para ATTENDANCE e INSPIRE (cap 1/día)
TwBadge                id, franchiseId, code(EXPLORADOR|GUIA|LIDER_RUTA|CUMBRE), name, minXp, icon
TwUserBadge            userId, badgeId, earnedAt
TwLeagueSeason         id, franchiseId, name, startsAt, endsAt, prizeText, status
TwLeagueScore          seasonId, entityType(STORE|USER), entityId, points, position, prevPosition, updatedAt
TwLeagueSnapshot       seasonId, weekKey, entityType, entityId, points, position   // para el delta ▲▼
TwJourneyMilestone     userId, type(JOINED|CHAPTER_DONE|BADGE|NPS|STREAK|PROMOTION|CUSTOM), title, desc, date, icon, createdBy?
```
`TwLeagueSnapshot` no está en el brief; hace falta para "delta vs semana anterior" sin recomputar histórico.

### 3.5 Inspira, beneficios, asistente
```
TwInspireItem     id, franchiseId, type(PODCAST|ARTICLE|VIDEO|MESSAGE|STORY), title, who, desc, lengthMin,
                  mediaUrl?, externalUrl?, quote?, featured, publishedAt?, scheduledAt?
TwBenefit         id, franchiseId, category, title, desc, icon, eligibilityRoles[], countries[], link?, order
TwKnowledgeChunk  id, franchiseId, source(CHAPTER|LESSON|BENEFIT|INSPIRE|SOP), sourceId, locator(Json: capítulo/misión/página),
                  text, tsv (tsvector generado, spanish), embedding Unsupported("vector(1024)")?, version
TwAssistantThread id, userId, lessonId?, createdAt
TwAssistantMessage id, threadId, role(USER|ASSISTANT), content, citations(Json), toolCalls(Json?), createdAt
TwAssistantQuestionStat  franchiseId, normalizedQuestion, count, lastAskedAt   // agregado anónimo para el estudio
```
pgvector: `CREATE EXTENSION IF NOT EXISTS vector;` en la migración (Supabase lo trae). Prisma no tipa `vector`: se declara `Unsupported` y la similitud se hace con `$queryRaw`. Si D3 se resuelve "sin embeddings", `embedding` queda null y `retrieval.ts` usa solo `tsv`.

### 3.6 Seed (`prisma/seed-totto-way.ts`)
Fuente literal: `tottoway-data.js`. Crea `Franchise` totto si no existe, `TwSettings`, 6 tiendas de `LEAGUE_STORES`, usuarios demo (`USERS` → `User` + `TwEmployee`, password por env `TOTTO_WAY_SEED_PASSWORD`), capítulos 01–07 (01 PUBLISHED con 8 lecciones y el quiz de `l6`; 02–07 DRAFT vacíos), badges, temporada `Q3 2026`, `JOURNEY` de u1, `INSPIRE`, `BENEFITS`, `KB` como chunks SOP. Idempotente (upsert por códigos). Guardado por `ALLOW_DEV_SEED` como el resto.

---

## 4. Rutas y mapa de pantallas

| Ruta | Rol mínimo | Datos | Notas UX (del prototipo) |
|---|---|---|---|
| `/totto-way/login` | público | — | Split 50/50, foto `photo-mision.png` con scrim, lema `clamp(48px,7vw,96px)`, formulario 380px, botón negro → rojo hover. Acepta email **o** `employeeCode`. |
| `/totto-way/onboarding` | cualquiera con `onboardedAt = null` | — | 3 pasos; al terminar marca `onboardedAt` y redirige a Inicio. |
| `/totto-way` | todos | progreso, liga tienda, racha, siguiente insignia, tareas del día, frase, top 4 | Hero negro + 4 tarjetas de vidrio (`rgba(255,255,255,.08)` + blur 6px). Móvil: apilado, 2×2. |
| `/totto-way/aprender` | todos | capítulos del snapshot + progreso | Grid `minmax(260px,1fr)`, numeral 120px marca de agua, estados %/Disponible/Bloqueado. |
| `/totto-way/aprender/[chapter]` | todos | misiones, lecciones, checkpoint, PDF | Cabecera negra numeral amarillo 96px, filas `44px|1fr|auto`, aside con PDF y checkpoint amarillo. |
| `/totto-way/aprender/[chapter]/[lesson]` | todos | bloques, quiz, progreso | Player 16:9 con poster, cuerpo 17px/1.5, bloque negro, banda amarilla, pasos rojos, chips DOC, quiz lateral 280px, botón "Completar · +XP", toast amarillo. Link fijo al asistente con `lessonId`. |
| `/totto-way/liga` | todos (si `showGamification`) | scores temporada activa + snapshot | Toggle Por tienda/Individual (segmented pill), tabla `48px|1fr|auto|auto`, fila propia amarilla, #1 en rojo, tarjeta negra "Cómo se ganan puntos", amarilla premio + countdown. Franquiciado: solo sus tiendas + posición global anonimizada. |
| `/totto-way/mi-viaje` | todos | milestones, badge actual, ruta de carrera | Timeline con raíl `linear-gradient(#000 0/66%, #D9D9D9)`, nodos 24px, futuro al 70 %. |
| `/totto-way/inspira` | todos | items publicados | Hero negro con `photo-vision.png` al 25 %, player de audio, grid `minmax(250px,1fr)`. Consumir → +20 XP (cap diario). |
| `/totto-way/beneficios` | todos | benefits filtrados por rol y país de la tienda | Primera amarilla, "Carrera" negra, detalle expandible. |
| `/totto-way/perfil` | todos | employee, badges, certificaciones, prefs | Cabecera con avatar amarillo 84px, XP grande. Preferencias: idioma, recordatorio, notificaciones Liga. |
| `/totto-way/lider` | TW_LIDER_TIENDA, TW_JEFE_COMERCIAL, FRANCHISE_OWNER, TW_FORMADOR, ADMIN | equipo por scope, checkpoints pendientes | 4 KPIs, tabla `auto|1fr|160px|auto|auto`, botón "Validar checkpoint" → negro "Validado ✓" + toast. Filtro por tienda. CSV. |
| `/totto-way/estudio/**` | TW_FORMADOR, ADMIN | árbol vivo | CRUD Chapter→Mission→Lesson→Quiz, editor de bloques, media, Inspira, Beneficios, publicar, analítica. |
| `/totto-way/manual/[chapter]` | todos | snapshot | Vista de impresión carta apaisada (fase 3). |

Navegación: sidebar 236px negra (desktop) con Inicio · Aprender · Liga · Mi viaje · Inspira · Beneficios · Perfil · Panel líder (condicional) + tarjeta de usuario abajo; bottom nav 72px (≤ 820px) con Inicio · Aprender · Liga · Mi viaje · Perfil y "más" que abre sheet con el resto. Header 64px con eyebrow + título, pills racha/XP y botón Asistente con punto rojo.

Redirects en `next.config.ts`: `/totto-demo` y `/totto-demo/:path*` → `/totto-way` (permanent). Header `X-Robots-Tag: noindex` para `/totto-way/:path*`.

---

## 5. Auth, roles y scoping

### 5.1 Sesión Totto Way
- Cookie `tw_token` (httpOnly, lax, 7 días, path `/`), firmada con el mismo `JWT_SECRET` y `signToken/verifyToken` existentes. Payload se mantiene `{ userId, role }`; el resto (franchise, store, scope) se lee de DB por request, igual que `getAdminUser()`.
- `src/lib/auth.ts` añade:
  - `getTottoWayUser()` → `null` o `{ user, employee, franchiseId, scope }` para roles `TW_*`, `FRANCHISE_OWNER` con `franchiseId`, y `ADMIN` (que entra como formador global: `scope = "all"`).
  - `requireTottoWayUser(opts?: { roles?: UserRole[] })` → redirect a `/totto-way/login` o `notFound()` si el rol no alcanza.
- `src/proxy.ts`: guarda `/totto-way/*` salvo `/totto-way/login*` por presencia de `tw_token` **o** `admin_token` (el SSO del §5.3 convierte la segunda en la primera). Igual que `/admin`, la validez real se comprueba en el layout.
- Login `POST /api/totto-way/auth`: `{ identifier, password }`; `identifier` es email o `employeeCode`. Acepta roles `TW_*`, `FRANCHISE_OWNER` con `franchiseId` y `ADMIN`; rechaza cualquier usuario sin `TwEmployee` salvo ADMIN. `bcrypt.compare` como en `/api/admin/auth`.

### 5.2 Scope
```ts
type TwScope = { franchiseId: string; storeIds: string[] | "all"; role: UserRole };
```
| Rol | storeIds |
|---|---|
| TW_ASESOR, TW_AUX_LOGISTICO | `[employee.storeId]` (solo lectura de equipo) |
| TW_LIDER_TIENDA | `[employee.storeId]` + puede validar checkpoints |
| TW_JEFE_COMERCIAL, FRANCHISE_OWNER | `TwStoreAccess` del usuario |
| TW_FORMADOR | `"all"` dentro de su `franchiseId` |
| ADMIN | `"all"`, franchise = totto (o la que indique `?franchise=` en estudio, futuro) |

`scope.ts` expone `storeWhere(scope)`, `employeeWhere(scope)`, `assertStoreInScope(scope, storeId)`. **Toda** consulta de `queries.ts` y toda server action recibe el scope; nunca `storeId` desde el cliente sin `assertStoreInScope`.

### 5.3 SSO con el admin de la plataforma
`POST /api/totto-way/auth/sso`: lee `admin_token`, verifica ADMIN, emite `tw_token` con el mismo `userId`. La entrada del `AdminSidebar` apunta a `/totto-way/estudio`; el layout de `(app)` detecta `admin_token` sin `tw_token` y llama al SSO antes de renderizar. El brief pide "reutiliza el auth (SSO)": esto es lo mínimo que lo cumple sin un segundo sistema.

### 5.4 Multi-tenant
- `User.franchiseId` es la raíz. Un franquiciado (`FRANCHISE_OWNER`) ve solo tiendas de `TwStoreAccess`.
- Un ADMIN de plataforma sigue siendo global; la separación por marca llega cuando haya una segunda franquicia usando el LMS (fuera de alcance).
- RLS habilitado sin políticas en todas las `tw_*` (Prisma entra como owner), como en sandbox.

---

## 6. Componentes

### 6.1 Reutilizados (copiar/adaptar, no importar cross-módulo)
| Origen | Destino / uso |
|---|---|
| `src/components/ui/{button,card,badge,input,progress,table,dialog}` | Se usan directamente con clases `tw-*` encima. Se añaden vía shadcn: `tabs`, `sheet`, `select`, `switch`, `dropdown-menu`. |
| `src/app/saju/dashboard/_components/{ToastProvider,Portal,LeadDrawerProvider}` | `_components/TwToast.tsx` (toast amarillo "+120 XP · título"), `TwDrawer.tsx`. |
| `src/lib/sandbox/i18n.ts` | Se extrae la parte genérica a `src/lib/i18n/dictionary.ts` (`createDictionary(es, en)`); sandbox y totto-way la consumen. Refactor pequeño, cubierto por `tests/sandbox-i18n.test.ts`. |
| `src/lib/sandbox/admin.ts` (`requireAdminApi`, `jsonError`, `readJson`, `formatZodIssues`) | Patrón para `src/lib/totto-way/api.ts`. |
| `src/lib/sandbox/storage.ts` | Patrón para `storage.ts` (bucket privado + signed upload). |
| `src/lib/sandbox/ai.ts` | Cliente Anthropic memoizado, Zod y reintentos → `assistant/client.ts`. |
| `api/demos/don-benitez-os/_lib/anthropic.ts` `streamTextResponse` | Se promueve a `src/lib/anthropic/stream.ts` y se usa en el asistente. |
| `src/app/totto-demo/page.tsx` `ProgressRing`, `AnimatedNumber` | `_components/TwProgressRing.tsx`, `TwCountUp.tsx`. |
| `src/components/benitez-os/academy-workspace.tsx` | Referencia de tabla de equipo + progreso por sede para `/lider`. |
| `AdminSidebar.navItems` | + `{ href: "/totto-way/estudio", label: "Totto Way" }`. |

### 6.2 Nuevos (`src/app/totto-way/_components/`)
Shell: `TwShell`, `TwSidebar`, `TwBottomNav`, `TwHeader`, `TwUserCard`.
Vocabulario: `Eyebrow`, `SimpleTranslation` (bloque negro), `RuleBand` (banda amarilla "!"), `Steps` (números rojos), `XpChip`, `DocChip`, `MissionTabs`, `BadgeMedallion`, `TwProgress`, `GlassCard`, `Timeline`.
Aprendizaje: `ChapterCard`, `LessonRow`, `LessonBody` (BlockRenderer), `VideoPlayer` (`<video>` + poster + marcadores + velocidad + `<track>` subtítulos + reporte de `videoSeconds` cada 10 s por server action), `QuizPanel`, `CompleteLessonButton`, `AssistantLink`.
Liga/viaje: `LeagueTable`, `LeagueToggle`, `ScoringCard`, `PrizeCountdown`, `JourneyTimeline`, `CareerPath`.
Inspira/beneficios/perfil: `InspireHero` (audio player), `InspireCard`, `BenefitCard`, `ProfileHeader`, `BadgesCard`, `CertificatesCard`, `PreferencesForm`.
Líder: `TeamTable`, `ValidateCheckpointButton`, `LeaderKpis`, `StoreFilter`, `ExportCsvButton`.
Estudio: `ContentTree`, `BlockEditor` (+ un formulario por tipo de bloque), `QuizEditor`, `MediaUploader`, `PublishDialog`, `AnalyticsPanel`.
Asistente: `AssistantPanel` (380×620 flotante / sheet móvil), `AssistantMessage`, `SuggestionChips`, `Citation`.

Sin emojis; iconos Lucide con `strokeWidth={1.8}`.

---

## 7. Contenido: bloques, versionado y manual

### 7.1 Vocabulario de bloques (`content.ts`, Zod)
```ts
type TwBlock =
  | { type: "paragraph"; text: string }                       // texto plano + **negrita** → <b> (font-weight 500)
  | { type: "simple_translation"; text: string }              // bloque negro "Traducción simple"
  | { type: "rule"; text: string }                            // banda amarilla "!"
  | { type: "steps"; items: { lead?: string; text: string }[] }
  | { type: "doc"; code: string; label: string; href?: string }
  | { type: "image"; assetId: string; alt: string; caption?: string }
  | { type: "video"; assetId: string; posterAssetId?: string; markers?: { sec: number; label: string }[] }
  | { type: "checklist"; items: string[] }                    // solo lecciones CHECKLIST
```
El editor solo ofrece estos ocho. `BlockRenderer` es el único que los pinta; la vista de impresión reutiliza el mismo renderer con CSS `@media print`.

### 7.2 Publicación
`publishChapter(chapterId)`: valida con Zod que cada lección tenga ≥ 1 bloque, `keyTakeaway`, `xp > 0`, quiz con 3 preguntas si existe, y que las lecciones VIDEO tengan asset `READY`. Escribe `publishedSnapshot`, `version++`, `status = PUBLISHED`. Reindexa `TwKnowledgeChunk` del capítulo (fase 3).

### 7.3 Códigos DOC
No existen en el manual. Propuesta: `DOC-<CAP>-<NN>` (ej. `DOC-01-03`) con tabla en el estudio (`docRefs[]` de lección apunta a un `TwMediaAsset` kind PDF o a un enlace externo). Se confirma con Totto.

### 7.4 Manual impreso
Fase 1: `docs/totto-way/design/TottoWay-Capitulo-01.dc.html` exportado a PDF y subido como `TwMediaAsset` PDF del capítulo 01; el aside enlaza a él. Fase 3: `/totto-way/manual/[chapter]` renderiza el snapshot con `BlockRenderer` en páginas carta apaisada; el PDF se genera desde esa vista (Chromium headless en un job, o "Guardar como PDF"). Aviso: la maquetación a mano de 54 páginas del prototipo no se reproducirá al 100 % desde bloques genéricos; se acepta una versión "manual generado" más sobria.

---

## 8. Gamificación

`xp.ts` (puro, testeado):
```
LESSON       lesson.xp (50–120)          1 vez por lección
QUIZ         +40 si 3/3                  1 vez por lección
CHECKPOINT   +150                        1 vez por checkpoint, lo crea el validador
ATTENDANCE   +10                         cap 1/día (dayKey en TZ tienda)
INSPIRE      +20                         cap 1/día
NPS          +300 a la tienda            1 vez por (store, month)
MANUAL       libre, solo TW_FORMADOR/ADMIN, con motivo
```
`awardXp(tx, { scope, userId, storeId, source, points, refId, meta })` en una transacción Prisma: inserta `TwXpEvent` (la unique parcial rechaza duplicados de cap diario), incrementa `TwEmployee.xpTotal`, recalcula racha (`lastActivityAt` vs `dayKey`), otorga insignias por umbral (`0 / 5.000 / 12.000 / 25.000`) creando `TwUserBadge` + `TwJourneyMilestone`, e incrementa `TwLeagueScore` de la temporada activa (user y store). Si `TwSettings.showGamification = false` o el país está fuera de `leagueEnabledCountries`, el evento se registra igual pero la UI oculta Liga/XP.

`league.ts`: `recomputeSeason(seasonId)` suma `TwXpEvent` en el rango, ordena, escribe posiciones; `snapshotWeek(seasonId, weekKey)` guarda posiciones; `delta = prevPosition - position`. Cron nocturno `/api/totto-way/cron/league` (Vercel Cron en `vercel.json`, header `Authorization: Bearer ${CRON_SECRET}`). Temporadas trimestrales creadas por el estudio; histórico visible en `/liga?temporada=`.

Desbloqueo secuencial (`progress.ts`): capítulo N disponible si `sequentialUnlock = false` o el N-1 está completo (todas las lecciones COMPLETED y checkpoint validado si existe).

Video: `saveVideoProgress(lessonId, seconds, duration)` guarda el máximo visto; `completeLesson` exige `videoSeconds / videoDuration ≥ 0.9` para tipo VIDEO.

---

## 9. Asistente Totto Way

- Endpoint `POST /api/totto-way/assistant` (`runtime = "nodejs"`, `maxDuration = 60`), autenticado con `tw_token`, rate limit por usuario (patrón `business-intel`, 30/h), body Zod `{ threadId?, message, lessonId? }`.
- Cliente `@anthropic-ai/sdk` memoizado. Modelo `TOTTO_WAY_AI_MODEL ?? "claude-sonnet-5"`; sugerencias con `TOTTO_WAY_AI_MODEL_FAST ?? "claude-haiku-4-5"`. `client.messages.stream(...)` con `max_tokens` amplio; respuesta como `text/event-stream` con eventos `delta`, `tool`, `citations`, `done`.
- System prompt base del brief + contexto (rol, tienda, país, lección abierta, locale). El system prompt fijo va primero con `cache_control: { type: "ephemeral" }`; el contexto variable después.
- **Retrieval** (`retrieval.ts`): top-k chunks por híbrido (`tsv` spanish + coseno pgvector si hay embeddings), filtrados por `franchiseId` y capítulos PUBLISHED; se inyectan como bloques `document` con `citations: { enabled: true }` para que las citas salgan estructuradas (`document_index` → `locator`).
- **Tools** (tool use con `strict: true`): `search_kb(query)`, `open_lesson(lessonId)`, `show_benefit(benefitId)`, `log_checkpoint_request(checkpointId, note)`. Las tres últimas son "client actions": el servidor las valida contra el scope y las emite al cliente como evento `tool` para navegar/abrir; `log_checkpoint_request` además crea una notificación al líder.
- Persistencia: `TwAssistantThread/Message` con citas; `TwAssistantQuestionStat` se alimenta con la pregunta normalizada (sin userId) para la analítica del estudio.
- Embeddings (D3): job `reindexChapter` al publicar, `reindexAll` como script. Voyage vía `fetch` a `api.voyageai.com` con `VOYAGE_API_KEY`; si falta, se omite `embedding` y funciona solo con FTS.
- Local: `ANTHROPIC_API_KEY` en `.env` es un placeholder (memoria del proyecto); el asistente mostrará el estado "no configurado" con copy de marca en vez de 500.

---

## 10. Integraciones y notificaciones

| Integración | Mecanismo | Fase |
|---|---|---|
| Geovictoria | `POST /api/totto-way/webhooks/geovictoria` con secreto compartido; mapea `employeeCode` → `awardXp(ATTENDANCE)`. Fallback: cron que lee un CSV/API si no hay webhook. | 4 |
| NPS | `POST /api/totto-way/webhooks/nps` mensual por tienda → `awardXp(NPS)` + milestone. | 4 |
| Email | `notify.ts` sobre `resend`: recordatorio diario, cambio de posición en Liga, checkpoint validado, hito custom. Plantilla HTML única con tokens Totto. | 2 |
| SMS/WhatsApp | `twilio.ts` solo tiene Verify. Añadir `sendSms(to, body)` con Messaging Service (`TWILIO_MESSAGING_SERVICE_SID`, hoy comentado como legacy en `.env.example`). Opt-in en preferencias. | 2 (email) / 4 (SMS) |
| Certificados PDF | `@react-pdf/renderer` en servidor, folio `TW-<franchise>-<user>-<chapter>-<n>`, guardado en storage privado. | 4 |
| Telemetría | `TwEvent` ligero o reutilizar `track.ts` de saju hacia `dataLayer`; eventos `lesson_started/completed`, `quiz_answered`, `assistant_asked`, `league_viewed`. | 1 (client stub) |

Variables de entorno nuevas: `TOTTO_WAY_AI_MODEL`, `TOTTO_WAY_AI_MODEL_FAST`, `SUPABASE_TOTTO_WAY_BUCKET`, `TOTTO_WAY_SEED_PASSWORD`, `CRON_SECRET`, `VOYAGE_API_KEY` (opcional), `GEOVICTORIA_WEBHOOK_SECRET`, `NPS_WEBHOOK_SECRET`. Se documentan en `.env.example`.

---

## 11. Diseño y tokens

`totto-way.css` bajo `.tw-root`:
```css
.tw-root {
  --tw-black:#000; --tw-yellow:#FCCE01; --tw-red:#F6303E; --tw-white:#FFF;
  --tw-bg:#F4F4F4; --tw-text:#666; --tw-line:#E5E5E5;
  --tw-muted-dark:#C6C6C6; --tw-positive:#0A8F3C;   /* delta ▲ de la Liga, ya en el prototipo */
  --tw-font: var(--font-centra), "Helvetica Neue", Helvetica, Arial, sans-serif;
  --tw-r-card:18px; --tw-r-hero:20px; --tw-r-pill:999px; --tw-r-input:10px;
}
```
- Centra No1 vía `next/font/local` desde `public/fonts/totto/` (Regular 400, Medium 500). No hay 700: `b, strong { font-weight: 500 }`.
- Títulos `letter-spacing:-.03em`, eyebrows `11–12px .14em` mayúsculas rojo (amarillo sobre negro), cuerpo de lección `17px/1.5`.
- Sombras solo en chat (`0 24px 70px rgba(0,0,0,.28)`), toast y botón play. Animaciones `pop` y `fadeUp`; `prefers-reduced-motion` respetado.
- Breakpoint único 820px (como el prototipo). Targets ≥ 44px. Texto sobre amarillo siempre negro (contraste ~14:1); gris `#666` sobre blanco 5.7:1 OK; `#C6C6C6` sobre negro 12.3:1 OK.
- Se documenta en `SAJU_BRAND.md`-style: `docs/totto-way/BRAND.md`. `design-system.md` recibe una sección corta "Módulos por marca" que enlaza a saju, sandbox y totto-way (hoy esa doctrina solo vive en los README).

Assets: 40 PNG del manual → `public/totto-way/manual/` (posters de video y screenshots), fotos de marca → `public/totto-way/`. Se optimizan con `next/image`.

---

## 12. Calidad y tests

- `tests/totto-way-xp.test.ts`: reglas de puntos, caps diarios, insignias, racha.
- `tests/totto-way-league.test.ts`: posiciones, deltas, temporadas, scoping de franquiciado.
- `tests/totto-way-progress.test.ts`: desbloqueo secuencial, ≥ 90 % de video, estado de capítulo.
- `tests/totto-way-content.test.ts`: Zod de bloques, validación de publicación, snapshot.
- `tests/totto-way-i18n.test.ts`: mismas claves es/en, sin hojas vacías.
- `tests/totto-way-auth.test.ts`: `getTottoWayUser` con stub de Prisma, scope por rol, SSO.
- `tests/totto-way-lesson-flow.test.ts` (e2e de dominio): login → progreso de video → quiz → completar → XP → progreso en dashboard, todo con stubs de Prisma sobre las server actions.
- `tests/totto-way-assistant.test.ts`: retrieval híbrido y mapeo de citas con cliente Anthropic stub.
- Fase 4: Playwright (D6) para los tres e2e de navegador del brief.
- `npm run typecheck` y `npm run lint` limpios en cada PR. Accesibilidad: revisión manual con axe en las 5 pantallas principales.

---

## 13. Fases, ramas y PRs

Rama base: `main`. Trabajo en un worktree (`git worktree add ../franquicias-latam-totto -b feat/totto-way/foundation main`) para no tocar el árbol sucio del sandbox (D7).

| Fase | Rama | Entregable | Tests |
|---|---|---|---|
| **1a** | `feat/totto-way/plan` | Este PLAN, `docs/totto-way/design/` movido, `BRAND.md`. | — |
| **1b** | `feat/totto-way/foundation` | Enum + `User.franchiseId`, modelos `tw_*`, migración, seed, `auth.ts`/`proxy.ts`, `scope.ts`, `i18n`, layout + CSS + fuentes, login, onboarding, redirect de `/totto-demo`, borrado de `totto-demo`. | auth, i18n |
| **1c** | `feat/totto-way/learn` | Inicio, Aprender, Capítulo, Lección (reading + video + quiz), XP + toast, Perfil. | xp, progress, lesson-flow |
| **2a** | `feat/totto-way/league` | Liga (temporadas, cron, snapshots, histórico), Mi viaje. | league |
| **2b** | `feat/totto-way/leader` | Panel líder, validación de checkpoints, CSV, alertas de inactividad, emails Resend. | + notify |
| **3a** | `feat/totto-way/inspire-benefits` | Inspira (audio, +20 XP), Beneficios. | — |
| **3b** | `feat/totto-way/assistant` | Asistente con streaming, retrieval, tool use, hilos, stats. | assistant |
| **3c** | `feat/totto-way/studio` | Estudio: CRUD, editor de bloques, media, publicar, analítica, vista de impresión. | content |
| **4** | `feat/totto-way/integrations` | Geovictoria, NPS, SMS, certificados PDF, es-MX/es-ES/pt-BR, Playwright, hardening. | e2e navegador |

Cada PR: checklist (migración aplicada en preview, seed idempotente, typecheck, tests, capturas móvil + desktop, README del módulo actualizado). Commits pequeños con prefijo `feat(totto-way):`.

---

## 14. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Conflicto de `schema.prisma`/migraciones con la rama sandbox M3 sin mergear | Migración de Totto Way no aplica o pisa la del sandbox | Worktree desde `main`; rebase de `totto_way_init` al mergear M3; timestamp posterior. |
| `ALTER TYPE … ADD VALUE` no puede ir dentro de la misma transacción que su uso | `prisma migrate deploy` falla | Migración en dos archivos: primero el enum, luego tablas. |
| Centra No1 Regular incompleta o sin licencia web | Glifos rotos en español o riesgo legal | Verificar en 1a; fallback Helvetica Neue; pedir a Totto el paquete de fuente web. |
| No hay embeddings de Anthropic | RAG requiere un proveedor más | D3: FTS primero, Voyage opcional. |
| Rate limit en memoria no persiste entre lambdas de Vercel | Límite laxo del asistente | Aceptable en fase 3; tabla `tw_rate_limit` o Upstash si hace falta. |
| Video en Supabase sin transcoding | Archivos grandes, sin adaptive bitrate en 4G | MP4 H.264 ≤ 720p subido desde el estudio con validación de tamaño; Mux en fase 4 si el LCP/consumo lo exige. |
| Manual impreso desde bloques no iguala el diseño a mano | Expectativa de "misma fuente" | D5: PDF diseñado como asset en fase 1; versión generada más sobria en fase 3 y se valida con Totto. |
| `getTottoWayUser` hace 2–3 queries por request | Latencia en cada página | Una sola query con `include: { employee: { include: { store: true } }, storeAccess: true }` + `React.cache`. |
| ADMIN global ve todas las franquicias | Fuga si un día hay dos marcas en el LMS | Fuera de alcance; el scope ya lleva `franchiseId`, solo faltaría el selector. |
| Supabase se auto-pausa en el plan gratuito | Todas las rutas con DB caen a la vez | Memoria del proyecto: comprobar el estado del proyecto antes de depurar. |

---

## 15. Preguntas abiertas para el OK

1. **D1–D8** de la tabla del §0.
2. ¿El franquiciado (`FRANCHISE_OWNER`) también es alumno (tiene `TwEmployee` y progreso) o solo supervisa? Propongo: ambos, con `TwEmployee` opcional.
3. ¿Los usuarios TW se crean solo desde el estudio (alta por CSV/uno a uno) o hay auto-registro con código de tienda? Propongo: solo desde el estudio en fase 1.
4. ¿Idioma base `es-CO` implica variantes de copy (p. ej. "morral" vs "mochila")? El JSON `es` es es-CO; `es-MX`/`es-ES` en fase 4.
5. ¿Hay una cuenta de Voyage o prefieres arrancar solo con FTS?
6. Confirmar el formato de `employeeCode` (¿el mismo de Geovictoria?) para que el webhook mapee sin tabla intermedia.

Si respondes "adelante", empiezo por 1a (mover el prototipo y `BRAND.md`) y 1b en el worktree desde `main`.
