# Home Logo Carousel Audit

## 1. Ubicacion exacta del componente y dependencias

### Fuente real de verdad

- Carrusel real: [src/app/page.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/page.tsx#L33) y [src/app/page.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/page.tsx#L450)
- Animacion y estados visuales: [src/app/globals.css](/Users/danielseneor/Projects/franquicias-latam/src/app/globals.css#L509)
- Wrapper inmediato del hero: [src/components/LatamDepthBackground.tsx](/Users/danielseneor/Projects/franquicias-latam/src/components/LatamDepthBackground.tsx#L11)
- Carga de CSS global y fuente: [src/app/layout.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/layout.tsx#L1)

### Por que este es el carrusel correcto

- El strip objetivo usa el array `clientLogos` con assets en `public/logos_clientes/*.svg`.
- El bloque esta rotulado en el codigo como `Logo Carousel (Client logos)`.
- Hay otros bloques parecidos, pero no son este:
  - [src/components/home/HomeHeroFranchise.tsx](/Users/danielseneor/Projects/franquicias-latam/src/components/home/HomeHeroFranchise.tsx#L653): `MethodologyStrip`, logos de prensa, estatico.
  - [src/components/home/WorkCarousel.tsx](/Users/danielseneor/Projects/franquicias-latam/src/components/home/WorkCarousel.tsx#L379): carrusel de casos, con drag/mask, no son logos de clientes.

### Dependencias trazadas

- Componente padre inmediato: `HomePage` en [src/app/page.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/page.tsx#L74)
- Ancestro visual inmediato: `LatamDepthBackground` en [src/components/LatamDepthBackground.tsx](/Users/danielseneor/Projects/franquicias-latam/src/components/LatamDepthBackground.tsx#L11)
- Hijo real: `next/image` usado inline en [src/app/page.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/page.tsx#L458)
- Data source: `clientLogos` en [src/app/page.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/page.tsx#L33)
- Estilos globales: `.logo-carousel-container`, `.logo-carousel`, `.logo-item`, `@keyframes scroll-logos` en [src/app/globals.css](/Users/danielseneor/Projects/franquicias-latam/src/app/globals.css#L509)
- Fuente global heredada: Satoshi local font en [src/app/layout.tsx](/Users/danielseneor/Projects/franquicias-latam/src/app/layout.tsx#L6)
- Assets: `public/logos_clientes/*.svg`

### Lo que NO usa

- No usa hooks propios.
- No usa utilidades compartidas.
- No usa Framer Motion.
- No usa `requestAnimationFrame`.
- No usa CSS mask ni pseudo-elementos para fades laterales.
- No usa componente de slider externo.
- No usa drag, wheel, touch handling, pause programatico, ni observers.

## 2. Auditoria detallada

### DOM exacto

```tsx
<LatamDepthBackground className="min-h-[70vh] pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
  <section id="diagnostico" className="max-w-7xl mx-auto scroll-mt-28 px-4 sm:px-6 sm:scroll-mt-36">
    <div className="text-center max-w-4xl mx-auto">
      <p className="... mb-6 sm:mb-8">Mas de 750 franquicias lideres desarrolladas.</p>
      <div className="logo-carousel-container overflow-hidden mb-8 sm:mb-12">
        <div className="logo-carousel flex items-center gap-10 sm:gap-16">
          {[...clientLogos, ...clientLogos].map(...)}
        </div>
      </div>
    </div>
  </section>
</LatamDepthBackground>
```

DOM renderizado real por Next 16:

- `div.logo-carousel-container`
- `div.logo-carousel`
- `div.logo-item` x14
- `img` x14

`next/image` para estos SVG no genera URL optimizada `/_next/image`; en runtime termina renderizando `<img src="/logos_clientes/...svg">` con `loading="lazy"` y `decoding="async"`.

### Jerarquia y medidas reales

Medidas tomadas en runtime con Chrome headless:

- Desktop:
  - viewport: `1440px`
  - ancho visible del bloque del hero: `896px`
  - ancho visible del carrusel: `896px`
  - `scrollWidth` del track: `2792px`
  - gap: `64px`
  - logo renderizado: `140px x 56px`
- Mobile angosto:
  - viewport medido por Chrome headless: `500px`
  - ancho visible del carrusel: `468px`
  - `scrollWidth` del track: `2060px`
  - gap: `40px`
  - logo renderizado: `110px x 44px`

Medidas declaradas en clases:

- Wrapper hero: `min-h-[70vh] pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32`
- Section: `max-w-7xl mx-auto px-4 sm:px-6`
- Inner center column: `max-w-4xl mx-auto`
- Texto previo al strip: `mb-6 sm:mb-8`
- Carrusel wrapper: `mb-8 sm:mb-12`
- Track: `flex items-center gap-10 sm:gap-16`
- Item: `flex-shrink-0`
- Logo: `h-11 sm:h-14 w-auto object-contain`

Conversiones Tailwind relevantes:

- `max-w-7xl` = `1280px`
- `max-w-4xl` = `896px`
- `px-4` = `16px`
- `sm:px-6` = `24px`
- `mb-8` = `32px`
- `sm:mb-12` = `48px`
- `gap-10` = `40px`
- `sm:gap-16` = `64px`
- `h-11` = `44px`
- `sm:h-14` = `56px`

### Sizing real de los logos

Aunque `Image` declara `width={120}` y `height={40}`, la clase `h-11 sm:h-14 w-auto` domina el render final:

- Todos los SVG tienen `viewBox="0 0 300 120"`, ratio `2.5:1`.
- En mobile: `44px` de alto => `110px` de ancho real.
- En `sm+`: `56px` de alto => `140px` de ancho real.

No hay cards individuales:

- sin background
- sin borde
- sin radius
- sin sombra
- sin blur

### Estilos visuales exactos

Definidos en [src/app/globals.css](/Users/danielseneor/Projects/franquicias-latam/src/app/globals.css#L509):

- `.logo-carousel-container`
  - `position: relative`
  - `width: 100%`
- `.logo-carousel`
  - `display: flex`
  - `animation: scroll-logos 21s linear infinite`
  - `will-change: transform`
- `.logo-carousel:hover`
  - `animation-play-state: paused`
- `.logo-item`
  - `opacity: 0.9`
  - `filter: grayscale(100%)`
  - `transition: all 0.3s ease`
- `.logo-item:hover`
  - `opacity: 1`
  - `filter: grayscale(0%)`

Observacion importante:

- Los SVG ya vienen en gris oscuro `#3d3d3d`, asi que el `grayscale(100%)` casi no cambia su color. El hover se percibe sobre todo por el paso de `0.9` a `1`.

### Animacion y comportamiento

Keyframes:

```css
@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

Comportamiento observado y derivado:

- Direccion: izquierda
- Duracion: `21s`
- Timing: `linear`
- Iteraciones: infinitas
- Pausa en hover: si, sobre `.logo-carousel`
- Drag: no
- Touch drag: no
- Wheel interaction: no
- Mask lateral: no
- Fade lateral: no
- `requestAnimationFrame`: no
- Motion library: no

### Tecnica de loop infinito real

La tecnica usada es:

1. Duplicar el array inline con `[...clientLogos, ...clientLogos]`
2. Renderizar una sola fila flex con 14 items
3. Mover todo el track con `translateX(-50%)`
4. Resetear la animacion al inicio al terminar la iteracion

### Bug estructural del loop

El loop no es matematicamente perfecto por dos razones:

1. El `translateX(-50%)` se calcula sobre el ancho del elemento animado, y ese ancho visible es el del contenedor, no el ancho total del contenido.
2. Aun si se interpretara como mitad del contenido, un solo flex track duplicado con `gap` deja una discrepancia de medio gap en el reset.

Prueba runtime desktop:

- `carouselWidth`: `896px`
- `carouselScrollWidth`: `2792px`
- La animacion recorre `448px` (`50%` de `896px`), no `1396px` (`50%` de `2792px`)

Consecuencia:

- visualmente parece un marquee lento
- no llega al inicio exacto del segundo bloque duplicado
- al cerrar cada ciclo hay un snap/reset perceptible
- el bug ocurre cada `21s`

Este es el bug visual mas importante del componente.

### Responsive behavior

`<640px`:

- gap `40px`
- logo height `44px`
- logo width real `110px`
- margin-bottom del bloque `32px`

`>=640px`:

- gap `64px`
- logo height `56px`
- logo width real `140px`
- margin-bottom del bloque `48px`

`>=768px` y `>=1024px`:

- el carrusel no cambia por clases propias
- solo hereda un viewport mas amplio dentro del `max-w-4xl`

### Accesibilidad

- Cada logo tiene `alt` textual basico: `Andrés`, `BID`, `Mercado Libre`, `Nutresa`, `Sodexo`, `Subway`, `Totto`
- No hay `aria-label` para el strip
- No hay `role="list"` / `role="listitem"`
- No hay mecanismo de pausa visible para teclado
- La pausa solo existe en hover, asi que touch y teclado no la obtienen

### Performance

Puntos positivos:

- animacion por `transform`
- `will-change: transform`
- SVG vectoriales
- `loading="lazy"` en runtime

Costos/riesgos:

- 14 nodos de logo por duplicacion
- `filter: grayscale()` en hover/base, que puede forzar trabajo extra de pintura
- los SVG son pesados para ser logos:
  - `logo_andres.svg`: `247594 bytes`
  - `logo_bid.svg`: `269003 bytes`
  - `logo_mercado_libre.svg`: `259826 bytes`
  - `logo_nutresa.svg`: `264442 bytes`
  - `logo_sodexo.svg`: `249322 bytes`
  - `logo_subway.svg`: `246418 bytes`
  - `logo_totto.svg`: `244938 bytes`

## 3. Especificacion de replica exacta para Lovable

### Estructura

- Crear el bloque dentro de una columna centrada `max-w-4xl mx-auto text-center`
- Dejar antes una linea de texto bold con `mb-6 sm:mb-8`
- Debajo, un wrapper `overflow-hidden` sin fondo ni bordes
- Dentro, un solo track flex con los 7 logos duplicados en el mismo array

### Clases equivalentes

- Wrapper:
  - `logo-carousel-container overflow-hidden mb-8 sm:mb-12`
- Track:
  - `logo-carousel flex items-center gap-10 sm:gap-16`
- Item:
  - `logo-item flex-shrink-0`
- Logo:
  - `h-11 sm:h-14 w-auto object-contain`

### Animacion exacta

```css
.logo-carousel {
  display: flex;
  animation: scroll-logos 21s linear infinite;
  will-change: transform;
}

.logo-carousel:hover {
  animation-play-state: paused;
}

@keyframes scroll-logos {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Tratamiento exacto de logos

- Usar los SVG originales, no PNG alternos
- Mantener `alt` exacto
- Mantener altura fija y ancho automatico
- No encerrar en tarjetas ni pills
- No agregar contenedores con fondo
- No usar color brand; mantener gris oscuro original

### Responsive rules

- Mobile:
  - `h-11`
  - `gap-10`
- `sm+`:
  - `h-14`
  - `gap-16`
- Sin reglas extra en `md` o `lg`

### Detalles criticos que no se deben perder

- El carrusel es muy minimalista y vive en espacio en blanco.
- No tiene mascaras laterales.
- No tiene sombras ni blur.
- El hover solo sube opacidad y quita grayscale.
- La duplicacion ocurre inline, no en dos tracks separados.
- Si quieres replica exacta, debes conservar incluso el reset del loop actual.

### Si quieres fidelidad visual pero loop perfecto

La aproximacion mas fiel en Lovable seria:

- dos grupos hermanos identicos dentro de un track `w-max`
- o animar segun el ancho real del primer grupo

Pero eso ya no seria replica exacta del codigo fuente actual; seria una correccion.

## 4. Lista de assets necesarios

- `public/logos_clientes/logo_andres.svg`
- `public/logos_clientes/logo_bid.svg`
- `public/logos_clientes/logo_mercado_libre.svg`
- `public/logos_clientes/logo_nutresa.svg`
- `public/logos_clientes/logo_sodexo.svg`
- `public/logos_clientes/logo_subway.svg`
- `public/logos_clientes/logo_totto.svg`

Todos comparten:

- formato: `svg`
- `viewBox`: `0 0 300 120`
- ratio: `2.5:1`
- color interno principal: gris oscuro

## 5. Riesgos al replicarlo en Lovable

- Si Lovable usa otro font base, el contexto visual general va a cambiar aunque el carrusel sea igual.
- Si usas `img` normal en vez de `next/image`, el DOM cambia poco, pero el look no cambia si respetas alturas y assets.
- Si intentas “mejorar” el loop con otro marquee, dejaras de replicar fielmente el original.
- Si metes masks, fondos o hover colorido, te alejas del strip real.
- El mayor bug portable que tambien se replicaria es el snap al cerrar el ciclo.
- El overflow horizontal visto en mobile del HOME no viene del carrusel: viene del panel `.mobile-menu` off-canvas en [src/app/globals.css](/Users/danielseneor/Projects/franquicias-latam/src/app/globals.css#L489), que deja `scrollWidth` extra en viewport angosto.
