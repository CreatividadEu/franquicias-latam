import Image from "next/image";
import { SAJU } from "./data";
import { Reveal } from "./_components/Reveal";
import { Strike, Eyebrow } from "./_components/Tachalo";
import { SajuNav } from "./_components/SajuNav";
import { CtaLink } from "./_components/CtaLink";
import { Faqs } from "./_components/Faqs";
import { ApplyForm } from "./_components/ApplyForm";
import { VerifiedBadge } from "./_components/VerifiedBadge";

export default function SajuPage() {
  const c = SAJU;
  return (
    <>
      <SajuNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header
        id="top"
        className="saju-hero saju-bg-ink on-dark"
        style={{
          background:
            "radial-gradient(120% 90% at 80% 0%, #2c2728 0%, var(--ink) 45%, var(--black) 100%)",
        }}
      >
        <Image
          src="/saju/saju-mono.png"
          alt=""
          aria-hidden
          width={720}
          height={720}
          className="saju-hero__watermark"
          priority
        />
        <div className="saju-container">
          <div className="saju-hero__inner">
            <Reveal>
              <Eyebrow>{c.hero.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="saju-h-hero display">
                {c.hero.headlineBefore}
                <Strike>{c.hero.headlineStrike}</Strike>
                {c.hero.headlineAfter}
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="saju-hero__sub">{c.hero.subhead}</p>
            </Reveal>
            <Reveal delay={220}>
              <div className="saju-hero__actions">
                <CtaLink
                  href="#aplica"
                  className="saju-btn saju-btn--yellow"
                  label="hero_primary"
                >
                  {c.hero.primaryCta} →
                </CtaLink>
                <CtaLink
                  href="#oportunidad"
                  className="saju-btn saju-btn--ghost saju-btn--on-dark"
                  label="hero_secondary"
                >
                  {c.hero.secondaryCta} ↓
                </CtaLink>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div
                style={{
                  marginTop: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.9rem 1.1rem",
                }}
              >
                <VerifiedBadge />
                <span
                  style={{
                    fontSize: "0.66rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    maxWidth: "22ch",
                    lineHeight: 1.5,
                  }}
                >
                  Una oportunidad de franquicia presentada por Franquicias&nbsp;LATAM
                </span>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="saju-hero__cue" aria-hidden>
          <span>Scroll</span>
          <svg width="16" height="22" viewBox="0 0 16 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="14" height="20" rx="7" />
            <path d="M8 6v4" strokeLinecap="round" />
          </svg>
        </div>
      </header>

      {/* ── VERIFICACIÓN (Franquicias LATAM seam) ────────────────────────── */}
      <section className="saju-section saju-fl-band" aria-label="Verificación de Franquicias LATAM">
        <div className="saju-container">
          <div className="saju-fl-band__grid">
            <div>
              <Reveal>
                <span className="saju-fl-eyebrow">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                    <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Franquicia Verificada
                </span>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="saju-fl-band__title">
                  Una oportunidad{" "}
                  <span style={{ color: "var(--fl-blue)" }}>verificada</span> por Franquicias LATAM.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="saju-fl-band__sub">
                  No es un listado más. Franquicias LATAM evaluó esta oportunidad antes de
                  presentarla: revisa el modelo, la marca y la inversión, y solo entonces la respalda
                  ante inversionistas de la región.
                </p>
              </Reveal>
              <div className="saju-fl-points">
                {[
                  "Modelo de negocio e inversión revisados por la plataforma.",
                  "Marca con operación real y track record verificable.",
                  "Tu aplicación la califica el equipo de Franquicias LATAM.",
                ].map((p, i) => (
                  <Reveal as="div" key={p} delay={140 + i * 60}>
                    <div className="saju-fl-point">
                      <span className="saju-fl-point__ic">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden>
                          <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{p}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={100}>
              <div className="saju-fl-band__seal">
                <Image
                  src="/saju/fl-verified.png"
                  alt="Sello Franquicia Verificada por Franquicias LATAM"
                  width={480}
                  height={270}
                />
                <div className="saju-fl-band__issuer">
                  <Image src="/saju/fl-logo.png" alt="Franquicias LATAM" width={96} height={54} />
                  <span>· Sello de verificación</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── IDEAL / TÁCHALO ──────────────────────────────────────────────── */}
      <section className="saju-section saju-bg-paper">
        <div className="saju-container">
          <div className="saju-grid-2">
            <div>
              <Reveal>
                <Eyebrow>{c.ideal.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="saju-h-sec">{c.ideal.title}</h2>
              </Reveal>
              <Reveal delay={120}>
                <p style={{ marginTop: "1.5rem", color: "var(--gray)", maxWidth: "46ch", fontSize: "1.05rem" }}>
                  {c.ideal.body}
                </p>
              </Reveal>
            </div>
            <ul className="saju-checklist" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {c.ideal.checklist.map((item, i) => (
                <Reveal as="li" key={item.label} delay={i * 60}>
                  <div className={`saju-check ${item.done ? "saju-check--done" : "saju-check--next"}`}>
                    <span className="saju-check__box">
                      {item.done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="saju-check__label">{item.label}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── TRACK RECORD ─────────────────────────────────────────────────── */}
      <section className="saju-section saju-bg-ink2 on-dark">
        <div className="saju-container">
          <div className="saju-grid-2">
            <div>
              <Reveal>
                <Eyebrow>{c.track.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="saju-h-sec">{c.track.title}</h2>
              </Reveal>
              <div className="saju-timeline">
                {c.track.timeline.map((t, i) => (
                  <Reveal key={t.year} delay={i * 70}>
                    <div className="saju-tl">
                      <span className="saju-tl__year">{t.year}</span>
                      <span className="saju-tl__text">{t.text}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <div className="saju-awards">
                {c.track.awards.map((a, i) => (
                  <Reveal key={a.kicker} delay={i * 90}>
                    <div className="saju-award">
                      <div className="saju-award__k">{a.kicker}</div>
                      <div className="saju-award__t">{a.text}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={120}>
                <p
                  className="saju-eyebrow"
                  style={{ marginTop: "2rem", color: "rgba(255,255,255,0.55)" }}
                >
                  Colaboraciones
                </p>
                <div className="saju-chips">
                  {c.track.collabs.map((x) => (
                    <span className="saju-chip" key={x}>
                      {x}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTO & EXPERIENCIA ───────────────────────────────────────── */}
      <section id="producto" className="saju-section saju-bg-paper2">
        <div className="saju-container">
          <Reveal>
            <Eyebrow>{c.product.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="saju-h-sec" style={{ maxWidth: "16ch" }}>
              {c.product.title}
            </h2>
          </Reveal>

          <div className="saju-grid-2" style={{ marginTop: "2.6rem" }}>
            <div className="saju-lines" style={{ marginTop: 0 }}>
              {c.product.lines.map((l, i) => (
                <Reveal key={l.name} delay={i * 60}>
                  <div className="saju-linecard">
                    <span className="saju-linecard__n">{l.name}</span>
                    <span className="saju-linecard__note">{l.note}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Reveal>
                <div className="saju-feature saju-feature--teal">
                  <div className="saju-feature__t">{c.product.experience.title}</div>
                  <p className="saju-feature__b">{c.product.experience.body}</p>
                </div>
              </Reveal>
              <Reveal delay={90}>
                <div className="saju-feature saju-feature--yellow">
                  <div className="saju-feature__t">{c.product.lensesBar.title}</div>
                  <p className="saju-feature__b">{c.product.lensesBar.body}</p>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={80}>
            <div className="saju-stats">
              {c.product.stats.map((s) => (
                <div className="saju-stat" key={s.label}>
                  <div className="saju-stat__v">{s.value}</div>
                  <div className="saju-stat__l">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── OPORTUNIDAD LATAM ────────────────────────────────────────────── */}
      <section id="oportunidad" className="saju-section saju-bg-ink on-dark">
        <div className="saju-container">
          <div className="saju-grid-2">
            <div>
              <Reveal>
                <Eyebrow>{c.opportunity.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="saju-h-sec">{c.opportunity.title}</h2>
              </Reveal>
              <Reveal delay={120}>
                <div
                  className="saju-feature saju-feature--yellow"
                  style={{ marginTop: "1.8rem", boxShadow: "12px 12px 0 var(--teal)" }}
                >
                  <div className="saju-feature__t">Meta: {c.opportunity.goal}</div>
                  <p className="saju-feature__b" style={{ color: "var(--ink)" }}>
                    El plan para convertir a Sajú en la marca No.1 de gafas de LATAM.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="saju-stats" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {c.opportunity.stats.map((s) => (
                    <div className="saju-stat" key={s.label}>
                      <div className="saju-stat__v" style={{ color: "var(--yellow)" }}>
                        {s.value}
                      </div>
                      <div className="saju-stat__l">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div>
              <Reveal>
                <p className="saju-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Mercados prioritarios
                </p>
              </Reveal>
              <div className="saju-markets">
                {c.opportunity.markets.map((m, i) => (
                  <Reveal key={m.name} delay={i * 60}>
                    <div className="saju-market">
                      <span className="saju-market__rank">{m.rank}</span>
                      <span className="saju-market__name">{m.name}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={120}>
                <div className="saju-special">
                  <s>USA · México</s> — {c.opportunity.special}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODELOS DE TIENDA ────────────────────────────────────────────── */}
      <section id="modelos" className="saju-section saju-bg-paper">
        <div className="saju-container">
          <Reveal>
            <Eyebrow>{c.models.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="saju-h-sec" style={{ maxWidth: "18ch" }}>
              {c.models.title}
            </h2>
          </Reveal>
          <div className="saju-models">
            {c.models.cards.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <div className={`saju-model ${m.featured ? "saju-model--featured" : ""}`}>
                  <span className="saju-model__tag">{m.tag}</span>
                  <div className="saju-model__name">{m.name}</div>
                  <div className="saju-model__range">{m.range}</div>
                  <div className="saju-model__size">{m.size}</div>
                  <div className="saju-model__bd">
                    {m.breakdown.map(([k, v]) => (
                      <div className="saju-model__bdrow" key={k}>
                        <span>{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p style={{ marginTop: "1.6rem", fontSize: "0.82rem", color: "var(--gray)" }}>
              {c.models.disclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── EL DEAL ──────────────────────────────────────────────────────── */}
      <section id="deal" className="saju-section saju-bg-teal on-dark">
        <div className="saju-container">
          <div className="saju-grid-2">
            <div>
              <Reveal>
                <Eyebrow>{c.deal.eyebrow}</Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="saju-h-sec" style={{ fontSize: "clamp(2.6rem,7vw,5rem)" }}>
                  {c.deal.title}
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <div className="saju-profile">
                  <div className="saju-profile__t">{c.deal.profile.title}</div>
                  <p className="saju-profile__b">{c.deal.profile.body}</p>
                  <p className="saju-profile__proof">{c.deal.profile.proof}</p>
                </div>
              </Reveal>
            </div>
            <div className="saju-deal">
              {c.deal.rows.map((r, i) => (
                <Reveal key={r.k} delay={i * 70}>
                  <div className="saju-dealrow">
                    <span className="saju-dealrow__k">{r.k}</span>
                    <span className="saju-dealrow__v">{r.v}</span>
                    <span className="saju-dealrow__note">{r.note}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="saju-section saju-bg-paper2">
        <div className="saju-container">
          <Reveal>
            <Eyebrow>Preguntas frecuentes</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="saju-h-sec">Lo que todo inversionista pregunta.</h2>
          </Reveal>
          <Faqs items={c.faqs} />
        </div>
      </section>

      {/* ── APLICACIÓN ───────────────────────────────────────────────────── */}
      <section
        id="aplica"
        className="saju-section saju-bg-ink on-dark"
        style={{
          background:
            "radial-gradient(110% 80% at 15% 0%, #2c2728 0%, var(--ink) 55%, var(--black) 100%)",
        }}
      >
        <div className="saju-container" style={{ maxWidth: "920px" }}>
          <Reveal>
            <Eyebrow>Aplica a la franquicia</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="saju-h-sec" style={{ fontSize: "clamp(2.4rem,6vw,4.2rem)" }}>
              Empecemos a <Strike>tachar</Strike> juntos.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{ marginTop: "1.3rem", color: "rgba(255,255,255,0.72)", maxWidth: "52ch" }}>
              Cuéntanos quién eres y qué mercado tienes en mente. Si el perfil encaja, el equipo de
              Franquicias LATAM te contacta para los siguientes pasos de la Franquicia Master.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <ApplyForm />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER (co-brand band) ───────────────────────────────────────── */}
      <footer className="saju-footer">
        <div className="saju-container">
          <div className="saju-footer__top">
            <div className="saju-footer__brand">
              <span className="saju-footer__mono">
                <Image src="/saju/saju-mono.png" alt="Sajú" width={38} height={38} />
              </span>
              <div className="saju-footer__tag">Grab your style.</div>
              <div className="saju-footer__endorse">
                El mono es el original
                <br />
                Una oportunidad presentada y verificada por <b>Franquicias LATAM</b>
              </div>
              <div style={{ marginTop: "1.2rem" }}>
                <VerifiedBadge />
              </div>
              <Image
                src="/saju/fl-logo.png"
                alt="Franquicias LATAM"
                width={192}
                height={108}
                className="saju-footer__fllogo"
              />
            </div>
            <div className="saju-footer__cols">
              <div className="saju-footer__col">
                <h5>Oportunidad</h5>
                <CtaLink href="#oportunidad">La oportunidad</CtaLink>
                <CtaLink href="#modelos">Modelos & inversión</CtaLink>
                <CtaLink href="#deal">Franquicia Master</CtaLink>
                <CtaLink href="#aplica">Aplica</CtaLink>
              </div>
              <div className="saju-footer__col">
                <h5>Sajú</h5>
                <a href={c.social.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram @saju
                </a>
                <a href={c.social.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube @tachalo
                </a>
                <a href={c.social.tiktok} target="_blank" rel="noopener noreferrer">
                  TikTok @losdesaju
                </a>
              </div>
              <div className="saju-footer__col">
                <h5>Legal</h5>
                <a href="/privacidad">Privacidad</a>
                <a href="https://franquiciaslatam.co" target="_blank" rel="noopener noreferrer">
                  Franquicias LATAM
                </a>
              </div>
            </div>
          </div>
          <div className="saju-footer__bottom">
            <span>© {new Date().getFullYear()} Sajú · Franquicia presentada por Franquicias LATAM.</span>
            <span>Hecho orgullosamente tropical 🌴</span>
          </div>
        </div>
      </footer>
    </>
  );
}
