# Sandbox — microsite interactivo por cliente

Ruta pública `/sandbox/[slug]`: la sesión de 12–15 minutos que un consultor
recorre con un prospecto en una llamada o demo. Siete paradas (Intro ·
Estrategia · Finanzas · Operaciones · Legal · Marketing · Reporte) sobre el
chrome de Franquicias LATAM (navy + teal) con el canvas en el acento del
cliente. Este documento es la referencia de arquitectura y operación; el
brief funcional completo vive en el prompt de producto.

## Estado por hito

| # | Hito | Estado |
|---|------|--------|
| 1 | Esqueleto: schema + migración, `/sandbox/[slug]`, rail de progreso, i18n, tokens, modo presentador, PIN, Intro y Reporte | **Hecho** |
| 2 | Admin `/admin/sandbox` + pipeline de preload (uploads, extracción, preview editable) | Pendiente |
| 3 | Estrategia (swipe deck, titular, radar, ruta) | Pendiente |
| 4 | Finanzas (`lib/sandbox/finance.ts` + tests, sliders, motor de escala) | Pendiente |
| 5 | Operaciones (dolor → estándar en 3 formatos, chat agéntico, auditoría) | Pendiente |
| 6 | Legal + Marketing (anatomía del contrato, Seneor, marca, ficha, ideas) | Pendiente |
| 7 | Reporte (resultado, PDF, email, replay de eventos en admin) | Pendiente |
| 8 | Pulido (motion, móvil, reduced motion, Lighthouse, seed completo) | Pendiente |

## Mapa de archivos

```
messages/sandbox.{es,en}.json        toda la copy (UI + notas del presentador)
prisma/schema.prisma                  modelos Sandbox* (namespace sandbox_*)
prisma/migrations/20260903120000_add_sandbox/
prisma/seed-sandbox.ts                sesión de ensayo /sandbox/demo-asadero
src/app/sandbox/layout.tsx            fuente serif editorial, metadata noindex
src/app/sandbox/sandbox.css           tokens --sb-* y utilidades (scoped)
src/app/sandbox/[slug]/page.tsx       carga de sesión, PIN, presenter, fase inicial
src/lib/sandbox/phases.ts             las 7 paradas y su presupuesto de tiempo
src/lib/sandbox/i18n.ts               diccionario tipado + t()
src/lib/sandbox/color.ts              contraste del acento sobre el navy
src/lib/sandbox/schemas.ts            zod: preload (§3) y salidas de IA (§4)
src/lib/sandbox/session.ts            loader + proyección pública + cookie PIN
src/lib/sandbox/actions.ts            server actions (eventos, PIN, idioma, email)
src/lib/sandbox/slug.ts               slugs base58 no adivinables
src/components/sandbox/*              todo el UI del sandbox (nada compartido)
tests/sandbox-*.test.ts
```

## Modelo de datos

- `SandboxSession` — una por prospecto. `slug` único (12 chars base58), `pin`
  opcional de 4 dígitos, `status` (`DRAFT → READY → LIVE → DONE → ARCHIVED`),
  FK opcional `franchiseId` a `franchises` (reutiliza la marca del
  marketplace), campos de marca desnormalizados (nombre, sector, país, ciudad,
  logo, acento), `locale`, `marketingInputs` (quick-form del admin).
- `SandboxAsset` — documentos subidos (bucket privado `sandbox-assets`, hito
  2) con `extractedJson` y estado de extracción por archivo.
- `SandboxPreload` — una fila por sesión: `offering`, `pains`, `marketing`,
  `opexSkeleton` (formas en `schemas.ts`). Es lo ÚNICO derivado de documentos
  que llega al navegador del cliente.
- `SandboxEvent` — log append-only (`phase`, `type`, `payload`). Alimenta el
  replay del admin y el reporte.
- `SandboxResult` — take-homes y resultado final (radar, titular, ruta,
  finanzas, dolor elegido, idea, manual, checklist legal, PDF, email).
- `SandboxAiCache` — cache por sesión de llamadas a Claude, clave
  `(sessionId, kind, inputHash)`.

Las seis tablas tienen RLS habilitado sin políticas: Prisma entra como owner;
la Data API de Supabase no puede leerlas.

## Ruta pública: qué viaja al cliente

`toClientSession()` en `session.ts` es la única proyección: marca de la
sesión, acento resuelto, `preload` validado con zod (o `null`) y los
take-homes ya guardados en `SandboxResult`. Nunca `pin`, assets,
`marketingInputs` ni nada del admin (§8).

- `?fase=<id>` — fase inicial; el cliente la sincroniza con
  `history.replaceState` al avanzar (sin localStorage).
- `?presenter=1` — rail del consultor (tiempos, beats, notas, saltos). Atajos:
  `←` `→` cambian de fase, `N` muestra u oculta el rail. Un admin logueado
  entra sin PIN.
- PIN: `verifySandboxPin` compara en servidor y deja una cookie httpOnly
  `sb_pin_<slug>` (HMAC de slug:pin con `JWT_SECRET`, 12 h, scope
  `/sandbox/<slug>`).
- Estado: la primera apertura del cliente (no presentador) pasa
  `READY → LIVE`.

## Diseño

- Chrome = Franquicias LATAM: navy `#0A0F1E`, teal `#00F0FF` para progreso y
  acciones de sistema, Satoshi (global `--font-inter`).
- Canvas = cliente: `--sb-accent` se inyecta por sesión ya contrastado sobre
  el navy (`resolveAccent`, AA ≥ 4.5, aclara en pasos de 6 %). `--sb-accent-raw`
  conserva el original para logos/rellenos grandes.
- Serif editorial: Instrument Serif (`--font-sandbox-serif`) para titulares y
  cifras grandes.
- Motion: framer-motion con `MotionConfig reducedMotion="user"`. Fase =
  deslizamiento horizontal 380 ms + fade 200 ms; entradas fade + rise. Nada
  rebota.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `SANDBOX_CALENDAR_URL` | Enlace de «Agendar siguiente paso» en Reporte. Sin ella cae a `https://franquiciaslatam.com/franquiciar`. |
| `JWT_SECRET` | Ya existe (admin). Firma la cookie del PIN. |
| `ANTHROPIC_API_KEY` | Ya existe. Hitos 2–5. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Ya existen. Bucket `sandbox-assets` (hito 2). |

## Operación local

```bash
npm run db:generate            # cliente Prisma con los modelos Sandbox*
npm run db:migrate:deploy      # aplica prisma/migrations (usa DIRECT_URL)
npm run sandbox:seed           # crea/actualiza /sandbox/demo-asadero (READY, sin PIN)
npm run dev                    # http://localhost:3000/sandbox/demo-asadero
                               # http://localhost:3000/sandbox/demo-asadero?presenter=1
npm test                       # incluye tests/sandbox-*.test.ts
```

Nota: desde redes sin IPv6 el host directo `db.<proyecto>.supabase.co` no
responde; para migrar usa el *session pooler* (puerto 5432 del host
`*.pooler.supabase.com`, sin `pgbouncer=true`) en `DIRECT_URL`.

## Decisiones

- **PIN en texto plano.** Es fricción de enlace, no autenticación: el consultor
  tiene que leerlo para compartirlo en la llamada. La cookie sí es un HMAC.
- **`?presenter=1` sin guarda.** Tal como pide el brief; las notas no son
  secretas. Si se quiere, `page.tsx` ya resuelve `isAdmin()` y basta con
  exigirlo.
- **Sin next-intl.** Dos JSON + `t()` tipado bastan para un módulo; evita
  tocar el layout raíz y el routing del resto de la plataforma.
- **Migración aditiva e idempotente** siguiendo la convención del repo
  (`DO $$ … EXCEPTION WHEN duplicate_object`, `IF NOT EXISTS`).
- **Sin cambios en componentes compartidos.** Se añadió la relación inversa
  `sandboxSessions` al modelo `Franchise` (schema, sin cambio de tabla) y una
  dependencia explícita a `zod` (ya estaba instalada de forma transitiva).
