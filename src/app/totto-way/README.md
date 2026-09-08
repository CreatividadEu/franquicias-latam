# `/totto-way` — Totto Way, formación en tienda de TOTTO

Módulo LMS por marca (patrón `saju`): carpeta propia, CSS namespaced en
`.tw-root`, componentes en `_components/` y dominio en `src/lib/totto-way/`.
Plan completo en `docs/totto-way/PLAN.md`; tokens en `docs/totto-way/BRAND.md`.

## Estado por hito

| Hito | Contenido | Estado |
|---|---|---|
| 1a | Plan, prototipo en `docs/totto-way/design/`, BRAND.md | ✅ |
| 1b | Modelo `tw_*` + migraciones + seed, auth `tw_token`, shell, login, onboarding, Inicio, grid de capítulos | ✅ |
| 1c | Capítulo, lección (lectura + video + quiz), XP + toast, Perfil | ✅ |
| 2 | Liga, Mi viaje, Panel líder, notificaciones | ✅ |
| 3 | Inspira, Beneficios, Asistente Claude, Estudio | ✅ |
| 4 | Geovictoria/NPS, certificados PDF, manual imprimible, i18n, Playwright | ✅ |

## Rutas

```
/totto-way/login            split screen (foto + lema), correo o código + clave
/totto-way/onboarding       3 pantallas en el primer login
/totto-way                  Inicio (hero + tarjetas de vidrio + Hoy en tienda + equipo)
/totto-way/aprender         grid de 7 capítulos (desbloqueo secuencial)
/totto-way/aprender/[ch]         capítulo: misiones M0x, lecciones, manual y checkpoint
/totto-way/aprender/[ch]/[l]     lección: player, bloques del manual, quiz y completar
/totto-way/liga                  Liga: por tienda / individual, premio y temporadas
/totto-way/mi-viaje              línea de tiempo, insignia y ruta de carrera
/totto-way/inspira               hero del podcast, grid y detalle (+20 XP al día)
/totto-way/beneficios            tarjetas por categoría, filtradas por rol y país
/totto-way/perfil                insignias, certificaciones y preferencias
/totto-way/lider            solo líderes/jefes/franquiciado/formador/admin
/totto-way/estudio               árbol de capítulos, publicar y analítica (formador/admin)
/totto-way/estudio/[ch]          misiones y lecciones
/totto-way/estudio/[ch]/[l]      editor de bloques y quiz ("nueva" crea una)
/totto-way/estudio/analitica     finalización, quiz y preguntas al Asistente
/totto-way/manual/[ch]           versión imprimible (carta apaisada, fuera del shell)
/api/totto-way/auth         POST login → cookie tw_token
/api/totto-way/auth/sso     GET: admin_token → tw_token (entrada desde el panel admin)
/api/totto-way/logout       POST
/api/totto-way/leader/export        GET  CSV del equipo (solo líderes)
/api/totto-way/cron/league          job nocturno de la Liga
/api/totto-way/cron/reminders       recordatorio diario y alertas de inactividad
/api/totto-way/assistant            POST, respuesta en streaming (SSE) del Asistente
/api/totto-way/webhooks/geovictoria POST, marcación de jornada → +10 XP/día
/api/totto-way/webhooks/nps         POST, NPS mensual → +300 XP a la tienda
/api/totto-way/certificate/[ch]     GET, certificado en PDF con folio
/api/totto-way/media/{sign,register,[id]}  subida y lectura firmadas del bucket privado
```

## Auth y scoping

- Cookie `tw_token` (JWT `{ userId, role }`, 7 días) firmada con `JWT_SECRET`.
  `getTottoWayUser()` en `src/lib/auth.ts`; `requireTwSession()` en
  `src/lib/totto-way/auth.ts` arma el `TwScope` por rol (`scope.ts`).
- `src/proxy.ts` guarda `/totto-way/*` por presencia de `tw_token` o `admin_token`.
- Roles: `TW_ASESOR`, `TW_LIDER_TIENDA`, `TW_AUX_LOGISTICO`, `TW_JEFE_COMERCIAL`,
  `TW_FORMADOR`, más `FRANCHISE_OWNER` (franquiciado) y `ADMIN` (formador global).
- Todas las tablas `tw_*` cuelgan de `franchises.id`; `users.franchiseId` es la raíz
  del scoping.

## Progreso y XP

- **Snapshot, no árbol vivo.** El alumno lee siempre `TwChapter.publishedSnapshot`; el Estudio (fase 3) edita el árbol y publica una versión nueva.
- **El servidor decide.** `completeLesson` revalida la sesión, relee el snapshot y comprueba el ≥ 90 % de video antes de pagar. Una lección de video **sin archivo grabado** no se bloquea: solo muestra el screenshot del manual como póster, o el capítulo sería imposible de terminar.
- **El quiz se corrige en servidor** (`gradeQuiz`); el cliente nunca envía el resultado. El bonus de +40 XP se paga una sola vez, al primer intento perfecto.
- **Idempotencia por base de datos.** `awardXp` es el único camino que paga puntos y va en una transacción: evento + acumulado + racha + insignias con su hito + Liga. Dos índices únicos parciales (migración `20260907140000`) impiden el doble pago por doble clic o reintento; ante la violación devuelve `awarded: false`.

## Liga y jobs

- La clasificación de `tw_league_scores` es **materializada**: el job nocturno
  (`/api/totto-way/cron/league`, `vercel.json`) la reconstruye entera desde
  `tw_xp_events` — toda tienda y toda persona de tienda entra, con 0 si no
  puntuó, y se borran las filas de entidades que ya no existen. Los lunes
  congela antes la foto semanal, que es lo que sostiene el delta ▲▼.
- Los jobs se autentican con `Authorization: Bearer $CRON_SECRET`. Sin el
  secreto configurado solo los puede disparar un ADMIN con sesión.
- Comprobación manual: `npx tsx scripts/tw-league-check.ts`.
- **Ojo con la demo:** las cifras de Liga que siembra el seed vienen del
  prototipo y no se derivan de eventos reales, así que la primera pasada del
  job las sustituye por las verdaderas (mucho más bajas). Antes de enseñarlo a
  TOTTO, o se apaga el cron o se siembran equipos reales.
- Solo el **franquiciado** ve la tabla recortada a sus tiendas, con su posición
  global aparte. Asesores, líderes y jefes ven el ranking completo: la Liga es
  una competencia entre tiendas.

## Datos

```
npx prisma migrate deploy        # 20260907100000_totto_way_roles + 20260907100100_totto_way_init
npm run seed:totto-way           # franquicia TOTTO, 6 tiendas, 8 usuarios demo, Capítulo 01 publicado
```

Usuarios demo (clave `TOTTO_WAY_SEED_PASSWORD`, por defecto `totto2026`):
`camila.rojas@totto-way.demo` (asesora, código `TA-0412`), `andres.molina@…`
(líder), `laura.perez@…` (franquiciada, sin onboarding), `formador@…` (formador).

## Fuentes

Solo se carga Centra No1 Medium; la Regular entregada es un TRIAL sin glifos
españoles (ver BRAND.md). El cuerpo usa Satoshi del layout raíz.

## Asistente

- **Recuperación por full-text de Postgres en español**, no embeddings (decisión
  D3 del PLAN): columna generada `tsv` con el título pesando más que el cuerpo
  e índice GIN (migración `20260907190000`). `websearch_to_tsquery` acepta lo
  que un asesor escribe de verdad; si no hay nada, cae a una búsqueda por
  prefijo del término más largo. Cuando haya proveedor de embeddings, el módulo
  pasa a híbrido y el resto del asistente no cambia.
- **Las citas las genera el modelo, no el prompt**: los fragmentos viajan como
  bloques `document` con `citations` activadas, así que llegan estructuradas y
  se pintan como enlaces a la lección exacta.
- **Cuatro herramientas**: `search_kb` y `log_checkpoint_request` se ejecutan en
  el servidor; `open_lesson` y `show_benefit` son acciones de interfaz que el
  servidor valida antes de emitir. El modelo nunca decide solo a dónde navega
  alguien. Bucle acotado a 3 vueltas.
- Modelo por defecto `claude-sonnet-5` (`TOTTO_WAY_AI_MODEL`), pensamiento
  adaptativo con esfuerzo bajo, límite de 30 preguntas por hora y usuario.
- Las preguntas se agregan **anónimas** en `tw_assistant_question_stats` para la
  analítica del Estudio: nunca se guarda quién preguntó.
- Sin `ANTHROPIC_API_KEY` válida responde 503 con un mensaje de marca, que es lo
  que pasa en local (la clave del `.env` de Vercel es un marcador).
- Comprobación manual de la recuperación: `npx tsx scripts/tw-kb-check.ts`.

## Estudio de contenido

- Edita el **árbol vivo**; el alumno sigue viendo el último snapshot publicado.
  Publicar valida, congela el snapshot, sube la versión y reindexa al Asistente.
- El editor solo ofrece los **ocho bloques del manual**: no hay HTML libre, que
  es lo que mantiene iguales el impreso y la plataforma.
- Una lección de video se puede publicar con solo el póster: el paso a paso se
  graba después. Misma regla que permite completarla sin archivo.
- Pendiente para la fase 4: subida de video a storage, subtítulos y la vista de
  impresión del manual. Hoy el póster y el video se indican por URL.

## Integraciones

- **Geovictoria** → `POST /api/totto-way/webhooks/geovictoria`. Un lote de
  marcaciones; solo la ENTRADA puntual paga (+10 XP), una vez al día. El tope
  lo impone el índice único, así que reenviar el mismo lote no paga dos veces.
- **NPS** → `POST /api/totto-way/webhooks/nps`. Un NPS de 9 o más suma +300 XP
  **a la tienda**, no a una persona: por eso `tw_xp_events.userId` es opcional
  (migración `20260908090000`) y hay un índice único por (tienda, NPS, mes).
- Ambos se autentican con su propio secreto en `x-totto-way-secret` o
  `Authorization: Bearer`. Sin secreto configurado responden 503, nunca abren.

## Certificados

`GET /api/totto-way/certificate/[capítulo]` genera el PDF en servidor con
pdf-lib y la Centra No1 Medium embebida. El folio es **determinista**
(`sha256(userId:chapterId)`), así que volver a descargarlo no emite otro
documento y no hace falta una tabla de emisiones. El servidor comprueba que
estén completadas todas las lecciones publicadas antes de emitirlo.
Vista previa: `npx tsx scripts/tw-certificate-check.ts salida.pdf`.

## Archivos

Bucket **privado** `totto-way-assets`. El Estudio sube en tres pasos: el
servidor firma, el navegador manda el binario directo a Supabase (Vercel no lo
ve) y el servidor lo registra. La lectura pasa siempre por
`/api/totto-way/media/[id]`, que comprueba sesión y franquicia y redirige a una
URL firmada de 30 minutos. Nada se sirve por URL pública.

## Idiomas

Cuatro: `es` (base, es-CO), `es-MX` (solo los 14 términos que cambian), `en` y
`pt-BR`, ambos completos. La resolución es por **cadena de respaldo**, así que
añadir es-ES mañana es un JSON con lo que difiera. Las fechas y números usan el
locale real de cada idioma vía `intlLocale()`.

## Notificaciones

`src/lib/totto-way/notify.ts` sobre Resend, con una plantilla en los tokens de
marca: checkpoint validado, recordatorio diario, inactividad del equipo y
cambio de posición en la Liga. Sin `RESEND_API_KEY` registra en consola y no
lanza. El recordatorio respeta la preferencia del colaborador y no escribe a
quien ya sumó puntos hoy; cada ejecución tiene un tope de 200 correos.

## Tests

- **Unidad** (`npm test`): `tests/totto-way-*.test.ts` — i18n con cadena de
  respaldo, scope, xp, content, auth-route, progress, award, league y assistant.
- **Navegador** (`npm run test:e2e`): `tests/e2e/*.spec.ts` con Playwright sobre
  el Chrome instalado, sin descargar navegadores. `globalSetup` re-siembra los
  datos demo antes de la suite, porque los specs consumen XP, validan
  checkpoints y republican capítulos; sin eso la segunda pasada fallaría por
  estado sucio y no por una regresión. `TW_E2E_SKIP_SEED=1` la omite.
  El spec del Asistente comprueba la respuesta con citas solo si hay
  `ANTHROPIC_API_KEY` real; si no, verifica que avise sin romperse.
