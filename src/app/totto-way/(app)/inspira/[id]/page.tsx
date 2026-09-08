import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Music } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getInspireItem } from "@/lib/totto-way/queries";
import { Chip } from "../../../_components/atoms";
import { ConsumeInspireButton } from "../../../_components/ConsumeInspireButton";

export const metadata: Metadata = { title: "Inspira" };
export const dynamic = "force-dynamic";

export default async function InspireItemPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireTwSession();
  const view = await getInspireItem(session, (await params).id);
  if (!view) notFound();

  const t = createTranslator(session.locale);
  const { item } = view;

  return (
    <div className="tw-lesson">
      <Link href={NAV_HREF.inspire} className="tw-back">
        <ArrowLeft strokeWidth={1.8} />
        {t("inspire.back")}
      </Link>

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Chip tone="red">{t(`inspireTypes.${item.type}` as TwMessageKey)}</Chip>
          <span className="tw-small tw-muted">{t("inspire.minutes", { n: item.lengthMin })}</span>
        </div>
        <h1 className="tw-title-md">{item.title}</h1>
        <p className="tw-muted">{item.who}</p>
      </div>

      {item.mediaUrl ? (
        <audio controls src={item.mediaUrl} style={{ width: "100%", marginBottom: 18 }}>
          <track kind="captions" />
        </audio>
      ) : item.externalUrl ? null : (
        <div className="tw-card tw-card--flat" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <span className="tw-icon-tile tw-icon-tile--yellow">
            <Music strokeWidth={1.8} />
          </span>
          <span className="tw-small tw-muted">{t("inspire.mediaMissing")}</span>
        </div>
      )}

      <article className="tw-lesson__body">
        <p>{item.desc}</p>
        {item.quote ? (
          <div className="tw-card tw-card--yellow">
            <p className="tw-quote">“{item.quote}”</p>
          </div>
        ) : null}
        {item.externalUrl ? (
          <a className="tw-btn tw-btn--outline tw-btn--sm" href={item.externalUrl} target="_blank" rel="noreferrer" style={{ justifySelf: "start" }}>
            <ExternalLink strokeWidth={1.8} />
            {t("inspire.openExternal")}
          </a>
        ) : null}
      </article>

      {view.gamification ? (
        <div style={{ marginTop: 18 }}>
          <ConsumeInspireButton
            itemId={item.id}
            claimed={view.claimedToday}
            labels={{ mark: t("inspire.mark"), marked: t("inspire.marked"), working: t("common.loading") }}
          />
        </div>
      ) : null}
    </div>
  );
}
