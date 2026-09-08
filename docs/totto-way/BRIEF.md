# PROMPT PARA CLAUDE CODE — Totto Way LMS dentro de Franquicias LATAM

> Copia todo este archivo como primer mensaje en Claude Code (modelo: fable 5.1 / el más capaz disponible), abierto en la raíz del repo `franquicias-latam`.

---

## 0. Rol y forma de trabajar

Eres un ingeniero senior full-stack + diseñador de producto. Vas a construir **Totto Way**, la plataforma de formación en tienda de TOTTO, como un módulo dentro de mi plataforma existente **Franquicias LATAM**.

**Stack real del repo (ya verificado — úsalo tal cual):**
- Next.js 16 (App Router, `src/app`), React 19, TypeScript, Tailwind v4 + shadcn (`components.json`, `radix-ui`, `class-variance-authority`, `tailwind-merge`), `lucide-react` para iconos, `framer-motion`, `recharts`.
- Prisma 6 (`prisma/schema.prisma`, migraciones en `prisma/migrations`, seeds `prisma/seed-*.ts` con `tsx`), Supabase (`src/lib/supabaseAdmin.ts`) para storage/DB.
- Auth propia: JWT (`src/lib/auth.ts`: `signToken`, `verifyToken`, cookie `admin_token`), `bcryptjs`, `model User { role UserRole }` con enum `ADMIN | FRANCHISE_OWNER`. Extiende el enum y el helper de auth; no metas otro sistema de auth.
- Anthropic SDK ya instalado (`@anthropic-ai/sdk`). Referencia de patrón bot: `src/app/api/franchise-bot/ask/route.ts` (FAQ matching sobre `FranchiseBotFaq`).
- Modelo de franquicia: `model Franchise` (con `FranchiseProfile`, `FranchiseFeatureFlags`, `FranchiseModuleConfig`) — Totto es una `Franchise`; sus tiendas y empleados son nuevas entidades colgadas de ella.
- Email `resend`, SMS `twilio`, i18n por JSON en `messages/` (patrón sandbox), tests con `node --test` + `tsx` en `tests/*.test.ts`.
- Ya existe un demo `src/app/totto-demo/` (page.tsx monolítico de 1.780 líneas con espacios dashboard/training/uploads) y `src/lib/intel/totto-model.ts`. **Reemplázalo** por el módulo real: ruta `src/app/totto-way/`, reutilizando lo que sirva de `totto-demo` y migrando su ruta con redirect.

**Antes de escribir código:**
1. Lee `design-system.md`, `docs/PROJECT_AUDIT.md`, `src/app/admin/layout.tsx`, `src/app/saju/` (patrón de módulo por marca con `data.ts`, `_components`, `dashboard`, README) y `src/app/totto-demo/page.tsx`. Totto Way sigue el patrón **saju**: carpeta por marca con su CSS, componentes y README.
2. Localiza los módulos existentes de **admin, profile, dashboard, content, site** y el modelo de datos actual (Franchise, User). Totto Way se **integra** con esos módulos; no los duplica.
3. Escribe primero `docs/totto-way/PLAN.md` con: arquitectura, modelo de datos, rutas, componentes reutilizados, componentes nuevos, riesgos. Espera mi OK antes de implementar (o sigue si te digo "adelante").
4. Trabaja en ramas `feat/totto-way/*`, commits pequeños, PRs con checklist. Cada módulo termina con tests (unit + e2e de la ruta crítica) y un `README` del módulo.

Prototipo de referencia visual y de UX (fuente de verdad del diseño), en `docs/totto-way/design/`: `TottoWay-Plataforma.dc.html` (abre en navegador), `tottoway-data.js` (seed literal), `TottoWay-Capitulo-01.dc.html` (manual impreso), `assets/` (logo, fuentes Centra, screenshots del manual, fotos). Replica jerarquía, copy, colores, tipografía y comportamiento. Donde el prototipo y el repo choquen en componentes base (botones, inputs), gana el design system del repo pero con los tokens de marca Totto.

---

## 1. Identidad Totto (tokens)

- Colores: negro `#000000`, amarillo `#FCCE01`, rojo `#F6303E`, blanco `#FFFFFF`, gris fondo `#F4F4F4`, gris texto `#666666`, líneas `#E5E5E5`. Nada más. Solo 1–2 colores de acento por pantalla.
- Tipografía: **Centra No1** (Regular 400, Medium 500; archivos en `assets/fonts/`). Fallback Helvetica Neue. Títulos con `letter-spacing:-0.03em`, eyebrows en mayúsculas `letter-spacing:.14em` 11–12px rojo.
- Vocabulario visual fijo (viene del manual impreso; úsalo igual en digital):
  - **Eyebrow rojo** = contexto (Misión 04 · Componente SER).
  - **Bloque negro "Traducción simple"** = la idea en una línea.
  - **Banda amarilla con "!"** = regla que no se negocia.
  - **Números rojos** = pasos de un proceso.
  - **Chip negro +XP** = recompensa.
  - **Pestañas laterales M01–M08** = misiones (en digital: tabs/anchors).
- Lema: **¿LISTOS? ¡VAMOS!** Tono: cálido, directo, segunda persona, frases cortas.
- Sin emojis en producción: usa el set de iconos del repo (o Lucide si no hay) en estilo línea 1.8px.
- Todo responsive: móvil primero en tienda (sidebar → bottom nav de 5 ítems + "más"), escritorio para líderes/franquiciados/admin.

---

## 2. Roles y permisos

Extiende `enum UserRole` en Prisma: añade `TW_ASESOR`, `TW_LIDER_TIENDA`, `TW_AUX_LOGISTICO`, `TW_JEFE_COMERCIAL`, `TW_FORMADOR` (mantén `ADMIN` y `FRANCHISE_OWNER`; `FRANCHISE_OWNER` = franquiciado). Añade `model Store { id, franchiseId, name, city, country }` y `model Employee { userId, storeId, roleTitle, since }`. Nuevo helper `getTottoWayUser()` junto a `getAdminUser()` en `src/lib/auth.ts`, cookie `tw_token`, middleware en `src/proxy.ts` para `/totto-way/*`.

- Todos: Inicio, Aprender, Liga, Mi viaje, Inspira, Beneficios, Perfil, Asistente.
- `lider_tienda`, `jefe_comercial`, `franquiciado`: + **Panel líder** (equipo de su/sus tiendas, validar checkpoints, ver progreso, Liga por tienda).
- `formador_admin`: + **Estudio de contenido** (CRUD de capítulos/lecciones/quizzes/videos/inspira/beneficios, publicar versiones, ver analítica global).
- Multi-tenant: un franquiciado solo ve sus tiendas. Respeta el scoping de tenants ya existente en Franquicias LATAM.

---

## 3. Modelo de datos (Prisma — nueva migración `totto_way_init`, todos los modelos con `@@map("tw_*")` y `franchiseId` para scoping)

```
Chapter        id, number(01–07), title, subtitle, color, order, status(draft|published), version
Mission        id, chapter_id, code(M01…), title, order
Lesson         id, mission_id, title, type(reading|video|checklist|checkpoint), minutes, xp, order,
               body(rich/MDX), key_takeaway("Traducción simple"), rule_banner(nullable), video_asset_id(nullable),
               screenshots[] (imágenes del manual), doc_refs[] (códigos DOC del manual)
Quiz           id, lesson_id, questions[{q, options[], correct_index, explanation}], pass_score, bonus_xp
Checkpoint     id, chapter_id, title, instructions, xp, validator_role
LessonProgress user_id, lesson_id, status, started_at, completed_at, video_seconds, quiz_score, xp_earned
CheckpointValidation checkpoint_id, user_id, validated_by, validated_at, xp_awarded
XpEvent        id, user_id, store_id, source(lesson|quiz|checkpoint|attendance|nps|manual), points, meta, created_at
Badge          id, code(explorador|guia|lider_ruta|cumbre), name, min_xp, icon
UserBadge      user_id, badge_id, earned_at
LeagueSeason   id, name(Q3 2026), starts_at, ends_at, prize_text
LeagueScore    season_id, store_id|user_id, points (materializada desde XpEvent; recalcular por job)
JourneyMilestone user_id, type(joined|chapter_done|badge|nps|streak|promotion|custom), title, desc, date, icon
InspireItem    id, type(podcast|article|video|message|story), title, who, desc, length_min, media_url|external_url, quote, featured, published_at
Benefit        id, category, title, desc, icon, eligibility_roles[], link
KnowledgeChunk id, source(chapter|lesson|benefit|inspire|sop), source_id, text, embedding(vector), version
AssistantThread / AssistantMessage  user_id, role, content, citations[], created_at
```

Seed inicial: **usa literalmente `tottoway-data.js`** (USERS de demo, CHAPTERS 01–07, LESSONS del Capítulo 01 con sus 8 lecciones, QUIZ, LEAGUE_*, JOURNEY, INSPIRE, BENEFITS, KB). Los capítulos 02–07 se crean como `draft` con título/subtítulo y lecciones vacías.

---

## 4. Módulos y UX (uno por uno, en este orden)

### 4.1 Login / SSO
- Reutiliza el auth de Franquicias LATAM (SSO). Pantalla split: izquierda foto de marca a sangre con overlay negro y el lema gigante `¿LISTOS? / ¡VAMOS!` (VAMOS en amarillo); derecha formulario blanco (correo o código de colaborador + contraseña; "olvidé mi clave"; botón negro → rojo en hover).
- Primer login: onboarding de 3 pantallas (qué es Totto Way, cómo se gana XP, tu primera misión) → Dashboard.

### 4.2 Dashboard (Inicio)
- Hero negro "Continúa donde ibas": capítulo/misión actual, lecciones restantes, próximo XP, CTA amarillo **Continuar lección** + secundario "Ver los 7 capítulos". A la derecha 4 tarjetas de vidrio: Progreso total %, Posición Liga tienda, Racha días, Siguiente insignia (XP faltante).
- **Hoy en tienda**: lista accionable de 3–5 tareas del día (marcar Geovictoria +10, lección pendiente, checkpoint, contenido Inspira). Cada fila navega.
- **Frase del día** (rotación de citas de InspireItem.quote) con CTA al podcast.
- **Tu equipo** (top 4 de la tienda con puntos) → Liga.
- Móvil: hero apilado, tarjetas 2×2, listas a ancho completo.

### 4.3 Aprender → Capítulo → Lección
- **Aprender**: grid de 7 tarjetas-capítulo con numeral gigante en marca de agua, barra de progreso, estado (% / Disponible / Bloqueado). Desbloqueo secuencial (config por admin).
- **Capítulo**: cabecera negra con numeral amarillo 96px, lista de lecciones (icono tipo, eyebrow `M0x · tipo`, título, min, chip +XP, check). Aside: enlace al **manual impreso PDF** del capítulo (mismo contenido) y tarjeta amarilla **Checkpoint del capítulo**.
- **Lección**:
  - `video`: player 16:9 negro (usa el player del repo o `<video>` HLS), poster = screenshot del manual, barra amarilla de progreso, marcadores de capítulo, velocidad, subtítulos. Guarda `video_seconds`; la lección solo se puede completar con ≥ 90 % visto.
  - `reading`: cuerpo tipográfico 17px/1.5, bloque negro **Traducción simple**, banda amarilla si hay regla, pasos con números rojos, chips DOC.
  - Quiz lateral (3 preguntas, feedback inmediato amarillo/rojo, bonus +40 si 3/3). Botón **Completar · +XP** → toast amarillo "+120 XP · título" → vuelve al capítulo.
  - Enlace fijo "¿Dudas? Pregúntale al Asistente" que abre el chat con contexto de la lección.
- **Los contenidos con screenshots del manual (Geovictoria, TOTTO 360°, Torre de Control, POS, etc.) se producen como video paso a paso**; deja el asset `video_asset_id` listo y un placeholder con el screenshot como poster mientras se graban.

### 4.4 Liga de la Expedición
- Toggle **Por tienda / Individual**. Tabla: posición (rojo el #1), nombre + ciudad + personas, delta ▲▼ vs semana anterior, puntos. Fila propia resaltada en amarillo.
- Tarjeta negra **Cómo se ganan puntos** (tabla de XpEvent.source → puntos) y tarjeta amarilla **Premio del trimestre** con cuenta regresiva.
- Temporadas trimestrales; job nocturno recalcula `LeagueScore`; histórico de temporadas.
- Franquiciado ve solo sus tiendas en "Por tienda" (+ posición global anonimizada).

### 4.5 Mi viaje (historia del colaborador)
- Timeline vertical con línea negra (hecho) → gris (futuro). Hitos: ingreso, capítulos, insignias, NPS del mes, rachas, ascensos. Hito actual = tarjeta negra con punto rojo. Futuros al 70 % opacidad.
- Aside: insignia actual con progreso a la siguiente; **Ruta de carrera** (Asesor → Asesor senior → Líder de tienda → Jefe comercial) ligada a capítulos requeridos.
- Los hitos se generan automáticamente desde eventos; el líder puede añadir hitos custom (reconocimientos).

### 4.6 Inspira (contenido extra-LMS)
- Hero negro con foto de marca al 25 %: episodio destacado del **podcast de Natán Bursztyn "Hecho para durar"** (player de audio, progreso amarillo, cita en tarjeta amarilla).
- Grid de tarjetas: Podcast / Artículo (Forbes "Hecho para durar", enlace externo) / Video / Mensaje (Talento Humano) / Historia (archivo de marca). Hover amarillo.
- Consumir un ítem de Inspira suma +20 XP (máx 1/día).
- Admin puede programar publicaciones y notificaciones push/email.

### 4.7 Beneficios
- Grid de tarjetas por categoría (Producto, Ahorro, Salud, Carrera, Formación, Bienestar, Inclusión, Reconocimiento). Primera tarjeta amarilla, una negra de contraste (Carrera). Cada una con detalle expandible, elegibilidad por rol/país y enlace a trámite.
- Seed con los beneficios de `tottoway-data.js` (descuento colaborador, Fondo de Empleados 5–20 %, seguro y prestaciones, rutas de carrera 69 % internas, Academia, GPTW top 10, INCLUYETTE, Liga). Marcar cuáles son por país/franquicia.

### 4.8 Perfil
- Cabecera: avatar amarillo, rol (eyebrow rojo), nombre 30px, tienda · ciudad · desde; XP grande a la derecha. Tarjetas: Insignias, Certificaciones por capítulo (descargables PDF con folio), Preferencias (idioma, recordatorio diario, notificaciones Liga). Integra con el módulo **profile** existente (no dupliques campos).

### 4.9 Panel líder
- KPIs: equipo activo, progreso medio, checkpoints por validar, posición Liga.
- Tabla de equipo: avatar, nombre, rol · lección actual, barra de progreso, puntos, botón **Validar checkpoint** (→ negro "Validado ✓", +150 XP al colaborador, toast). Filtros por tienda (franquiciado/jefe).
- Exportar CSV; alertas de inactividad > 7 días.

### 4.10 Estudio de contenido (admin)
- CRUD de todo el árbol Chapter → Mission → Lesson → Quiz con editor de bloques que **solo permite los bloques del vocabulario Totto** (párrafo, Traducción simple, banda !, pasos numerados, chip DOC, imagen/screenshot, video). Versionado y publicación; el PDF del manual y la plataforma comparten fuente.
- Subida de video (storage del repo), poster automático, subtítulos.
- Analítica: finalización por lección, tiempo, aciertos del quiz, preguntas más frecuentes al Asistente (para mejorar el manual).

### 4.11 Asistente Totto Way (embebido, Claude)
- Botón "Asistente" en el header (punto rojo) y enlaces contextuales en cada lección. Panel flotante 380×620 (móvil: sheet a pantalla completa). Cabecera negra, avatar amarillo, chips de preguntas sugeridas, burbujas usuario negro / asistente blanco, estado "Consultando el manual…".
- Backend: `src/app/api/totto-way/assistant/route.ts` con `@anthropic-ai/sdk` (`claude-sonnet-4-5` por defecto, `haiku` para sugerencias), streaming, **RAG** sobre `KnowledgeChunk` (pgvector en Supabase; embeddings de capítulos publicados, SOPs, beneficios, Inspira). Sigue el patrón de `api/franchise-bot/ask` para validación y errores (`safeApiJson`). Nunca exponer la API key al cliente.
- System prompt (base): *"Eres el Asistente Totto Way, guía de formación de TOTTO en tienda. Responde en español, breve (≤ 90 palabras), cálido y directo, tono de marca ('¿Listos? ¡Vamos!'). Usa solo la base de conocimiento recuperada; si no está, dilo y sugiere preguntar al líder de tienda. Cierra con 'Traducción simple:' cuando expliques un proceso. Cita capítulo/misión/página."*
- Pasa contexto: rol del usuario, tienda, país, lección abierta. Muestra citas con enlace a la lección/página del manual. Registra hilos; admin ve preguntas frecuentes agregadas (anonimizadas).
- Acciones del asistente (tool use): `open_lesson(id)`, `show_benefit(id)`, `log_checkpoint_request(...)`, `search_kb(query)`.

---

## 5. Gamificación (reglas)

| Evento | Puntos |
|---|---|
| Lección completada | +50 a +120 (según lección) |
| Quiz 3/3 | +40 |
| Checkpoint validado por líder | +150 |
| Marcación puntual Geovictoria (integración/webhook) | +10 / día |
| Consumir Inspira | +20 / día máx |
| NPS ≥ 9 del mes | +300 a la tienda |

Insignias: Explorador (0), Guía (5.000), Líder de ruta (12.000), Cumbre (25.000). Racha: días consecutivos con ≥ 1 evento. Feature flag `showGamification` para apagar Liga/XP por país si lo pide legal/RRHH.

---

## 6. Integraciones
- Geovictoria (asistencia) → XpEvent `attendance` vía webhook/cron.
- NPS (herramienta actual) → XpEvent `nps` mensual por tienda.
- Notificaciones: `resend` (email) y `twilio` (SMS/WhatsApp) ya configurados en `src/lib/` para recordatorio diario, cambios de Liga, checkpoint validado.
- Exportar certificados PDF (servidor).

---

## 7. Calidad
- Accesibilidad AA: contraste ≥ 4.5:1 (texto sobre amarillo siempre negro), foco visible, targets ≥ 44px en móvil.
- Performance: LCP < 2.5 s en 4G; imágenes optimizadas; video con poster.
- i18n listo (es-CO base; es-MX, es-ES, pt-BR luego).
- Tests: `tests/totto-way-*.test.ts` con `node --test` (mismo runner del repo); unit de reglas XP/Liga; e2e: login → lección video → quiz → completar → toast → progreso en dashboard; líder valida checkpoint; asistente responde con cita.
- Telemetría de producto: eventos `lesson_started/completed`, `quiz_answered`, `assistant_asked`, `league_viewed`.

---

## 8. Entregables por fase
1. **Fase 1 (semana 1–2):** PLAN.md, modelo de datos + migraciones + seed, Login, Dashboard, Aprender/Capítulo/Lección (reading + video + quiz), XP + toasts, Perfil integrado.
2. **Fase 2:** Liga (temporadas, jobs), Mi viaje, Panel líder + validación de checkpoints, notificaciones.
3. **Fase 3:** Inspira, Beneficios, Asistente Claude con RAG y tool use, Estudio de contenido, analítica.
4. **Fase 4:** integraciones Geovictoria/NPS, certificados PDF, i18n, hardening, e2e completo.

Empieza por el paso 0: lee el repo y redacta `docs/totto-way/PLAN.md`. ¿Listos? ¡Vamos!
