# `/saju` — Sajú Franquicia Master landing

A bespoke, brand-faithful campaign landing for the **Sajú** franchise opportunity,
presented by **Franquicias LATAM**. Self-contained and page-scoped so it can be
lifted into any segment of the app with zero rework.

## Route

- Canonical: **`/saju`** (`src/app/saju/page.tsx`).
- Want the prompt's `/franquicias/saju` path too? Add a redirect in `next.config.ts`:
  ```ts
  async redirects() {
    return [{ source: "/franquicias/saju", destination: "/saju", permanent: false }];
  }
  ```
  (The existing DB-driven template still renders at `/franquicia/saju` — this page does
  not touch it.)

## Brand = live store (sajucompany.com)

Type and color are taken from the live Sajú store, **not** the 2020 brandbook:

- **Fonts:** Jost (headings) + Poppins 300/400 (body) via `next/font/google` (self-hosted at build).
- **Palette:** ink `#231F20`, white, grays, signature yellow `#F7EB61`, teal `#108474`.
- **Components:** uppercase pill buttons (`letter-spacing .18em`), offset shadows, the
  “táchalo” yellow strike device.

See `../../../SAJU_BRAND.md` for the full token reference.

## Verification — the Franquicias LATAM seam

The "Verificado por Franquicias LATAM" elements are **deliberately styled in the
parent platform's language** (brand blue `#2563eb`, slate text, white/glass pills,
the official "Franquicia Verificada" seal), *not* Sajú's yellow/teal — see
`design-system.md`. Sajú owns the body; Franquicias LATAM frames & verifies. It
appears in three places: a hero trust pill, a dedicated verification band right
after the hero, and the footer. The `--fl-*` tokens in `saju.css` carry these.

## Style scoping (no bleed)

All CSS lives in `saju.css`, every selector namespaced under **`.saju-root`** (set on the
wrapper in `layout.tsx`). Parent-site globals don't reach the Sajú body, and Sajú styles
can't leak out. Layout (`<html>/<body>`) stays owned by the root app layout.

## Lead delivery

The application form (`_components/ApplyForm.tsx`) posts to the **existing**
`POST /api/leads/form` with:

```
franchiseSlug / listingSlug: "saju"
landingSource: "saju-landing"
campaign: "saju-franquicias", source: "saju"
+ name, email, phone, country, city, investmentRange, experience, message, consent
```

So leads flow into the existing Franquicias LATAM pipeline (`FormLead` → notifications),
tagged to the SAJÚ franchise record. No new endpoint or env var is required — it reuses
the platform's lead infrastructure (Prisma + the existing notification/email setup).

> Locally without a database the POST returns 500 and the form shows an in-brand error
> box; on an environment with `DATABASE_URL` configured it persists + notifies normally.

## Files

```
src/app/saju/
  layout.tsx          fonts (Jost/Poppins) + SEO metadata + .saju-root wrapper
  page.tsx            section composition (server component)
  saju.css            scoped design system
  data.ts             all copy & numbers (verified vs scripts/update-saju-landing.ts)
  _components/
    SajuNav.tsx       sticky sub-nav (scroll + mobile menu + smooth anchors)
    Reveal.tsx        IntersectionObserver scroll-reveal (reduced-motion safe)
    Tachalo.tsx       Strike + Eyebrow brand devices
    CtaLink.tsx       smooth-scroll anchor + cta_click analytics
    Faqs.tsx          accordion
    ApplyForm.tsx     qualification form (client + server validation, honeypot)
    VerifiedBadge.tsx "Verificado por Franquicias LATAM" trust pill (platform-styled)
    track.ts          analytics stub (GA4 / Plausible / dataLayer ready)
public/saju/          saju-mono.png, saju-wordmark.png  (sourced from the live store)
                      fl-verified.png, fl-monogram.png, fl-logo.png  (Franquicias LATAM marks)
src/app/privacidad/   consent target stub (replace with canonical policy)
```

## Analytics

`track.ts` fires `cta_click`, `form_start`, `form_submit_success`, `form_submit_error`
into `window.dataLayer` / `gtag` / `plausible` if present; no-ops otherwise.

## i18n seam

Copy is centralized in `data.ts` (ES). To add EN later, key the content object by locale
and select on a `lang` param — no component changes needed.
