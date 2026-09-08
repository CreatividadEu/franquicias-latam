# `/totto-way` — Totto Way, formación en tienda de TOTTO

Módulo LMS por marca (patrón `saju`): carpeta propia, CSS namespaced en
`.tw-root`, componentes en `_components/` y dominio en `src/lib/totto-way/`.
Plan completo en `docs/totto-way/PLAN.md`; tokens en `docs/totto-way/BRAND.md`.

## Estado por hito

| Hito | Contenido | Estado |
|---|---|---|
| 1a | Plan, prototipo en `docs/totto-way/design/`, BRAND.md | ✅ |
| 1b | Modelo `tw_*` + migraciones + seed, auth `tw_token`, shell, login, onboarding, Inicio, grid de capítulos | ✅ |
| 1c | Capítulo, lección (reading + video + quiz), XP + toast, Perfil | ⏳ |
| 2 | Liga, Mi viaje, Panel líder, notificaciones | — |
| 3 | Inspira, Beneficios, Asistente Claude, Estudio | — |
| 4 | Geovictoria/NPS, certificados PDF, i18n extra, Playwright | — |

## Rutas

```
/totto-way/login            split screen (foto + lema), correo o código + clave
/totto-way/onboarding       3 pantallas en el primer login
/totto-way                  Inicio (hero + tarjetas de vidrio + Hoy en tienda + equipo)
/totto-way/aprender         grid de 7 capítulos (desbloqueo secuencial)
/totto-way/aprender/[ch]    capítulo (1c)
/totto-way/{liga,mi-viaje,inspira,beneficios,perfil}   placeholders hasta su hito
/totto-way/lider            solo líderes/jefes/franquiciado/formador/admin
/totto-way/estudio          solo formador/admin
/api/totto-way/auth         POST login → cookie tw_token
/api/totto-way/auth/sso     GET: admin_token → tw_token (entrada desde el panel admin)
/api/totto-way/logout       POST
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

## Tests

`tests/totto-way-*.test.ts`: i18n, scope, xp, content, auth-route.
