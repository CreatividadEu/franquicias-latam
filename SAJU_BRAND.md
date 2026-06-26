# Sajú — Brand Guidelines

> Extracted **2026-06-26** from the live store **[sajucompany.com](https://sajucompany.com/)** and cross-referenced with the Sajú Brandbook spec (Mellow & Banana, 2020).
> Provenance is marked per item: **[LIVE]** = observed on the current website · **[BOOK]** = from the brandbook spec · **[BOTH]** = confirmed by both.

> **⭐ DECISION (canonical for the `/saju` landing):** the **live store** is the source of truth for **type and color** — Jost (headings) + Poppins (body), and the live palette (ink `#231F20` · white · grays · yellow `#F7EB61` · teal `#108474`), with uppercase pill buttons. The brandbook's tropical accent palette and Cooper/Gotham → Lilita/Montserrat substitutions are **not** used. `[BOOK]`-only items below are kept for reference, not as build targets. The motifs that survive (because the live brand still uses them) are **el mono** and the **“táchalo” strike**.

---

## 1. Brand essence

- **Name:** Sajú (a.k.a. *Sajú World Wide*, *Sajú Colombia*). **[LIVE]**
- **Crew / community handle:** **"THE MONKEY CREW"** — *"Somos una marca de gafas comprometida en hacerle la vida más fácil a nuestros clientes y al planeta."* **[LIVE]**
- **Origin:** Marca **colombiana**, fundada en **2017**. Proudly tropical. **[BOTH]**
- **Category:** Eyewear (gafas de sol, formuladas, descanso) + accesorios, con foco en sostenibilidad (materiales reciclados) y servicio óptico. **[LIVE]**
- **Signature signatures (taglines):**
  - **"Grab your style."** — primary tagline. **[BOOK]**
  - **"El mono es el original."** — recurring brand signature. **[BOOK]**
  - **"Queremos hacer las cosas de forma distinta."** **[LIVE]**

### Brand archetype & voice **[BOOK]**
- Archetype: **The Creator**. Personality: *aventurera, divertida, extrovertida, auténtica*.
- The line that governs tone: *"divertida pero no infantil, creativa pero no bohemia, simple pero no aburrida."*
- Language: **Spanish (LATAM)**, `usted/ustedes`-neutral, confident, energetic, never corporate-stiff.
- Core metaphor: **"tachar / lista de pendientes"** (strike items off your bucket list) — use it where natural in microcopy (e.g. a submit button: **"Empecemos a tachar →"**).
- Live-site voice samples: *"¡BIENVENIDOS A NUESTRA PÁGINA WEB INTERNACIONAL!"*, *"¡HAZ TU PEDIDO A CUALQUIER PARTE DEL MUNDO!"* — energetic, exclamatory, aspirational. **[LIVE]**

---

## 2. Color palette

### Confirmed core (live site) **[BOTH unless noted]**
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#231F20` | Near-black. Primary text, dark sections, hero/closing. Also rendered as `#202020` in places. **[BOTH]** |
| `--paper` | `#F4F1EA` | Warm off-white, light sections. **[BOOK]** |
| `--yellow` | `#F7EB61` | **Primary accent / CTA.** Confirmed live as the review-star & highlight color (`--jdgm-star-color: #f7eb61`). A softer gold `#F1D469` appears as a text accent. **[BOTH]** |
| `--teal` | `#108474` | **Signature deep teal-green** — the most-used brand color on the live store ("The Monkey Crew" green). *Not in the original brandbook palette; adopted by the live brand — treat as a current primary.* **[LIVE]** |
| white | `#FFFFFF` | Reversed logo & text on dark. **[LIVE]** |

### Tropical accent palette (brandbook) **[BOOK]**
One or two background colors per section max; alternate accents to differentiate sections.
| Token | Hex |
|---|---|
| `--gray` | `#B3B3B3` |
| `--cyan` | `#7BCFE0` |
| `--mint` | `#81CBB4` |
| `--blue` | `#3F78BC` |
| `--purple` | `#5741B5` |
| `--coral` | `#F06047` |
| `--peach` | `#F39B59` |

> **Reconciliation note:** the live store leans on a tighter set — **ink + white + yellow + deep teal `#108474`** — while the brandbook defines the fuller tropical spectrum. For a Sajú landing, use **ink/yellow/teal as the spine** and the brandbook accents (cyan, mint, purple, coral, peach) for section color-blocking, exactly as the deck alternates them.

### Contrast rules
- Yellow (`#F7EB61`) and paper (`#F4F1EA`) are **too light for text on light backgrounds** — place yellow text on `--ink`, or use ink text on yellow. Watch WCAG AA.

---

## 3. Typography

| Role | Brandbook spec **[BOOK]** | Brandbook substitute **[BOOK]** | Live store (Shopify theme) **[LIVE]** |
|---|---|---|---|
| **Display / headlines** | *Cooper Lt BT* (bold) — rounded, heavy | **Lilita One** (Google Fonts) | **Jost** |
| **Body / UI** | *Gotham* | **Montserrat** (400–900) | **Poppins** |

- If licensed **Cooper** / **Gotham** files are provided → self-host and swap.
- Tracking/leading (brandbook): display is tight — `line-height: ~.9`, `letter-spacing: -.015em`. Eyebrows/labels are **UPPERCASE** with wide tracking `.22–.32em`.
- The live e-commerce site uses **Jost + Poppins** (generic Shopify theme), which is *not* the brandbook spec — for brand-faithful work follow the brandbook (Lilita One / Montserrat), not the live theme fonts.

---

## 4. Sacred assets & motifs **[BOTH]**

- **El mono** — the black monkey face wearing sunglasses with a smile. *"El mono es el original."* The iconic logo mark.
  - Live asset (square mono): `https://sajucompany.com/cdn/shop/files/MonoCuadrado_9dffa968-23ad-4289-9f74-59c2bfa84e4e.png` (320×320 PNG, black on transparent). **[LIVE]**
  - Wordmark lockup: `https://sajucompany.com/cdn/shop/files/Saju.png` (1200×627, **white/reversed** — for dark backgrounds). **[LIVE]**
  - Rules **[BOOK]**: never rotate, recolor, distort, or crop the mono. Respect clear space = **4× the logo's unit** on all sides. Use as the logo lockup and as an oversized **low-opacity watermark**.
- **"Táchalo" strikethrough** **[BOOK]** — a coral/yellow hand-struck line through a highlighted word. The core brand device (the brand's "soul"). Reuse on hero/closing headlines (an `<em>` with an angled `::after` bar). Note: the brand's **YouTube handle is `@tachalo`** — the device is central enough to be the channel name. **[LIVE confirms]**
- **Flat offset shadows** — e.g. `box-shadow: 22px 22px 0 var(--coral)`. **[BOOK]**
- **Dashed-rule dividers**, **2px solid ink borders**, **generous rounded corners** (`border-radius: 22–24px`). **[BOOK]**

---

## 5. Product & proof (for marketing copy) **[LIVE]**

- **Materials / líneas:** Plástico Reciclado · Bio/Eco-Acetato · Aluminio Reciclado. **[BOTH]**
- **Product types:** Gafas de Sol · Gafas para Fórmula (prescription) · Gafas de Descanso (blue-light) · Accesorios.
- **Warranties:** 705 días (plástico reciclado) · 365 días (acetato). **[LIVE]**
- **Values block:** COMPROMISO · GARANTÍAS · MARCA COLOMBIANA · DIFERENCIAL. **[LIVE]**
- **Collaborations / collections:** SAJÚ X JAMES (James Rodríguez — "Las del Capi / del Mago / Calidosas") · Simón Vargas x Sajú ("Mala Suerte 2.0") · MACHE (Marcela García) · DAYDREAMER (Goal Digger / Hustle Honey / Boss Babe / Dream Chaser). Brandbook/deck also cite Adidas, MINI, Corona, Camila Cisneros. **[BOTH]**

---

## 6. Social & contact **[LIVE]**

- Instagram: **@saju**
- YouTube: **@tachalo**
- TikTok: **@losdesaju**
- LinkedIn: **sajucolombia**
- WhatsApp (international): listed on site.

---

## 7. Quick token reference (for code)

```css
:root {
  /* Spine (live-confirmed) */
  --ink:    #231F20;   /* text, dark sections   */
  --paper:  #F4F1EA;   /* warm off-white        */
  --yellow: #F7EB61;   /* primary accent / CTA  */
  --teal:   #108474;   /* signature deep teal   */

  /* Tropical accents (brandbook, for section color-blocking) */
  --gray:   #B3B3B3;
  --cyan:   #7BCFE0;
  --mint:   #81CBB4;
  --blue:   #3F78BC;
  --purple: #5741B5;
  --coral:  #F06047;
  --peach:  #F39B59;
}
```

- **Display:** Lilita One (sub for Cooper Lt BT) — `line-height: .9; letter-spacing: -.015em`.
- **Body:** Montserrat (sub for Gotham), 400–900.
- **Eyebrows/labels:** UPPERCASE, `letter-spacing: .22–.32em`.
- **Shadows:** flat offset, e.g. `22px 22px 0 var(--coral)`.
- **Radius:** `22–24px`. **Borders:** 2px solid `--ink`.
