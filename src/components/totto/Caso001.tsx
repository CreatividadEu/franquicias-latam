"use client";

import {
  ACT_FLAGS,
  ACT_I,
  ACT_II,
  ACT_III,
  ACT_IV,
  BIG_NUMBER,
  BRAND,
  CLOSING,
  CONSOLE,
  DECISIONS,
  DROPI,
  ENTRY_POINT,
  FUNNEL,
  HERO,
  PRINCIPLE,
  PROGRAM,
  SEIZURE,
  STOCKS,
  breakdownTotal,
  formatCo,
  type ActId,
} from "@/lib/totto/caso001";
import StoikConsole from "./StoikConsole";
import { CornerMotif, Counter, Evidence, Eyebrow, Reveal, cx } from "./parts";
import { useActiveAct, useInView, useScrollProgress } from "./hooks";
import s from "./caso001.module.css";

/**
 * Caso 001 · Stoik Intel × Totto.
 *
 * Scroll continuo en cuatro actos con desenlace de decisión. Todo el copy y
 * las cifras vienen de `@/lib/totto/caso001`; aquí solo se pone en escena.
 */
export default function Caso001() {
  const barRef = useScrollProgress();
  const act = useActiveAct<ActId>("hero");

  return (
    <div className={s.root}>
      <div className={s.progress} aria-hidden="true">
        <div ref={barRef} className={s.progressBar} />
      </div>

      <p className={s.flag} aria-live="polite">
        <i className={s.flagDot} aria-hidden="true" />
        {ACT_FLAGS[act]}
      </p>
      <p className={s.confidential}>{BRAND.confidential}</p>

      <main>
        <Hero />
        <Principle />
        <BigNumber />
        <ActOne />
        <ActTwo />
        <ActThree />
        <ActFour />
        <Decisions />
        <Program />
        <Closing />
      </main>
    </div>
  );
}

// ── 1 · Hero ────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className={cx(s.hero, s.cornerWrap)} data-act="hero">
      <div className={s.heroGlow} aria-hidden="true" />
      <CornerMotif className={s.cornerTL} />

      <div className={s.heroInner}>
        <Eyebrow tone="red">{HERO.eyebrow}</Eyebrow>

        <h1 className={s.heroTitle}>
          {HERO.lines.map((line) => (
            <span
              key={line.text}
              className={cx(
                s.heroLine,
                line.tone === "red" && s.red,
                line.tone === "gold" && s.gold,
              )}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <p className={s.heroSub}>{HERO.sub}</p>

        <div className={s.heroMeta}>
          <span className={cx(s.chip, s.mono)}>{BRAND.wordmark}</span>
          <span className={cx(s.chip, s.mono)}>{BRAND.caseTag}</span>
          <span className={cx(s.chip, s.mono)}>{BRAND.client}</span>
        </div>

        <p className={s.scrollCue}>
          <span className={s.scrollCueBar} aria-hidden="true" />
          {HERO.scrollCue}
        </p>
      </div>
    </section>
  );
}

// ── 2 · Primer principio ────────────────────────────────────────────────────

function Principle() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className={s.section} data-act="principio">
      <div className={s.inner}>
        <Reveal>
          <Eyebrow>{PRINCIPLE.eyebrow}</Eyebrow>
        </Reveal>

        <div ref={ref} className={s.thesis}>
          {PRINCIPLE.thesis.map((line, index) => (
            <p
              key={line}
              className={cx(s.thesisLine, inView && s.thesisLineOn)}
              style={{ transitionDelay: `${index * 260}ms` }}
            >
              {line}
            </p>
          ))}
        </div>

        <Reveal delay={120}>
          <p className={s.body} style={{ marginTop: 30 }}>
            {PRINCIPLE.body}
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className={s.grid4} style={{ marginTop: 40 }}>
            {PRINCIPLE.traits.map((trait) => (
              <div key={trait.title} className={cx(s.card, s.cardPad)}>
                <p className={s.traitTitle}>{trait.title}</p>
                <p className={s.note} style={{ marginTop: 10 }}>
                  {trait.note}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── 3 · La gran cifra ───────────────────────────────────────────────────────

function BigNumber() {
  const total = breakdownTotal();

  return (
    <section className={s.section} data-act="cifra">
      <div className={cx(s.inner, s.bigNumberWrap)}>
        <Reveal>
          <Eyebrow>{BIG_NUMBER.eyebrow}</Eyebrow>
          <p className={s.bigNumber}>
            <Counter value={BIG_NUMBER.value} duration={2200} />
          </p>
          <p className={s.bigUnit}>{BIG_NUMBER.unit}</p>
          <p className={s.bigQualifier}>{BIG_NUMBER.qualifier}</p>
        </Reveal>

        <Reveal delay={140}>
          <div className={s.breakdown}>
            {BIG_NUMBER.breakdown.map((part) => (
              <div key={part.name} className={cx(s.card, s.cardPad)}>
                <p className={s.breakdownValue}>
                  <Counter value={part.value} duration={1700} />
                </p>
                <p className={s.kpiLabel}>{part.name}</p>
              </div>
            ))}
          </div>

          <p className={s.sumBar}>
            <span className={s.dim}>{BIG_NUMBER.sumLabel}</span>
            <span>
              {BIG_NUMBER.breakdown.map((part) => formatCo(part.value)).join(" + ")}
              {" = "}
              <strong className={s.gold}>{formatCo(total)}</strong>
            </span>
          </p>

          <p className={s.note} style={{ maxWidth: "62ch", margin: "22px auto 0" }}>
            {BIG_NUMBER.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── 4 · Acto I · La escala ──────────────────────────────────────────────────

function ActOne() {
  return (
    <section className={s.section} data-act="acto-i">
      <div className={s.inner}>
        <Reveal>
          <div className={cx(s.actCover, s.cornerWrap)}>
            <CornerMotif className={s.cornerTL} />
            <div style={{ position: "relative" }}>
              <p className={s.actKicker}>{ACT_I.coverKicker}</p>
              <h2 className={s.actTitle}>{ACT_I.coverTitle}</h2>
              <p className={s.actSub}>{ACT_I.coverSub}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className={s.chain}>
            {ACT_I.chain.map((link) => (
              <div key={link.step} className={s.chainItem}>
                <p className={s.chainStep}>{link.step}</p>
                <p className={s.chainTitle}>{link.title}</p>
                <p className={s.note} style={{ marginTop: 8 }}>
                  {link.note}
                </p>
              </div>
            ))}
          </div>

          <p className={s.alertBand}>
            <i className={s.alertMark} aria-hidden="true" />
            {ACT_I.alert}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(48px, 6vh, 80px)" }}>
            <h3 className={s.displaySm}>{ACT_I.hiding.title}</h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {ACT_I.hiding.body}
            </p>

            <div className={s.chips} style={{ marginTop: 22 }}>
              {ACT_I.hiding.aliases.map((alias) => (
                <span
                  key={alias.term}
                  className={cx(s.chip, alias.featured && s.chipFeatured)}
                >
                  {alias.term}
                </span>
              ))}
            </div>

            <div className={s.panelSplit} style={{ marginTop: 24 }}>
              <Evidence slug={ACT_I.hiding.evidence} lead={ACT_I.hiding.evidenceLead} />
              <div>
                <Evidence slug={ACT_I.hiding.contextEvidence} />
                <div style={{ marginTop: 18 }}>
                  <Evidence slug={ACT_I.hiding.triageEvidence} />
                </div>
                <p className={cx(s.body, s.paper)} style={{ marginTop: 14, fontWeight: 600 }}>
                  {ACT_I.hiding.triageNote}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── 5 · Acto II · La máquina ────────────────────────────────────────────────

function ActTwo() {
  return (
    <section className={s.section} data-act="acto-ii">
      <div className={s.inner}>
        <Reveal>
          <div className={cx(s.actCover, s.cornerWrap)}>
            <CornerMotif className={s.cornerTL} />
            <div style={{ position: "relative" }}>
              <p className={s.actKicker}>{ACT_II.coverKicker}</p>
              <h2 className={s.actTitle}>{ACT_II.coverTitle}</h2>
              <p className={s.actSub}>{ACT_II.coverSub}</p>
              <div className={s.chips} style={{ marginTop: 24 }}>
                {ACT_II.moatChips.map((chip) => (
                  <span key={chip} className={s.chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ marginTop: "clamp(44px, 6vh, 76px)" }}>
            <h3 className={s.displaySm}>{CONSOLE.title}</h3>
            <p className={s.note} style={{ marginTop: 10 }}>
              {CONSOLE.hint}
            </p>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div style={{ marginTop: 22 }}>
            <StoikConsole />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(52px, 7vh, 92px)" }}>
            <Eyebrow>{FUNNEL.eyebrow}</Eyebrow>
            <h3 className={s.displaySm} style={{ marginTop: 12 }}>
              {FUNNEL.title}
            </h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {FUNNEL.body}
            </p>

            <div className={s.funnel}>
              {FUNNEL.stages.map((stage, index) => (
                <div
                  key={stage.name}
                  className={s.funnelRow}
                  style={{ width: `${100 - index * 11}%` }}
                >
                  <span className={s.funnelName}>{stage.name}</span>
                  <span className={s.funnelNote}>{stage.note}</span>
                  <span className={s.funnelCost}>{stage.cost}</span>
                </div>
              ))}
            </div>

            <p className={cx(s.body, s.paper)} style={{ marginTop: 26, fontWeight: 600 }}>
              {FUNNEL.moat}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── 6 · Acto III · La red ───────────────────────────────────────────────────

function ActThree() {
  return (
    <section className={s.section} data-act="acto-iii">
      <div className={s.inner}>
        <Reveal>
          <div className={cx(s.actCover, s.cornerWrap)}>
            <CornerMotif className={s.cornerTL} />
            <div style={{ position: "relative" }}>
              <p className={s.actKicker}>{ACT_III.coverKicker}</p>
              <h2 className={s.actTitle}>{ACT_III.coverTitle}</h2>
              <p className={s.actSub}>{ACT_III.coverSub}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <p className={s.eyebrow} style={{ marginTop: 34 }}>
            {ACT_III.familyTag}
          </p>
          <div className={s.grid3} style={{ marginTop: 14 }}>
            {ACT_III.siblings.map((sibling) => (
              <article key={sibling.id} className={s.sibling}>
                <i className={s.siblingBar} aria-hidden="true" />
                <h3 className={s.siblingName}>{sibling.name}</h3>
                <p className={s.siblingUnits}>
                  <Counter value={sibling.units} duration={1600} />
                </p>
                <p className={s.kpiLabel}>unidades declaradas</p>

                <dl className={s.defList}>
                  <div className={s.defRow}>
                    <dt className={s.defKey}>Bodega</dt>
                    <dd style={{ margin: 0 }}>{sibling.warehouse}</dd>
                  </div>
                  <div className={s.defRow}>
                    <dt className={s.defKey}>Teléfono</dt>
                    <dd style={{ margin: 0 }}>
                      {sibling.phone ? (
                        <span className={s.mono}>{sibling.phone}</span>
                      ) : (
                        <span className={s.dim}>En expediente</span>
                      )}
                    </dd>
                  </div>
                  <div className={s.defRow}>
                    <dt className={s.defKey}>Nota</dt>
                    <dd className={s.note} style={{ margin: 0 }}>
                      {sibling.phoneNote}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <p className={s.sumBar} style={{ marginLeft: "auto", marginRight: "auto", width: "fit-content" }}>
            <span className={s.dim}>Suma verificada</span>
            <span className={s.gold}>{ACT_III.sumLine}</span>
          </p>
        </Reveal>

        {/* ── Reveal Dropi ── */}
        <Reveal id="dropi" delay={80}>
          <div style={{ marginTop: "clamp(56px, 7vh, 96px)" }}>
            <Eyebrow tone="red">{DROPI.eyebrow}</Eyebrow>
            <h3 className={s.displaySm} style={{ marginTop: 12 }}>
              {DROPI.title}
            </h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {DROPI.body}
            </p>

            <div className={s.panelSplit} style={{ marginTop: 24 }}>
              <Evidence slug={DROPI.evidence} />

              <div>
                <div className={s.kpiRow} style={{ marginTop: 0 }}>
                  {DROPI.kpis.map((kpi) => (
                    <div key={kpi.label} className={s.kpi}>
                      <p className={s.kpiValue}>
                        <Counter value={kpi.value} suffix={kpi.suffix} duration={1900} />
                      </p>
                      <p className={s.kpiLabel}>{kpi.label}</p>
                    </div>
                  ))}
                  <div className={s.kpi}>
                    <p className={cx(s.kpiValue, s.gold)}>{DROPI.since.value}</p>
                    <p className={s.kpiLabel}>{DROPI.since.label}</p>
                  </div>
                </div>

                <p className={s.note} style={{ marginTop: 16 }}>
                  {DROPI.footnote}
                </p>

                <div style={{ marginTop: 18 }}>
                  <Evidence slug={DROPI.resellersEvidence} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Stocks ── */}
        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(52px, 7vh, 88px)" }}>
            <h3 className={s.displaySm}>{STOCKS.title}</h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {STOCKS.body}
            </p>

            <div className={s.stockRow}>
              {STOCKS.values.map((value) => (
                <span key={value} className={s.stockPill}>
                  {formatCo(value)}
                </span>
              ))}
              <span className={cx(s.chip, s.mono)}>{STOCKS.valuesLabel}</span>
            </div>

            <div className={s.priceRow}>
              <span>
                <span className={cx(s.priceValue, s.paper)}>{STOCKS.priceFrom.value}</span>
                <span className={s.kpiLabel}>{STOCKS.priceFrom.label}</span>
              </span>
              <span className={s.priceArrow} aria-hidden="true">
                →
              </span>
              <span>
                <span className={cx(s.priceValue, s.gold)}>{STOCKS.priceTo.value}</span>
                <span className={s.kpiLabel}>{STOCKS.priceTo.label}</span>
              </span>
              <span className={s.funnelNote} style={{ flexBasis: "100%" }}>
                {STOCKS.priceNote}
              </span>
            </div>

            <div style={{ marginTop: 22 }}>
              <Evidence slug={STOCKS.evidence} />
            </div>
          </div>
        </Reveal>

        {/* ── Punto de entrada ── */}
        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(52px, 7vh, 88px)" }}>
            <h3 className={s.displaySm}>{ENTRY_POINT.title}</h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {ENTRY_POINT.body}
            </p>

            <div className={s.panelSplit} style={{ marginTop: 22 }}>
              <Evidence slug={ENTRY_POINT.evidence} lead={ENTRY_POINT.badge} />
              <div className={cx(s.card, s.cardPad)}>
                <p className={s.eyebrow}>{ENTRY_POINT.crossLinksTitle}</p>
                <dl className={cx(s.defList, s.defListWide)} style={{ marginTop: 16 }}>
                  {ENTRY_POINT.crossLinks.map((link) => (
                    <div key={link.front} className={s.defRow}>
                      <dt className={s.defKey}>{link.front}</dt>
                      <dd style={{ margin: 0 }}>{link.detail}</dd>
                    </div>
                  ))}
                </dl>
                <p className={cx(s.body, s.paper)} style={{ marginTop: 18, fontWeight: 600 }}>
                  {ENTRY_POINT.note}
                </p>
              </div>
            </div>

            <div className={s.panelSplit} style={{ marginTop: 20 }}>
              <Evidence slug="fb-jlshoes-contacto" />
              <Evidence slug="dropi-leydi-card" />
            </div>
          </div>
        </Reveal>

        {/* ── Incautación ── */}
        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(52px, 7vh, 88px)" }}>
            <h3 className={s.displaySm}>{SEIZURE.title}</h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {SEIZURE.body}
            </p>
            <div style={{ marginTop: 22 }}>
              <Evidence slug={SEIZURE.evidence} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── 7 · Acto IV · La doctrina ───────────────────────────────────────────────

function ActFour() {
  const [windowRef, windowIn] = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <section className={s.section} data-act="acto-iv">
      <div className={s.inner}>
        <Reveal>
          <div className={cx(s.actCover, s.cornerWrap)}>
            <CornerMotif className={s.cornerTL} />
            <div style={{ position: "relative" }}>
              <p className={s.actKicker}>{ACT_IV.coverKicker}</p>
              <h2 className={s.actTitle}>{ACT_IV.coverTitle}</h2>
              <p className={s.actSub}>{ACT_IV.coverSub}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className={s.body} style={{ marginTop: 30 }}>
            {ACT_IV.body}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ marginTop: "clamp(40px, 5vh, 68px)" }}>
            <Eyebrow>{ACT_IV.chainOfCustody.title}</Eyebrow>
            <p className={s.displaySm} style={{ marginTop: 12 }}>
              {ACT_IV.chainOfCustody.note}
            </p>
            <div className={s.grid3} style={{ marginTop: 22 }}>
              {ACT_IV.chainOfCustody.items.map((item) => (
                <div key={item.name} className={cx(s.card, s.cardPad)}>
                  <p className={s.traitTitle}>{item.name}</p>
                  <p className={s.note} style={{ marginTop: 10 }}>
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ marginTop: "clamp(48px, 6vh, 84px)" }}>
            <h3 className={s.displaySm}>{ACT_IV.operation.title}</h3>
            <p className={s.note} style={{ marginTop: 10 }}>
              {ACT_IV.operation.note}
            </p>

            <div className={s.timeline}>
              {ACT_IV.operation.steps.map((step) => (
                <div
                  key={step.n}
                  className={cx(s.tlRow, step.status && s.tlDone)}
                >
                  <span className={s.tlNum}>{step.n}</span>
                  <span className={s.tlName}>{step.name}</span>
                  {step.status ? <span className={s.tlBadge}>{step.status}</span> : null}
                </div>
              ))}
            </div>

            <div className={s.grid3} style={{ marginTop: 22 }}>
              {ACT_IV.operation.roles.map((role) => (
                <div key={role.actor} className={cx(s.card, s.cardPad)}>
                  <p className={cx(s.eyebrow, s.eyebrowRed)}>{role.actor}</p>
                  <p className={s.body} style={{ marginTop: 10, fontSize: 15 }}>
                    {role.duties}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div ref={windowRef} style={{ marginTop: "clamp(52px, 7vh, 92px)" }}>
          <Eyebrow tone="red">{ACT_IV.window.title}</Eyebrow>
          <div className={s.windowLines}>
            {ACT_IV.window.lines.map((line, index) => (
              <p
                key={line}
                className={cx(s.windowLine, windowIn && s.windowLineOn)}
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
          <p className={s.alertBand}>
            <i className={s.alertMark} aria-hidden="true" />
            {ACT_IV.window.alert}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 8 · Desenlace ───────────────────────────────────────────────────────────

function Decisions() {
  return (
    <section className={s.section} data-act="desenlace">
      <div className={cx(s.inner, s.cornerWrap)}>
        <Reveal>
          <Eyebrow tone="red">{DECISIONS.eyebrow}</Eyebrow>
          <h2 className={s.display} style={{ marginTop: 14 }}>
            {DECISIONS.title}
          </h2>
          <p className={s.lead} style={{ marginTop: 16 }}>
            {DECISIONS.sub}
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className={s.grid2} style={{ marginTop: 36 }}>
            {DECISIONS.items.map((item) => (
              <article key={item.n} className={s.decision}>
                <p className={s.decisionNum}>{item.n}</p>
                <h3 className={s.decisionTitle}>{item.title}</h3>
                <p className={s.note} style={{ marginTop: 14 }}>
                  {item.note}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p className={s.oneLiner}>{DECISIONS.oneLiner}</p>
        </Reveal>

        <CornerMotif className={s.cornerBR} />
      </div>
    </section>
  );
}

// ── 9 · Epílogo · El programa ───────────────────────────────────────────────

function Program() {
  return (
    <section className={s.section} data-act="epilogo">
      <div className={s.inner}>
        <Reveal>
          <Eyebrow>{PROGRAM.eyebrow}</Eyebrow>
          <h2 className={s.display} style={{ marginTop: 14 }}>
            {PROGRAM.title}
          </h2>
          <p className={s.lead} style={{ marginTop: 16 }}>
            {PROGRAM.body}
          </p>
        </Reveal>

        <Reveal delay={130}>
          <div className={s.grid4} style={{ marginTop: 36 }}>
            {PROGRAM.phases.map((phase) => (
              <article key={phase.n} className={s.phase}>
                <p className={s.eyebrow}>{phase.n}</p>
                <h3 className={s.phaseName}>{phase.name}</h3>
                <p className={s.note}>{phase.note}</p>
                {phase.price ? (
                  <div className={s.phasePrice}>
                    {phase.price}
                    {phase.priceNote ? (
                      <span className={s.kpiLabel} style={{ display: "block" }}>
                        {phase.priceNote}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className={s.iacc}>
            <p className={s.iaccBadge}>{PROGRAM.iacc.badge}</p>
            <h3 className={s.displaySm} style={{ marginTop: 18 }}>
              {PROGRAM.iacc.title}
            </h3>
            <p className={s.body} style={{ marginTop: 14 }}>
              {PROGRAM.iacc.body}
            </p>
            <div className={s.chips} style={{ marginTop: 22 }}>
              {PROGRAM.iacc.advantages.map((advantage) => (
                <span key={advantage} className={s.chip}>
                  {advantage}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── 10 · Cierre ─────────────────────────────────────────────────────────────

function Closing() {
  return (
    <footer className={cx(s.closing, s.cornerWrap)} data-act="cierre">
      <CornerMotif className={s.cornerTL} />
      <Reveal>
        <p className={s.closingQuote}>{CLOSING.quote}</p>
        <p className={s.signature}>{CLOSING.signature}</p>
      </Reveal>
      <CornerMotif className={s.cornerBR} />
    </footer>
  );
}
