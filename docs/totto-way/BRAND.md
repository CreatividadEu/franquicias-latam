# Totto Way · Identidad y tokens

Fuente de verdad del diseño: `docs/totto-way/design/TottoWay-Plataforma.dc.html`
(plataforma) y `TottoWay-Capitulo-01.dc.html` (manual impreso). Este documento
traduce esos prototipos, que usan estilos inline, a las clases `tw-*` de
`src/app/totto-way/totto-way.css`.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `--tw-black` | `#000000` | Superficie principal, texto, sidebar |
| `--tw-yellow` | `#FCCE01` | Acento, XP, CTA, fila propia en Liga, bandas "!" |
| `--tw-red` | `#F6303E` | Eyebrows, números de paso, enlaces, #1 de la Liga |
| `--tw-white` | `#FFFFFF` | Tarjetas |
| `--tw-bg` | `#F4F4F4` | Fondo de la app y paneles |
| `--tw-text` | `#666666` | Texto secundario |
| `--tw-line` | `#E5E5E5` | Bordes |
| `--tw-muted-dark` | `#C6C6C6` | Texto secundario sobre negro |
| `--tw-positive` | `#0A8F3C` | Delta ▲ de la Liga (ya en el prototipo) |

Regla: solo 1–2 colores de acento por pantalla. Texto sobre amarillo siempre negro.

Contrastes verificados (WCAG AA): negro/amarillo ~14:1 · `#666`/blanco 5.7:1 ·
`#C6C6C6`/negro 12.3:1.

## Tipografía

- **Centra No1** para display y UI: títulos, eyebrows, botones, nav, cifras.
  Cargada con `next/font/local` desde `public/fonts/totto/` como `--font-centra`.
- **Solo existe Medium (500).** El archivo `CentraNo1-Regular.ttf` entregado es un
  TRIAL de 64 glifos: sin ñ, acentos, ¿ ¡ ni %. No se envía. El cuerpo 400 usa
  Satoshi (`--font-inter`, layout raíz) con fallback Helvetica Neue hasta que
  Totto entregue la Regular licenciada; entonces basta añadirla al `localFont`
  del layout y cambiar `--tw-font-body`.
- `b`/`strong` pesan 500 (no hay 700), igual que en el manual.
- Títulos `letter-spacing: -0.03em`, `line-height: 1.05`.
- Eyebrow: 11px, mayúsculas, `letter-spacing: .14em`, rojo (amarillo sobre negro).
- Cuerpo de lección: 17px / 1.5.
- Escala: `.tw-title-xl` clamp(32–56px) · `.tw-title-lg` clamp(28–44px) ·
  `.tw-title-md` clamp(22–30px) · `.tw-title-sm` 18px · `.tw-stat` 36px.

## Vocabulario visual (manual → digital)

| Manual | Clase | Notas |
|---|---|---|
| Eyebrow rojo | `.tw-eyebrow` | `--yellow`, `--muted`, `--light` |
| Bloque negro "Traducción simple" | bloque `simple_translation` (fase 1c) | fondo negro, etiqueta amarilla, radio 14px |
| Banda amarilla con "!" | bloque `rule` (fase 1c) | tile negro 32px con "!" amarillo |
| Números rojos | bloque `steps` (fase 1c) | círculo 26px rojo |
| Chip negro +XP | `.tw-chip` / `<XpChip>` | `--yellow`, `--red`, `--outline`, `--soft` |
| Pestañas M01–M08 | tabs/anchors en el capítulo (fase 1c) | — |
| Tarjetas de vidrio | `.tw-glass` / `<GlassCard>` | `rgba(255,255,255,.08)` + blur 6px |
| Progreso | `.tw-progress` / `<TwProgress>` | fill amarillo; `--dark`, `--glass` |

## Radios, sombras, movimiento

- Radios: input 10 · botón 12 · tile 14 · tarjeta 18 · hero 20 · píldora 999.
- Sombras solo en elementos flotantes: chat `0 24px 70px rgba(0,0,0,.28)`,
  toast `0 12px 40px rgba(0,0,0,.25)`. Las tarjetas no llevan sombra.
- Animaciones: `tw-pop` (toast), `tw-fade-up`, `tw-slide-up` (sheet móvil).
  `prefers-reduced-motion` las anula.

## Layout

- Breakpoint único: **820px**. Desktop: sidebar 236px negra + main.
  Móvil: bottom nav 72px con Inicio · Aprender · Liga · Mi viaje · Perfil y "Más".
- Targets táctiles ≥ 44px. Foco visible: outline rojo 3px.
- Iconos: Lucide, `strokeWidth={1.8}`. Sin emojis en producción.

## Assets

- `public/totto-way/logo-black.png`, `logo-white.png`, `photo-*.png` (login, Inspira).
- `public/totto-way/manual/` solo con los screenshots que usan las lecciones
  publicadas. El resto del manual vive en `docs/totto-way/design/assets/` y se
  sube al storage desde el Estudio (fase 3).
