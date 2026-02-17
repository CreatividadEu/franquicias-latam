# PROJECT AUDIT

## A. Current Objective (1-2 lines)
- Finalizar el switch de OTP a Twilio SMS sin romper contratos del frontend (`/api/sms/send` y `/api/sms/verify`).
- Mantener verificacion basada en DB (`sms_verifications`) y bloqueo de creacion de lead hasta `verified=true`.

## B. Current Flow Map (end-to-end)
```text
/quiz
  -> GET /api/sectors + GET /api/countries
  -> POST /api/sms/send
  -> POST /api/sms/verify
  -> POST /api/leads
  -> redirect /results?... -> server render + findMatches()
```

1. `/quiz` y carga de catalogos
- Entry point: `src/app/quiz/page.tsx:9` renderiza `ChatbotContainer`.
- `SectorStep` llama `fetch("/api/sectors")`: `src/components/chatbot/steps/SectorStep.tsx:42`.
- `CountryStep` llama `fetch("/api/countries")`: `src/components/chatbot/steps/CountryStep.tsx:37`.
- API sectores: `src/app/api/sectors/route.ts:8` (`GET`) devuelve `NextResponse.json(sectors)` en `src/app/api/sectors/route.ts:20`.
- API paises: `src/app/api/countries/route.ts:8` (`GET`) devuelve `NextResponse.json(countries)` en `src/app/api/countries/route.ts:20`.

2. Contacto -> `POST /api/sms/send`
- Hook que dispara envio OTP: `submitContact` en `src/hooks/useChatbot.ts:308`.
- Request: `fetch("/api/sms/send", { method: "POST", body: { phone } })` en `src/hooks/useChatbot.ts:313`.
- Handler real: `POST` en `src/app/api/sms/send/route.ts:20`.
- Respuesta exitosa: `{ ok: true }` en `src/app/api/sms/send/route.ts:142`.
- Errores: `400/429/500` con `{ error: string }` (ejemplos en `src/app/api/sms/send/route.ts:54`, `src/app/api/sms/send/route.ts:80`, `src/app/api/sms/send/route.ts:137`).

3. Verificacion OTP -> `POST /api/sms/verify`
- Hook que verifica: `verifyCode` en `src/hooks/useChatbot.ts:336`.
- Request: `fetch("/api/sms/verify", { phone, code })` en `src/hooks/useChatbot.ts:341`.
- Handler real: `POST` en `src/app/api/sms/verify/route.ts:4`.
- Exito: `{ verified: true }` en `src/app/api/sms/verify/route.ts:62`.
- Error invalido/expirado: `400 { error: "Codigo invalido o expirado" }` en `src/app/api/sms/verify/route.ts:37`.

4. Lead creation -> `POST /api/leads`
- Se ejecuta solo despues de `verified=true`: `src/hooks/useChatbot.ts:363`.
- Handler real: `POST` en `src/app/api/leads/route.ts:9`.
- Bloqueo por verificacion: valida `smsVerification` (`verified=true` y no expirado) en `src/app/api/leads/route.ts:57`.
- Si no verifica, responde `403`: `src/app/api/leads/route.ts:70`.
- Si verifica, crea/actualiza lead en DB (`prisma.lead.create` o `prisma.lead.update`) en `src/app/api/leads/route.ts:145` y `src/app/api/leads/route.ts:113`.
- Respuesta: `{ leadId, matches, updated }` en `src/app/api/leads/route.ts:204`.

5. `/results` render + matching
- Redirect desde quiz: `router.push("/results?...")` en `src/hooks/useChatbot.ts:419`.
- Pagina resultados parsea query y valida criterios: `src/app/results/page.tsx:48` y `src/app/results/page.tsx:58`.
- Matching server-side: `findMatches(...)` en `src/app/results/page.tsx:87`.
- Algoritmo en `src/lib/matching.ts:86`; devuelve top matches con score y slug.

## C. Twilio OTP Implementation (deep)
1. Archivos exactos que envian OTP
- Route que dispara envio: `src/app/api/sms/send/route.ts:119`.
- Wrapper Twilio SMS usado por la ruta: `sendSmsOtpWithDetails` en `src/lib/twilio.ts:28`.
- Config centralizada de proveedor/env: `src/lib/twilioConfig.ts`.

2. Verify API vs Messages API
- Flujo activo usa Twilio **Messages API** (`client.messages.create`) en `src/lib/twilio.ts:49`.
- Envio SMS usa `messagingServiceSid` obligatorio; no hay fallback `from`.
- No hay uso runtime de Twilio Verify ni WhatsApp en `src/`.

3. Env vars requeridas para SMS runtime
- Requeridos para usar Twilio SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`.
- La condicion se centraliza en `src/lib/twilioConfig.ts` (`isSmsConfigured()` / `getProviderMode()`).
- En `twilio.ts`, el sender se resuelve por Messaging Service SID (`src/lib/twilio.ts:49`).

4. Env vars legacy/no usadas en flujo actual
- `.env.example` mantiene `TWILIO_VERIFY_SERVICE_SID` y `TWILIO_WHATSAPP_FROM` solo como comentarios legacy (`.env.example:10`).
- No se usan en runtime OTP actual.

5. Fallos y fallback
- Si Twilio no esta configurado y `NODE_ENV !== development` -> `500 { error: "Twilio is not configured" }`: `src/app/api/sms/send/route.ts:53`.
- En desarrollo sin Twilio configurado -> path fallback DB, responde `{ ok: true }`: `src/app/api/sms/send/route.ts:115`.
- Si Twilio esta configurado pero falla el envio -> `500 { error: "No se pudo enviar el SMS" }`: `src/app/api/sms/send/route.ts:121`.

## D. Verification Logic
1. Persistencia OTP
- Modelo Prisma: `SmsVerification` en `prisma/schema.prisma:139`.
- Tabla: `sms_verifications` (`prisma/schema.prisma:149`).
- Columnas actuales: `id`, `phone`, `code`, `channel`, `attempts`, `verified`, `expiresAt`, `createdAt` (`prisma/schema.prisma:140` a `prisma/schema.prisma:147`).

2. Escritura de OTP
- `/api/sms/send` limpia expirados globales al inicio: `src/app/api/sms/send/route.ts:29`.
- Borra codigos no verificados previos para el telefono: `src/app/api/sms/send/route.ts:99`.
- Crea nuevo registro con `channel: "sms"` y expiracion +10 minutos: `src/app/api/sms/send/route.ts:106`.

3. Validacion OTP (`/api/sms/verify`)
- Es DB-only: consulta `prisma.smsVerification.findFirst` en `src/app/api/sms/verify/route.ts:25`.
- No llama Twilio Verify ni Twilio Messages.
- Bloqueo brute force: `attempts >= 5` se trata como invalido/expirado (`src/app/api/sms/verify/route.ts:34`).
- Mismatch incrementa `attempts`: `src/app/api/sms/verify/route.ts:43`.
- Match marca `verified=true`: `src/app/api/sms/verify/route.ts:57`.

4. Enforzamiento en `/api/leads`
- `/api/leads` exige `sms_verifications.verified=true` y `expiresAt >= now` para ese telefono: `src/app/api/leads/route.ts:57`.
- Si no existe verificacion valida, retorna `403`: `src/app/api/leads/route.ts:66`.
- Con verificacion valida, crea/actualiza lead en DB (`src/app/api/leads/route.ts:113` y `src/app/api/leads/route.ts:145`).

## E. Deployment Status Check (code + config)
1. Archivos de despliegue encontrados
- `.vercel/project.json` existe y solo contiene metadatos de proyecto (`.vercel/project.json:1`).
- `next.config.ts` no define reglas especiales de runtime/proteccion (`next.config.ts:3`).

2. Uso runtime de `process.env` (relevante a OTP)
- `src/lib/twilioConfig.ts` concentra lectura de env OTP y decide modo proveedor.
- `src/app/api/sms/send/route.ts` consume `getTwilioRuntimeFlags()` y preserva fallback solo en desarrollo.
- `src/app/api/debug/twilio/route.ts` expone booleans/mode solo fuera de produccion.

3. Gating/protecciones encontradas
- No se detecta preview protection de Vercel en codigo de app.
- Hay gate de admin por cookie JWT (`admin_token`) en `src/app/admin/layout.tsx:19`.
- API admin usa validacion de usuario admin (`src/app/api/admin/stats/route.ts:7`, `src/lib/auth.ts:23`).
- `src/proxy.ts:4` solo agrega header `x-pathname`, no protege APIs.

4. Helper script de auditoria (opcional)
- Archivo: `scripts/audit_twilio_env.mjs`.
- Como correr:
  - `node scripts/audit_twilio_env.mjs`
- Imprime solo booleans de env y modo efectivo de envio OTP segun ruta actual.

## F. Known Bugs / Risks (based on code)
1. Misconfigured provider mode
- Riesgo: tener `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` pero sin `TWILIO_MESSAGING_SERVICE_SID` fuerza fallback/500 (`src/app/api/sms/send/route.ts:23` y `src/app/api/sms/send/route.ts:62`).

2. Missing env vars en runtime real
- Si faltan vars en produccion, `/api/sms/send` falla con 500 config error (`src/app/api/sms/send/route.ts:61`).

3. Wrong sender configuration
- En modo SMS, si el Messaging Service SID no esta listo para el pais destino o numero emisor, Twilio send falla y retorna 500 (`src/lib/twilio.ts:56` y `src/app/api/sms/send/route.ts:138`).

4. Hardcoded `123456`
- No hay `123456` en rutas runtime de OTP (API/UI).
- Si hay referencias en docs legacy (`SMS_VERIFICATION_FLOW.md`, `TESTING_SMS_VERIFICATION.md`), lo cual puede inducir pruebas incorrectas.

5. Posible bypass o superficie de bypass
- Bypass directo de `/api/leads` desde cliente no pasa porque exige verificacion DB (`src/app/api/leads/route.ts:57`).
- Endpoint debug Twilio devuelve 404 en produccion; la superficie de diagnostico queda limitada a entornos no productivos.

6. Riesgo operativo
- El registro OTP se guarda antes de confirmar envio Twilio; si Twilio falla, queda OTP no entregado y el usuario puede pegarse con cooldown/rate-limit en reintentos (`src/app/api/sms/send/route.ts:112` y `src/app/api/sms/send/route.ts:92`).

## G. Action Plan (the next 5 commits)
1. Commit 1: Hardening observabilidad
- Mantener logs actuales de `/api/sms/send` (provider mode, env, phoneMasked, resultado Twilio, sid).

2. Commit 2: Smoke test automatizado
- Ejecutar `scripts/smoke_send_sms.mjs` contra entorno local/staging con numero real.

3. Commit 3: Endurecer endpoint debug
- Devolver 404 en produccion para `/api/debug/twilio` (ya aplicado).

4. Commit 4: Cobertura de `/api/sms/send`
- Agregar tests unitarios de:
  - config missing en produccion (500),
  - fallback dev sin Twilio (`{ ok: true }`),
  - Twilio fail (500),
  - Twilio success (200 `{ ok: true }`).

5. Commit 5: Runbook de operacion
- Documentar troubleshooting Twilio por pais/sender y errores frecuentes (21608/30007/etc).

## H. DEV CHECKLIST (Local Twilio SMS)
1. Completa valores reales en `.env.local` (solo local, no versionar secretos).
2. Reinicia servidor dev (`Ctrl+C` y luego `npm run dev`).
3. Abre `GET http://localhost:3000/api/debug/twilio` y confirma:
   - `providerMode = "twilio_sms"`
   - `smsConfigured = true` (derivado de `hasAccountSid && hasAuthToken && hasMessagingServiceSid`).
4. Prueba `POST /api/sms/send` con un telefono real:

```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+34XXXXXXXXX"}'
```

## I. PROD CHECKLIST (SMS-only)
1. Configura en produccion:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_MESSAGING_SERVICE_SID`
2. Reinicia/redeploy del servicio.
3. Verifica que `/api/sms/send` no use fallback en produccion:
   - Sin vars completas -> `500 { "error": "Twilio is not configured" }`
4. Ejecuta un envio real y valida salida en Twilio Console -> Messaging logs.
5. Confirma flujo completo: `/api/sms/send` -> `/api/sms/verify` (DB-only) -> `/api/leads` (requiere `verified=true` vigente).

## J. Prisma Migration Note
- Esta implementacion SMS OTP requiere columnas `channel` y `attempts` en `sms_verifications`.
- Dev (entorno sin drift): `npx prisma migrate dev`
- Prod: `npx prisma migrate deploy`
- Si la base ya existe pero la historia de migraciones no esta alineada (drift), aplicar SQL idempotente de estas migraciones antes de desplegar:
  - `prisma/migrations/20260217173000_add_channel_to_sms_verification/migration.sql`
  - `prisma/migrations/20260217174500_add_attempts_to_sms_verification/migration.sql`

## K. Deploy Checklist
1. Configurar env vars en hosting:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_MESSAGING_SERVICE_SID`
2. Aplicar migraciones de DB y confirmar que `sms_verifications.channel` existe.
3. Validar en no-produccion `GET /api/debug/twilio` con `providerMode = "twilio_sms"`.
4. Ejecutar smoke test:
   - `curl -X POST http://localhost:3000/api/sms/send -H "Content-Type: application/json" -d '{"phone":"+34XXXXXXXXX"}'`
5. Confirmar envio saliente en Twilio Console (Messaging logs).
