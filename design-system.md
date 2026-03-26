# Franquicias LATAM — Design System Specification

> **Purpose:** Drop this file into any new Next.js + Tailwind project and replicate the exact visual language of Franquicias LATAM within one hour.
> **Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · shadcn/ui · Framer Motion · Lucide React

---

## 1. COLOR PALETTE

### Brand / Semantic Colors (Custom — `fl-*` prefix)

| Token | Value | Role |
|---|---|---|
| `--color-fl-base` | `#0A0F1E` | Dark page base (unused in light mode) |
| `--color-fl-surface` | `rgba(255,255,255,0.03)` | Subtle frosted surface |
| `--color-fl-border` | `rgba(255,255,255,0.06)` | Hairline border on dark bg |
| `--color-fl-teal` | `#00F0FF` | Neon accent (dark mode) |
| `--color-fl-purple` | `#7B61FF` | Neon secondary (dark mode) |
| `--color-fl-text` | `#F0F0F5` | Body text on dark |
| `--color-fl-muted` | `#8A8F9E` | Muted text on dark |

### Application Colors (Light Mode — used everywhere)

| Name | Hex / Value | Usage |
|---|---|---|
| Page background | `#ffffff` | All page backgrounds |
| Primary text | `#171717` | Headings, strong text |
| Secondary text | `#334155` (slate-700) | Body paragraphs |
| Muted text | `#64748b` (slate-500) | Captions, metadata |
| Placeholder / subtle | `#94a3b8` (slate-400) | Footnotes, empty states |
| **Blue primary** | `#2563eb` | Eyebrow labels, accents, icons |
| Blue dark | `#1d4ed8` | Hover state for blue |
| Blue hover glow | `rgba(37,99,235,0.5)` | Shadow on blue CTAs |
| **Brand blue range** | `#2860E7 → #3B82F6` | Gradient progress bars, stat pills |
| **Hero gradient** | `from-indigo-600 via-blue-600 to-cyan-500` | Primary CTA buttons |
| Cyan | `#38BDF8` | Gradient endpoint (stat values) |
| **Orange accent** | `#f97316` (orange-500) | Secondary CTA, program badges |
| Orange hover | `#ea580c` (orange-600) | Hover on orange CTA |
| **Gold / amber** | `#B8953B` | Premium section eyebrow text |
| **Neon green** | `#10b981` (emerald-500) | Neon glow accent (widget) |
| Emerald badge | `#d1fae5` bg / `#059669` text | "Top Match" badges |
| Card border | `rgba(0,0,0,0.08)` | All card outlines |
| Card border hover | `rgba(0,0,0,0.12)` | Lifted card border |
| Divider / hairline | `rgba(0,0,0,0.05)` – `rgba(0,0,0,0.1)` | Section borders, HR elements |
| FAQ divider | `#e4e4e7` | Zinc-200 |
| Feature chip bg | `#f4f4f5` | Zinc-100 |

### Tier / Status Badge Colors

| Tier | Background | Text | Border |
|---|---|---|---|
| GROWTH "Conversión" | `#fff7ed` (orange-50) | `#ea580c` | `#fed7aa` (orange-200) |
| ALL_IN "Aceleración" | `#eef3ff` | `#2563eb` | `rgba(37,99,235,0.2)` |
| Availability | `#eff6ff` (blue-50) | `#2563eb` | `#bfdbfe` (blue-200) |
| Editorial badge | `rgba(255,255,255,0.9)` | `#334155` | `#e2e8f0` (slate-200) |

### shadcn/ui Semantic Tokens (oklch — light mode)

```css
--background:        oklch(1 0 0)        /* white */
--foreground:        oklch(0.145 0 0)    /* near-black */
--card:              oklch(1 0 0)
--card-foreground:   oklch(0.145 0 0)
--primary:           oklch(0.205 0 0)    /* dark gray */
--primary-foreground:oklch(0.985 0 0)
--secondary:         oklch(0.97 0 0)     /* near-white */
--muted:             oklch(0.97 0 0)
--muted-foreground:  oklch(0.556 0 0)
--accent:            oklch(0.97 0 0)
--destructive:       oklch(0.577 0.245 27.325) /* red */
--border:            oklch(0.922 0 0)    /* light gray */
--input:             oklch(0.922 0 0)
--ring:              oklch(0.708 0 0)
--radius:            0.625rem            /* 10px */
```

### Dark Mode Variants

```css
.dark {
  --background:        oklch(0.145 0 0)
  --foreground:        oklch(0.985 0 0)
  --card:              oklch(0.205 0 0)
  --card-foreground:   oklch(0.985 0 0)
  --border:            oklch(1 0 0 / 10%)
  --input:             oklch(1 0 0 / 15%)
  --glass-bg:          rgba(255, 255, 255, 0.1)
  --glass-border:      rgba(255, 255, 255, 0.2)
  --glass-shadow:      0 8px 32px rgba(0, 0, 0, 0.3)
}
```

---

## 2. TYPOGRAPHY

### Font Families

| Role | Family | Source | CSS Variable |
|---|---|---|---|
| **Primary (everything)** | Satoshi | Local TTF in `/public/fonts/` | `--font-inter` (CSS var), `font-sans` (Tailwind class) |
| **Heading override** | `var(--font-heading, system-ui, sans-serif)` | Falls back to system | Used inline on `h1`, `h2` in landing sections |
| Mono | System mono | Tailwind default | (not actively used) |

**Font loading (layout.tsx):**
```tsx
const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Light.ttf",   weight: "300" },
    { path: "../../public/fonts/Satoshi-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Satoshi-Medium.ttf",  weight: "500" },
    { path: "../../public/fonts/Satoshi-Bold.ttf",    weight: "700" },
    { path: "../../public/fonts/Satoshi-Black.ttf",   weight: "900" },
  ],
  variable: "--font-inter",
  display: "swap",
});

// Applied on body:
<body className={`${satoshi.variable} font-sans antialiased`}>
```

> **To bootstrap a sister project:** Download Satoshi from [Fontshare](https://www.fontshare.com/fonts/satoshi) or equivalent and place the TTF files in `/public/fonts/`.

### Type Scale

| Class / Context | Font Size | Weight | Letter Spacing | Where Used |
|---|---|---|---|---|
| Section eyebrow / label | `text-[11px]` → `text-xs` | `font-semibold` (600) | `tracking-widest` (`0.1em`) | All section eyebrows |
| Section label alt | `11px` / `12px` (responsive) | 600 | `1.5px` | `.section-label` util class |
| Section pill | `11px` | 600 | `0.1em` | `.section-pill` |
| Body small | `text-sm` (14px) | 400 | — | Card descriptions, FAQ answers |
| Body | `text-base` (16px) | 400–500 | — | Navigation, paragraphs |
| Body large | `text-lg` (18px) → `text-xl` (20px) | 400–500 | — | Subheadlines, supporting copy |
| Stat label | `text-[11px]` | 500–600 | `tracking-[0.14em]` | Metric cards |
| Stat value | `text-2xl` → `text-3xl` → `text-4xl` | `font-bold` → `font-extrabold` | — | Counter values |
| H3 (card title) | `text-lg` → `text-xl` | `font-bold` | — | Program step cards |
| H2 (section) | `text-3xl` → `text-4xl` (sm) | `font-bold` | `tracking-tight` | Section headings |
| H2 (showcase) | `text-4xl` → `text-5xl` → `text-[4.35rem]` | `font-semibold` | `tracking-tight` | Hero showcase |
| H1 (hero) | `text-4xl` → `text-5xl` → `text-[3.5rem]` | `font-bold` | `tracking-tight` | Primary hero |
| H1 (franchise hero) | `text-4xl` → `text-6xl` | `font-bold` | `tracking-tight` | Franchise landing hero |
| Calendly stat heading | `text-5xl` → `text-6xl` | `font-semibold` | `tracking-tight` / `leading-[1.05]` | CTA section |
| **Uppercase strip** | `text-sm` → `text-base` | `font-bold` | `tracking-[0.2em]` | Press logos strip |
| Body global | — | 400 | `-0.04em` (set on `body`) | Applied globally |

### Font Weights in Use

`300` (Light) · `400` (Regular) · `500` (Medium) · `600` (Semibold via Tailwind `font-semibold`) · `700` (Bold via `font-bold`) · `800` (Extrabold via `font-extrabold`) · `900` (Black)

### Line Heights

| Pattern | Usage |
|---|---|
| `leading-none` | Stat counters |
| `leading-tight` | Heading—tight |
| `leading-[1.02]` | Hero h1 |
| `leading-[1.05]` | Calendly CTA h2 |
| `leading-[0.98]` | Showcase section h2 |
| `leading-relaxed` | Body paragraphs, descriptions |

### Gradient / Color-Fill Text Effects

```tsx
// Blue gradient text (CalendlyCTASection)
<span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
  15 Minutos
</span>

// Stat value gradient
<div className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent">
  {value}
</div>
```

---

## 3. BACKGROUNDS & SURFACES

### Page-Level

- **Default page bg:** `background: #ffffff` (set by `body::before { background: #ffffff }`)
- **Body:** `background: transparent; isolation: isolate` — actual bg delivered by `::before`/`::after` pseudo-elements

### Section Backgrounds

| Class / Pattern | Effect |
|---|---|
| `bg-white` | Solid white — used on most content sections |
| `section-grid-bg` | White + 48×48px dot-grid overlay (see below) |
| `section-grid-bg` (hero) | Grid pattern over `bg-white`, with optional hero image blended via `linear-gradient(to bottom, rgba(248,250,252,0.93), ...)` |
| `.gradient-bg` | Solid white (simplified from earlier gradient) |

```css
/* section-grid-bg */
.section-grid-bg {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}
```

### Card / Surface Styles

**Glass Card (primary surface — `.glass-card`):**
```css
.glass-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}
.glass-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
}
```

**Inline card pattern (most used):**
```tsx
// Used on program step cards, stats cards, FAQ items, metric cards
className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"

// Stats variant with hover:
className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-black/12 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
```

**Container / Widget card (e.g., CalendlyCTA outer):**
```tsx
className="relative overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_2px_32px_rgba(0,0,0,0.08)]"
```

**Showcase image wrapper:**
```tsx
className="aspect-[16/10] overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.1)]"
```

### Glassmorphism Tokens (CSS Variables)

```css
/* Light mode */
--glass-bg:     rgba(255, 255, 255, 0.7);
--glass-border: rgba(0, 0, 0, 0.05);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
--glass-blur:   10px;
```

### Gradient Backgrounds (decorative)

```css
/* Mesh gradient (available but not actively applied to sections) */
--gradient-mesh: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
--gradient-mesh-alt:
  radial-gradient(at 0% 0%, #6366f1 0%, transparent 50%),
  radial-gradient(at 100% 100%, #8b5cf6 0%, transparent 50%),
  radial-gradient(at 50% 50%, #3b82f6 0%, transparent 50%);
```

### Noise Texture

```css
/* .soft-glow-noise — subtle SVG fractal noise overlay */
background-image: url("data:image/svg+xml, ...fractalNoise baseFrequency=0.9...");
background-size: 160px 160px;
mix-blend-mode: multiply;
opacity: 0.045;
```

### Z-Layering / Depth

| Layer | z-index | Role |
|---|---|---|
| `body::before` | `-2` | White base fill |
| `body::after` | `-1` | Reserved for effects |
| Section content | `z-10` (relative) | Normal stacking |
| Fixed navbar | `z-50` | Always on top |
| Decorative blobs | `-z-10` | Behind content |

### Blur / Glow Accents

```tsx
// Blue blur blob (decorative, behind headings)
<div className="pointer-events-none absolute -left-4 top-3 h-24 w-64 rounded-full bg-blue-500/15 blur-3xl" />
```

```css
--neon-green-glow: 0 0 20px rgba(16, 185, 129, 0.5);
```

---

## 4. SPACING & LAYOUT

### Container Widths

| Max-width class | px equiv | Usage |
|---|---|---|
| `max-w-3xl` | 768px | FAQ section, centered copy sections |
| `max-w-4xl` | 896px | Franchise hero content, showcase heading |
| `max-w-6xl` | 1152px | Financials grid |
| `max-w-7xl` | 1280px | Primary page wrapper |
| `max-w-[1080px]` | 1080px | Showcase screenshot |
| `max-w-[1100px]` | 1100px | Gallery carousel |

### Horizontal Padding

```
px-4 sm:px-6            — standard mobile → tablet
px-4 sm:px-6 lg:px-8   — extended with desktop step
px-6                    — inner section content
```

### Section Vertical Rhythm (padding)

| Pattern | Usage |
|---|---|
| `py-12 md:py-16` | Compact hero |
| `py-16 md:py-24` | Standard content sections |
| `py-16 sm:py-20 lg:py-24` | Stepped responsive |
| `py-20 sm:py-24 lg:py-28` | Showcase section |
| `py-24 md:py-32` | CTA footer (most breathing room) |
| `py-14 sm:py-16 lg:py-[4.5rem]` | CalendlyCTA outer |
| `py-10 sm:py-12` | Strip sections (press logos) |

### Grid Patterns

| Pattern | Usage |
|---|---|
| `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` | Metric / financial cards |
| `grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2 sm:auto-rows-fr` | Stats grid |
| `grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14` | Hero split (content + aside) |
| `grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10` | Calendly CTA split |

### Gap Values

| Value | Usage |
|---|---|
| `gap-2` | Pill/badge clusters |
| `gap-3` | Tight flex rows |
| `gap-4` | Card grids |
| `gap-5` | Program step cards |
| `gap-6` | Gallery cards |
| `gap-8` | Section grid default |
| `gap-10 lg:gap-14` | Hero split layout |

---

## 5. BORDER & RADIUS SYSTEM

### Border Radius Values

| Token | Value | Usage |
|---|---|---|
| `--radius` | `0.625rem` (10px) | Base shadcn token |
| `--radius-sm` | `calc(var(--radius) - 4px)` = 6px | — |
| `--radius-md` | `calc(var(--radius) - 2px)` = 8px | — |
| `--radius-lg` | `var(--radius)` = 10px | Input fields |
| `--radius-xl` | `calc(var(--radius) + 4px)` = 14px | — |
| `rounded-xl` | 12px | Cards (shadcn default), FAQ cards, hero image |
| `rounded-2xl` | 16px | Program step cards, stats cards, metric cards, buttons, gallery image mobile |
| `rounded-3xl` | 24px | Container widgets, showcase wrapper |
| `rounded-full` | 9999px | Pills, badges, nav CTA button, CTA links, stat discs |
| `rounded-[24px]` | 24px | Gallery cards |
| `hero-image` | 12px → 16px (md) | Hero images |

### Button Radius Specifics

```tsx
// buttonVariants base class
"rounded-2xl"                  // default, secondary, ghost, destructive
"rounded-xl" for size="xs"    // small variant
```

### Border Widths & Colors

| Pattern | Value |
|---|---|
| Standard card border | `border border-black/8` (≈ `rgba(0,0,0,0.08)`) |
| Hover card border | `border-black/12` (≈ `rgba(0,0,0,0.12)`) |
| Hairline divider | `border-black/5` |
| Section top accent | `linear-gradient(to right, transparent, rgba(37,99,235,0.25), transparent)` 1px height |
| Outline button | `border border-slate-200` |
| Outline button hover | `border-slate-300` |
| Input default | `border-input` (oklch 0.922) |
| FAQ item | `border-bottom: 1px solid #e4e4e7` |

### Divider Treatments

```tsx
// Section hairline top (CTA footer)
<div className="absolute left-0 right-0 top-0 h-px"
  style={{ background: "linear-gradient(to right, transparent, rgba(37,99,235,0.25), transparent)" }} />

// Investment row divider in franchise card
<div className="pt-1 border-t border-gray-100">
```

---

## 6. COMPONENT PATTERNS

### Buttons

**Primary CTA (gradient blue — most common):**
```tsx
// Via Link (used in hero sections)
className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] active:scale-95"

// Via buttonVariants default
"text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-[0_18px_40px_-18px_rgba(59,130,246,0.75)] hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-22px_rgba(59,130,246,0.95)] active:translate-y-0 rounded-2xl h-11 px-5"
```

**Orange CTA (program apply):**
```tsx
className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white shadow-[0_16px_32px_-20px_rgba(249,115,22,0.82)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-orange-600 hover:shadow-[0_26px_40px_-20px_rgba(249,115,22,0.9)] active:translate-y-0"
```

**Secondary / Ghost (white pill — nav):**
```tsx
// Nav CTA button
className="rounded-full bg-white px-7 py-3.5 text-[19px] font-bold text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:ring-4 focus-visible:ring-[rgba(40,96,231,0.18)]"

// buttonVariants "outline"
"border border-slate-200 bg-white/75 text-slate-900 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)] backdrop-blur hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white rounded-2xl h-11 px-5"
```

**Secondary white card button (Hero secondary CTA):**
```tsx
className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-black/10 bg-white px-8 py-4 text-sm font-medium text-[#171717] shadow-sm transition-all hover:border-black/20 hover:shadow-md active:scale-95"
```

**buttonVariants "secondary" (dark):**
```tsx
"bg-slate-900 text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.45)] hover:-translate-y-[1px] hover:bg-slate-800 rounded-2xl h-11 px-5"
```

**buttonVariants "ghost":**
```tsx
"text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 rounded-2xl h-11 px-5"
```

**Button Sizes:**
```
default: h-11 px-5 py-3
xs:      h-8  px-3         rounded-xl
sm:      h-10 px-4 py-2.5
lg:      h-12 px-7 py-4
icon:    size-11            rounded-2xl
icon-xs: size-8             rounded-xl
icon-sm: size-10            rounded-2xl
icon-lg: size-12            rounded-2xl
```

**Icon animation on button:**
```
[&_svg]:transition-transform hover:[&_svg:last-child]:translate-x-0.5
```

---

### Cards

**Default shadcn Card:**
```tsx
"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
// CardContent: "px-6"
// CardHeader: "px-6 gap-2"
```

**Standard content card (dominant pattern):**
```tsx
className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)] sm:p-6"
```

**Stats / metric card with hover lift:**
```tsx
className="rounded-2xl border border-black/8 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-black/12 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
```

**Franchise listing card (with image header):**
```tsx
// Card wrapper
className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
// Image area: h-48 overflow-hidden
// Gradient overlay: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
```

**FAQ Card:**
```tsx
style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
```

**Large container / widget card:**
```tsx
className="relative overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_2px_32px_rgba(0,0,0,0.08)]"
```

---

### Badges & Tags

**shadcn Badge (base):**
```tsx
// Base: "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium"
// default: "bg-primary text-primary-foreground"
// secondary: "bg-secondary text-secondary-foreground"
// outline: "border-border text-foreground"
// destructive: "bg-destructive text-white"
```

**Section eyebrow pill:**
```tsx
// Blue (most common)
<span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
// White / neutral
<span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700 shadow-sm">
```

**`.section-pill` utility:**
```css
display: inline-flex; align-items: center; gap: 0.375rem;
padding: 0.25rem 0.875rem; border-radius: 9999px;
border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.8);
font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
text-transform: uppercase; color: #171717;
```

**Match score badges:**
```tsx
// ≥80 score
"bg-green-500 text-white px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm rounded-full"
// ≥60 score
"bg-yellow-500 text-white ..."
// <60
"bg-gray-500 text-white ..."
```

**Program step number badge:**
```tsx
// Blue: "bg-[#2860E7]/15 text-[#2860E7] ring-1 ring-[#2860E7]/20"
// Orange: "bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/20"
// Emerald: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20"
// Shape: "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
```

**`.icon-badge-dark` utility:**
```css
display: inline-flex; align-items: center; justify-content: center;
width: 2.75rem; height: 2.75rem;
border-radius: 0.75rem; background: #171717; color: #ffffff;
```

---

### Navigation / Header

```tsx
// Navbar container — always visible, blurs on scroll
className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
  scrolled
    ? "border-b border-black/8 bg-white/92 backdrop-blur-md"
    : "border-b border-black/8 bg-white/86 backdrop-blur-md"
}`}

// Inner wrapper
className="mx-auto flex max-w-7xl items-center justify-between px-4 py-[0.3rem] sm:px-6 sm:py-[0.4rem]"

// Nav links
className="nav-link text-[19px] font-bold"
// nav-link CSS: color: #171717; transition: color 0.2s ease;
// nav-link:hover: color: #171717 (stays same)

// Nav CTA
className="rounded-full bg-white px-7 py-3.5 text-[19px] font-bold text-gray-900 shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
```

**Mobile menu:**
```css
.mobile-menu { transform: translateX(100%); transition: transform 0.3s ease; }
.mobile-menu.open { transform: translateX(0); }
```

---

### Section Headers

**Standard eyebrow + heading block:**
```tsx
<div className="mb-12 space-y-2">
  {/* Eyebrow */}
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
    Section label
  </p>
  {/* Heading */}
  <h2
    className="text-3xl font-bold text-[#171717] sm:text-4xl"
    style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
  >
    Section Title
  </h2>
</div>
```

**Centered variant:**
```tsx
<div className="mb-12 space-y-2 text-center">
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">FAQ</p>
  <h2 className="text-3xl font-bold text-[#171717] sm:text-4xl" style={...}>Heading</h2>
</div>
```

**Description / subheading:**
```tsx
// Standard
<p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-slate-600 md:text-xl">
// Small / muted
<p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
// Footnote
<p className="text-xs text-slate-400">
```

**Uppercase strip heading:**
```tsx
<h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-900 sm:text-base">
```

---

### Inputs & Forms

**shadcn Input:**
```tsx
className="file:text-foreground placeholder:text-muted-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
```

- Height: `h-9` (36px)
- Border radius: `rounded-md` (6px via `--radius-sm`)
- Focus ring: `ring-[3px]` with `ring-ring/50` color

**Small close/toggle button (pill style):**
```tsx
className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-900 transition hover:border-slate-400 hover:text-slate-800"
```

---

## 7. MOTION & EFFECTS

### Framer Motion — Standard Entrance

```tsx
// Fade up (most common — used on headings, cards, CTAs)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0 }}  // delay increments by 0.08–0.1s per child

// Staggered with viewport
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-60px" }}  // trigger 60px before entering
```

**Hero sequence delays:**
```
Logo:        delay: 0.15
Founding yr: delay: 0.15
Headline:    delay: 0.20, duration: 0.6
Subheadline: delay: 0.30, duration: 0.6
Credibility: delay: 0.34, duration: 0.45
Verified:    delay: 0.35, duration: 0.5
Disclaimer:  delay: 0.37, duration: 0.45
CTAs:        delay: 0.40, duration: 0.5
```

**FAQ accordion:**
```tsx
initial={{ height: 0, opacity: 0 }}
animate={{ height: "auto", opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.3, ease: "easeInOut" }}
```

### CSS Animations

**Scroll-reveal utility:**
```css
.scroll-fade-in {
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.scroll-fade-in.visible { opacity: 1; transform: translateY(0); }
.scroll-fade-in.delay-1 { transition-delay: 0.1s; }
.scroll-fade-in.delay-2 { transition-delay: 0.2s; }
.scroll-fade-in.delay-3 { transition-delay: 0.3s; }
```

**Logo carousel (infinite scroll):**
```css
.logo-carousel { animation: scroll-logos 21s linear infinite; }
.logo-carousel:hover { animation-play-state: paused; }
@keyframes scroll-logos { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.logo-item { opacity: 0.9; filter: grayscale(100%); transition: all 0.3s ease; }
.logo-item:hover { opacity: 1; filter: grayscale(0%); }
```

**Float glow (hero element):**
```css
@keyframes floatGlow {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%       { transform: translate3d(0, -1.25%, 0) scale(1.015); }
}
```

**Showcase float (subtle 12s infinite):**
```css
@keyframes stoika-showcase-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-2px); }
}
```

**Quiz option interaction:**
```css
.quiz-option-button {
  transition: opacity, transform, filter, border-color, box-shadow, background-color;
  transition-duration: 280ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
.quiz-option-button:hover {
  transform: translateY(-2px);
  border-color: #2f5bff;
  box-shadow: 0 10px 24px rgba(47, 91, 255, 0.14);
  transition-duration: 160ms; timing: ease-out;
}
```

**SVG chart animations (Revenue Preview):**
```
grid-drift:   4s linear infinite      (grid scrolls diagonally)
blob-float:   8.4s ease-in-out ∞     (blobs drift up/down)
blob-breathe: 5.6s ease-in-out ∞     (opacity 0.72 → 1)
line-draw:    6.2s cubic-bezier(0.33,1,0.68,1) ∞  (stroke-dashoffset)
dot-pulse:    3.2s ease-in-out ∞     (scale 1 → 1.12)
```

### Transition Conventions

| Context | Duration | Easing |
|---|---|---|
| Default interactive | `200ms` | `ease` |
| Button hover lift | `200ms` | `ease` |
| Card hover lift | `200ms` / `300ms` | `ease-out` / `ease` |
| Mobile menu slide | `300ms` | `ease` |
| Toggle panel show/hide | `300ms` | `ease-out` |
| Price card hover | `300ms` | `ease` |
| Logo item hover | `300ms` | `ease` |
| Navbar scroll | `300ms` | (default) |
| Parallax reveal | `700ms` | `ease-out` |
| Count-up animation | `900ms` | cubic ease-out (1 - (1-t)³) |

### Hover Patterns (Summary)

```
Cards:   hover:-translate-y-1 or hover:-translate-y-[1px]  + hover:shadow-*
Buttons: hover:-translate-y-[1px] + hover:shadow-*
Links:   hover:underline or no-op (same color)
Images:  group-hover:scale-110 (franchise card sector emoji)
```

---

## 8. ICONOGRAPHY & IMAGERY

### Icon Library

**Lucide React** (`lucide-react` v0.563.0) — used throughout.

Common icons:
- `ArrowRight` — CTAs, franchise card
- `Star` — ratings
- `Plus` / `Minus` — FAQ accordion
- `ExternalLink` — external link indicator

**Sizing conventions:**
```tsx
// Default (button auto-size via buttonVariants)
[&_svg:not([class*='size-'])]:size-[18px]  // buttons default

// Explicit sizes in use:
className="h-4 w-4"    // CTA arrows, FAQ icons
className="h-3.5 w-3.5"  // small external link
className="w-4 h-4"    // star rating
className="h-11 w-11"  // metric ring SVG
```

### Image Treatments

**Logo images:**
```tsx
// Nav logo
className="h-[5.12rem] w-auto sm:h-[6.4rem]"

// Partner logos (press strip)
className="h-[57px] w-auto grayscale opacity-70"
```

**Franchise logo in hero:**
```tsx
// Wrapper: "relative h-24 w-64 sm:h-28 sm:w-72"
// Image: fill + "object-contain"
```

**Cover / hero image:**
```tsx
// Aspect ratio container
className="aspect-[16/10] w-full overflow-hidden rounded-3xl"
// Image
className="object-cover object-top"
```

**Gallery cards:**
```tsx
className="w-[280px] shrink-0 sm:w-[320px] md:w-[344px] lg:w-[360px]"
// Inner: "relative h-[360px] overflow-hidden rounded-[24px] bg-[#d4d4d4]"
// Image: fill + object-cover
```

**Franchise listing card image:**
```tsx
className="relative h-48 overflow-hidden"
// Image: "absolute inset-0 w-full h-full object-cover"
// Overlay: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
```

**Hero image container:**
```css
.hero-image {
  border-radius: 12px; /* → 16px on md */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
```

---

## 9. TAILWIND CONFIG EXTENSIONS

> **Note:** This project uses **Tailwind CSS v4** with the `@theme inline` directive in `globals.css` instead of a `tailwind.config.ts`. The config file does not exist; all custom tokens are declared via CSS.

For a new project using Tailwind v4, replicate the `@theme inline` block. For a project using Tailwind v3, translate as follows:

```ts
// tailwind.config.ts equivalent for Tailwind v3
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.625rem", // --radius
        sm: "calc(0.625rem - 4px)",
        md: "calc(0.625rem - 2px)",
        lg: "0.625rem",
        xl: "calc(0.625rem + 4px)",
        "2xl": "calc(0.625rem + 8px)",
        "3xl": "calc(0.625rem + 12px)",
        "4xl": "calc(0.625rem + 16px)",
      },
      colors: {
        // shadcn semantic (reference CSS vars)
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Brand custom tokens
        "fl-base": "#0A0F1E",
        "fl-teal": "#00F0FF",
        "fl-purple": "#7B61FF",
        "fl-text": "#F0F0F5",
        "fl-muted": "#8A8F9E",
      },
      boxShadow: {
        "card-sm": "0 2px 8px rgba(0,0,0,0.04)",
        "card":    "0 2px 16px rgba(0,0,0,0.06)",
        "card-md": "0 2px 32px rgba(0,0,0,0.08)",
        "card-lg": "0 4px 40px rgba(0,0,0,0.10)",
        "btn-primary": "0 18px 40px -18px rgba(59,130,246,0.75)",
        "btn-primary-hover": "0 28px 60px -22px rgba(59,130,246,0.95)",
        "btn-orange": "0 16px 32px -20px rgba(249,115,22,0.82)",
        "btn-orange-hover": "0 26px 40px -20px rgba(249,115,22,0.90)",
        "hero-image": "0 20px 60px rgba(0,0,0,0.10)",
      },
      keyframes: {
        "scroll-logos": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float-glow": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-1.25%,0) scale(1.015)" },
        },
        "scroll-fade-in": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-float": {
          "0%": { transform: "translate(0,0)" },
          "35%": { transform: "translate(5px,-4px)" },
          "70%": { transform: "translate(-4px,6px)" },
          "100%": { transform: "translate(0,0)" },
        },
        "grid-drift": {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(-24px,-24px)" },
        },
      },
      animation: {
        "scroll-logos": "scroll-logos 21s linear infinite",
        "float-glow": "float-glow 6s ease-in-out infinite",
        "blob-float": "blob-float 8.4s ease-in-out infinite",
        "grid-drift": "grid-drift 4s linear infinite",
      },
    },
  },
}

export default config
```

---

## 10. GLOBAL CSS VARIABLES

Paste this into your `globals.css` after `@import "tailwindcss"`:

```css
/* ── Franchise Landing System design tokens ──────────────────────── */
@theme inline {
  --color-fl-base:    #0A0F1E;
  --color-fl-surface: rgba(255,255,255,0.03);
  --color-fl-border:  rgba(255,255,255,0.06);
  --color-fl-teal:    #00F0FF;
  --color-fl-purple:  #7B61FF;
  --color-fl-text:    #F0F0F5;
  --color-fl-muted:   #8A8F9E;
}

/* ── shadcn/ui semantic tokens ──────────────────────────────────── */
@theme inline {
  --color-background:  var(--background);
  --color-foreground:  var(--foreground);
  --font-sans:         var(--font-inter);
  --color-card:        var(--card);
  --color-card-foreground:       var(--card-foreground);
  --color-popover:               var(--popover);
  --color-popover-foreground:    var(--popover-foreground);
  --color-primary:               var(--primary);
  --color-primary-foreground:    var(--primary-foreground);
  --color-secondary:             var(--secondary);
  --color-secondary-foreground:  var(--secondary-foreground);
  --color-muted:                 var(--muted);
  --color-muted-foreground:      var(--muted-foreground);
  --color-accent:                var(--accent);
  --color-accent-foreground:     var(--accent-foreground);
  --color-destructive:           var(--destructive);
  --color-border:                var(--border);
  --color-input:                 var(--input);
  --color-ring:                  var(--ring);
  --radius-sm:  calc(var(--radius) - 4px);
  --radius-md:  calc(var(--radius) - 2px);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

@custom-variant dark (&:is(.dark *));

/* ── Base resets ────────────────────────────────────────────────── */
html {
  height: 100%;
  scroll-behavior: smooth;
}

:root {
  --radius: 0.625rem;

  /* shadcn semantic (light) */
  --background:         oklch(1 0 0);
  --foreground:         oklch(0.145 0 0);
  --card:               oklch(1 0 0);
  --card-foreground:    oklch(0.145 0 0);
  --popover:            oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary:            oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary:          oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted:              oklch(0.97 0 0);
  --muted-foreground:   oklch(0.556 0 0);
  --accent:             oklch(0.97 0 0);
  --accent-foreground:  oklch(0.205 0 0);
  --destructive:        oklch(0.577 0.245 27.325);
  --border:             oklch(0.922 0 0);
  --input:              oklch(0.922 0 0);
  --ring:               oklch(0.708 0 0);

  /* Glassmorphism tokens */
  --glass-bg:     rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.05);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  --glass-blur:   10px;

  /* Accent / glow */
  --neon-green:      #10b981;
  --neon-green-glow: 0 0 20px rgba(16, 185, 129, 0.5);

  /* Gradient presets */
  --gradient-mesh: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  --gradient-mesh-alt:
    radial-gradient(at 0% 0%, #6366f1 0%, transparent 50%),
    radial-gradient(at 100% 100%, #8b5cf6 0%, transparent 50%),
    radial-gradient(at 50% 50%, #3b82f6 0%, transparent 50%);
}

.dark {
  --background:         oklch(0.145 0 0);
  --foreground:         oklch(0.985 0 0);
  --card:               oklch(0.205 0 0);
  --card-foreground:    oklch(0.985 0 0);
  --popover:            oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary:            oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary:          oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted:              oklch(0.269 0 0);
  --muted-foreground:   oklch(0.708 0 0);
  --accent:             oklch(0.269 0 0);
  --accent-foreground:  oklch(0.985 0 0);
  --destructive:        oklch(0.704 0.191 22.216);
  --border:             oklch(1 0 0 / 10%);
  --input:              oklch(1 0 0 / 15%);
  --ring:               oklch(0.556 0 0);
  --glass-bg:           rgba(255, 255, 255, 0.1);
  --glass-border:       rgba(255, 255, 255, 0.2);
  --glass-shadow:       0 8px 32px rgba(0, 0, 0, 0.3);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply text-foreground;
    height: 100%;
    min-height: 100%;
    position: relative;
    background: transparent;
    isolation: isolate;
    letter-spacing: -0.04em;         /* global tight tracking */
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
}

/* White base layer (replaces body background) */
body::before {
  content: "";
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: -2;
  background: #ffffff;
  opacity: 1;
}
body::after {
  content: "";
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: -1;
  background: none;
  opacity: 1;
}

/* ── Utility classes ─────────────────────────────────────────────── */

/* Section dot-grid background */
.section-grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* Glass-style card */
.glass-card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.glass-card:hover {
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}

/* Dark icon badge */
.icon-badge-dark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.75rem; height: 2.75rem;
  border-radius: 0.75rem;
  background: #171717; color: #ffffff;
}

/* Section pill (eyebrow label with border) */
.section-pill {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.25rem 0.875rem; border-radius: 9999px;
  border: 1px solid rgba(0,0,0,0.1);
  background: rgba(255,255,255,0.8);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #171717;
}

/* Section label (text-only, no border) */
.section-label {
  color: #171717; text-transform: uppercase;
  letter-spacing: 1.5px; font-size: 11px; font-weight: 600;
}
@media (min-width: 768px) { .section-label { font-size: 12px; } }

/* Feature chips */
.feature-chip {
  background: #f4f4f5; border: 1px solid #e4e4e7; transition: all 0.2s ease;
}
.feature-chip:hover { background: #ffffff; border-color: #171717; }

/* Nav link */
.nav-link { color: #171717; transition: color 0.2s ease; }
.nav-link:hover { color: #171717; }

/* Hero image */
.hero-image {
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
}
@media (min-width: 768px) { .hero-image { border-radius: 16px; } }

/* Hero quiz glass panel */
.hero-quiz-glass {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 20px rgba(0,0,0,0.07);
  position: relative;
}

/* Toggle buttons */
.toggle-btn { transition: all 0.3s ease; }
.toggle-btn.active { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.toggle-btn:not(.active) { background: transparent; color: #171717; }

/* Toggle tabs (scrollable on mobile, no scrollbar) */
.toggle-tabs {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; -ms-overflow-style: none;
}
.toggle-tabs::-webkit-scrollbar { display: none; }

/* Mobile menu */
.mobile-menu { transform: translateX(100%); transition: transform 0.3s ease; }
.mobile-menu.open { transform: translateX(0); }

/* Price cards */
.price-card { transition: all 0.3s ease; }
.price-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.10); }

/* FAQ items */
.faq-item { border-bottom: 1px solid #e4e4e7; }

/* Neon accent */
.neon-accent { box-shadow: var(--neon-green-glow); border-color: var(--neon-green); }

/* Logo carousel */
.logo-carousel-container { position: relative; width: 100%; }
.logo-carousel { display: flex; animation: scroll-logos 21s linear infinite; will-change: transform; }
.logo-carousel:hover { animation-play-state: paused; }
.logo-item { opacity: 0.9; filter: grayscale(100%); transition: all 0.3s ease; }
.logo-item:hover { opacity: 1; filter: grayscale(0%); }

/* Scroll fade-in */
.scroll-fade-in {
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.scroll-fade-in.visible { opacity: 1; transform: translateY(0); }
.scroll-fade-in.delay-1 { transition-delay: 0.1s; }
.scroll-fade-in.delay-2 { transition-delay: 0.2s; }
.scroll-fade-in.delay-3 { transition-delay: 0.3s; }

/* Noise texture overlay */
.soft-glow-noise {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 160px 160px;
  mix-blend-mode: multiply;
  opacity: 0.045;
}

/* ── Keyframes ───────────────────────────────────────────────────── */

@keyframes scroll-logos {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes floatGlow {
  0%, 100% { transform: translate3d(0,0,0) scale(1); }
  50%       { transform: translate3d(0,-1.25%,0) scale(1.015); }
}

@keyframes grid-drift {
  0%   { transform: translate(0,0); }
  100% { transform: translate(-24px,-24px); }
}

@keyframes blob-float {
  0%   { transform: translate(0,0); }
  35%  { transform: translate(5px,-4px); }
  70%  { transform: translate(-4px,6px); }
  100% { transform: translate(0,0); }
}

@keyframes blob-breathe {
  0%, 100% { opacity: 0.72; }
  50%       { opacity: 1; }
}

@keyframes line-draw {
  0%   { stroke-dashoffset: 420; opacity: 0.9; }
  36%  { stroke-dashoffset: 0;   opacity: 1; }
  70%  { stroke-dashoffset: 0;   opacity: 1; }
  100% { stroke-dashoffset: -420; opacity: 0.9; }
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1);    opacity: 0.9; }
  50%       { transform: scale(1.12); opacity: 1; }
}

@keyframes quiz-option-nudge-pulse {
  0%   { transform: scale(1) translateY(0); box-shadow: 0 0 0 0 rgba(47,91,255,0), 0 0 0 0 rgba(47,91,255,0); }
  45%  { transform: scale(1.015) translateY(0); box-shadow: 0 0 0 2px rgba(47,91,255,0.35), 0 0 0 6px rgba(47,91,255,0.1); }
  100% { transform: scale(1) translateY(0); box-shadow: 0 0 0 0 rgba(47,91,255,0), 0 0 0 0 rgba(47,91,255,0); }
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  body::after { animation: none; }
  .logo-carousel, .soft-glow-layer { animation: none; }
  .quiz-option-button { transition: none; transform: none !important; opacity: 1 !important; }
  .quiz-option-button:hover { transform: none; box-shadow: none; }
  .quiz-option-nudge-pulse { animation: none; }
}
```

---

## Quick-Start Checklist (New Project in 1 Hour)

### 1. Initialize (5 min)
```bash
npx create-next-app@latest sister-platform --typescript --tailwind --app
cd sister-platform
npx shadcn@latest init
```

### 2. Install dependencies (5 min)
```bash
npm install framer-motion lucide-react class-variance-authority clsx tailwind-merge
```

### 3. Typography (10 min)
- Download **Satoshi** fonts from Fontshare (Light, Regular, Medium, Bold, Black TTF)
- Place in `/public/fonts/`
- Copy the `localFont` block from [layout.tsx](src/app/layout.tsx) above into your `src/app/layout.tsx`
- Apply `${satoshi.variable} font-sans antialiased` to `<body>`

### 4. Global CSS (5 min)
- Replace your `globals.css` with the full block in **Section 10** above

### 5. shadcn components (5 min)
```bash
npx shadcn@latest add button card badge input dialog
```
Then paste the custom `buttonVariants` definition from **Section 6** into `components/ui/button.tsx`

### 6. Core utility (2 min)
```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

### 7. Build a reference section (28 min)
Use these class strings to build a representative landing section:

```tsx
// Eyebrow + heading block
<div className="mb-12 space-y-2">
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">Your Label</p>
  <h2 className="text-3xl font-bold text-[#171717] sm:text-4xl">Your Heading</h2>
  <p className="text-lg leading-relaxed text-slate-600">Your description text here.</p>
</div>

// Grid of cards
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
    <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">Label</p>
    <p className="mt-2 text-2xl font-bold text-[#171717]">Value</p>
  </div>
</div>

// Primary CTA
<a className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.6)] active:scale-95">
  Get Started
  <ArrowRight className="h-4 w-4" />
</a>

// Section with grid background
<section className="section-grid-bg bg-white py-16 md:py-24">
  {/* content */}
</section>
```

---

*Generated from full codebase audit of Franquicias LATAM — Next.js 16.1.6 + Tailwind CSS v4 + shadcn/ui + Framer Motion 12 + Lucide React 0.563*
