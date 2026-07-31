/**
 * Átomos compartidos del Command Center. Sin estado y sin "use client": los
 * usan tanto los componentes de servidor como los islotes cliente.
 */
import type { SajuInterest, SajuLeadType, SajuStage } from "@prisma/client";
import {
  INTEREST_COLOR,
  INTEREST_LABEL,
  STAGE_COLOR,
  STAGE_LABEL,
  TYPE_LABEL,
  countryMeta,
} from "@/lib/saju/command-center";

export function StageChip({ stage, short }: { stage: SajuStage; short?: string }) {
  const color = STAGE_COLOR[stage];
  return (
    <span
      className="cc-chip cc-chip--stage"
      style={{ background: color.bg, color: color.fg }}
    >
      {short ?? STAGE_LABEL[stage]}
    </span>
  );
}

export function TypeChip({ type }: { type: SajuLeadType }) {
  return <span className="cc-chip">{TYPE_LABEL[type]}</span>;
}

export function InterestDot({ interest }: { interest: SajuInterest }) {
  return (
    <span
      className="cc-dot"
      style={{ background: INTEREST_COLOR[interest] }}
      title={INTEREST_LABEL[interest]}
      aria-label={INTEREST_LABEL[interest]}
      role="img"
    />
  );
}

export function CountryTag({ code, withName }: { code: string; withName?: boolean }) {
  const meta = countryMeta(code);
  return (
    <span className="cc-chip" style={{ borderColor: "transparent", paddingLeft: 0 }}>
      <span aria-hidden="true">{meta.flag}</span>
      <span>{withName ? meta.name : meta.code}</span>
    </span>
  );
}

export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="cc-section" aria-labelledby={`${id}-title`}>
      <div className="cc-section__head">
        <h2 id={`${id}-title`} className="cc-section__title">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Skeleton({ height, width }: { height: number; width?: number | string }) {
  return <div className="cc-skel" style={{ height, width: width ?? "100%" }} aria-hidden="true" />;
}
