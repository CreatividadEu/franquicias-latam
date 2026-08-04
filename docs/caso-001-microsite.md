# Caso 001 · Stoik Intel × Totto — microsite

Microsite teatral scroll-driven en `/totto/caso-001`. Confidencial: circula por
enlace no listado y, con la variable de entorno puesta, detrás de un código.

## Dónde vive cada cosa

| Pieza                | Ruta                                                        |
| -------------------- | ----------------------------------------------------------- |
| Ruta y compuerta     | `src/app/(standalone)/totto/caso-001/`                       |
| Copy y cifras        | `src/lib/totto/caso001.ts` (única fuente)                    |
| Puesta en escena     | `src/components/totto/Caso001.tsx`                           |
| Consola A→D          | `src/components/totto/StoikConsole.tsx`                      |
| Movimiento           | `src/components/totto/hooks.ts`                              |
| Sistema de diseño    | `src/components/totto/caso001.module.css`                    |
| Evidencia            | `public/totto/caso-001/` (ver el README de esa carpeta)      |
| Invariantes          | `tests/caso001-copy.test.ts`                                 |

La ruta cuelga del grupo `(standalone)`, así que no hereda header, footer ni el
widget de WhatsApp de la plataforma.

## Protección

- **`TOTTO_CASO001_PASSCODE`**: si está definida, la ruta pide el código y deja
  una cookie `httpOnly` de 12 h con alcance solo a `/totto/caso-001`. Si no está
  definida, el enlace queda abierto (mismo criterio que `/intel/totto`).
- `noindex, nofollow, nocache, noarchive` en la metadata de la página **y** como
  `X-Robots-Tag` en `next.config.ts`, más `Referrer-Policy: no-referrer` para que
  la URL no viaje en el referer al salir.
- Nunca se enlaza ni se incrusta contenido vivo del infractor: toda la evidencia
  es captura congelada servida desde `/public`.

Para activar la compuerta en producción basta con definir la variable en el
proyecto de Vercel y volver a desplegar.

## Reglas de contenido

`src/lib/totto/caso001.ts` es la única fuente de copy y cifras: los componentes
no redactan ni calculan. Cada dato declara el `slug` de la captura que lo
respalda, y `tests/caso001-copy.test.ts` verifica en CI que:

- la descomposición 137.861 / 42.858 / 33.306 sume exactamente 214.025 y que las
  tarjetas de los tres hermanos cuadren con esa descomposición;
- el nodo central del grafo lleve la cifra del caso;
- toda evidencia tenga `alt` real, pie y fuente;
- el resaltado del JSON caiga sobre la ciudad y la bodega;
- el programa publique precio solo donde hay cifra verificada (la Fase 3 no la
  tiene y no se le inventa una);
- no haya signos de exclamación ni emojis en el copy.

Al agregar copy nuevo, agregarlo ahí y dejar que la prueba lo cubra.

## Rendimiento y accesibilidad

- **Sin librerías de animación**: `IntersectionObserver`, `requestAnimationFrame`,
  transiciones CSS y SVG inline.
- **Fuentes auto-hospedadas**: `next/font` descarga Poppins y JetBrains Mono en
  build y las sirve desde el propio dominio. Verificado con Playwright: la página
  no hace **ninguna** petición a un host externo.
- **`prefers-reduced-motion`**: revela sin desplazamiento, imprime el terminal de
  una y dibuja el grafo ya resuelto.
- **Teclado**: la consola es un `tablist` real — `←` `→`, `Home` y `End` recorren
  los cuatro pasos y el panel sigue al foco.
- El grafo SVG tiene dos plantas (ancha y apilada) porque escalar la ancha dejaba
  las etiquetas ilegibles en móvil.
