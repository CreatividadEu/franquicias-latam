# Sandbox de Propuesta — `/propuesta/[slug]`

Experiencia de ventas interactiva por cliente (reemplaza la presentación
de Meet). Un slug = un prospecto, con su nombre, logo, números de ejemplo
y cupo con fecha límite. Módulo autocontenido:

- Ruta: `src/app/propuesta/[slug]/` (page + opengraph-image + layout con CSS scoped)
- UI: `src/components/propuesta/*` (client components)
- Datos: `src/lib/propuestas/*` (tipos, registro, server action)
- SQL opcional: `supabase/sql/20260703120000_propuestas.sql`

## Cómo agregar un cliente nuevo

1. Añada un objeto `Proposal` en [registry.ts](./registry.ts) (copie el de
   `la-clasica` y ajuste).
2. Setee `cliente`, `finanzas`, `escenarios` (1..3), `mesObjetivo`,
   `descuentoPct` y `createdAt` (ISO del día que crea la propuesta).
   Opcionales: `logoUrl`, `industria`, `acento` (hex), `deadline`
   (default: `createdAt` + 7 días), `whatsapp` (E.164), `calUrl`,
   `unlisted`, `accessKey`, `videosMercadeo`, `modulosManuales`.
3. Visite `/propuesta/{slug}`. Listo.

Los números son **placeholders ilustrativos configurables por cliente**;
los claims textuales (marcas protegidas, convocatorias, BID, etc.) se
mantienen tal cual.

## Privacidad

- Todas las propuestas llevan `robots: noindex`.
- `accessKey: "abc123"` → la URL exige `?k=abc123` (si no, 404).
- Slug inexistente → 404.

## Countdown / oferta

El deadline es **fijo por cliente** (`deadline` o `createdAt + 7d`): el
restante se calcula contra ese timestamp, no se reinicia al refrescar.
Al expirar, el descuento se oculta con gracia y el CTA cambia a
"Solicitar disponibilidad".

## CTA "Confirmar cupo"

Server action [actions.ts](./actions.ts) → insert en la tabla
`proposal_intents` de Supabase (`{ proposal_slug, action, contacto?,
created_at }`). Requiere `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` y
haber corrido el SQL de `supabase/sql/20260703120000_propuestas.sql`.
Sin Supabase configurado, la UI degrada a deep-link de WhatsApp.

## Backend alternativo (opcional)

Además del registro tipado, `getProposal()` busca en la tabla
`proposals` de Supabase: una fila `{ slug, data }` donde `data` es el
mismo JSON del tipo `Proposal`. Útil para crear propuestas sin deploy.
El registro tipado tiene prioridad si el slug existe en ambos.
