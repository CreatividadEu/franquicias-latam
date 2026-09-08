import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Headphones, MessageSquare, Play, ScrollText, Video } from "lucide-react";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator, type TwMessageKey } from "@/lib/totto-way/i18n";
import { NAV_HREF } from "@/lib/totto-way/nav";
import { getInspireView } from "@/lib/totto-way/queries";
import { XP_RULES } from "@/lib/totto-way/xp";
import { Chip, Eyebrow, Placeholder } from "../../_components/atoms";

export const metadata: Metadata = { title: "Inspira" };
export const dynamic = "force-dynamic";

const TYPE_ICON = { PODCAST: Headphones, ARTICLE: ScrollText, VIDEO: Video, MESSAGE: MessageSquare, STORY: ScrollText } as const;

export default async function InspirePage() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  const view = await getInspireView(session);

  if (view.items.length === 0) return <Placeholder title={t("inspire.title")} body={t("inspire.empty")} />;

  const rest = view.items.filter((item) => item.id !== view.featured?.id);

  return (
    <>
      <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
        <Eyebrow>{t("inspire.eyebrow")}</Eyebrow>
        <h1 className="tw-title-lg">{t("inspire.title")}</h1>
        {view.gamification ? <p className="tw-small tw-muted">{t("inspire.reward", { n: XP_RULES.INSPIRE })}</p> : null}
      </div>

      {view.featured ? (
        <Link href={`${NAV_HREF.inspire}/${view.featured.id}`} className="tw-inspire-hero">
          <Image src="/totto-way/photo-vision.png" alt="" fill sizes="100vw" className="tw-inspire-hero__photo" />
          <div className="tw-inspire-hero__body">
            <Chip tone="red">{t(`inspireTypes.${view.featured.type}` as TwMessageKey)}</Chip>
            <h2 className="tw-title-md" style={{ color: "#fff" }}>
              {view.featured.title}
            </h2>
            <p className="tw-small tw-muted">
              {view.featured.who} · {t("inspire.minutes", { n: view.featured.lengthMin })}
            </p>
            <span className="tw-inspire-hero__play" aria-hidden>
              <Play strokeWidth={1.8} fill="currentColor" />
            </span>
          </div>
          {view.featured.quote ? <p className="tw-inspire-hero__quote">“{view.featured.quote}”</p> : null}
        </Link>
      ) : null}

      <div className="tw-inspire-grid">
        {rest.map((item) => {
          const Icon = TYPE_ICON[item.type];
          const external = !!item.externalUrl;
          return (
            <Link key={item.id} href={`${NAV_HREF.inspire}/${item.id}`} className="tw-inspire-card">
              <div className="tw-inspire-card__top">
                <span className="tw-icon-tile">
                  <Icon strokeWidth={1.8} />
                </span>
                <Eyebrow tone="muted">
                  {t(`inspireTypes.${item.type}` as TwMessageKey)} · {t("inspire.minutes", { n: item.lengthMin })}
                </Eyebrow>
              </div>
              <h3 className="tw-title-sm">{item.title}</h3>
              <p className="tw-small tw-muted">{item.who}</p>
              <p className="tw-small">{item.desc}</p>
              {external ? (
                <span className="tw-small tw-link" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <ExternalLink size={13} strokeWidth={1.8} />
                  {t("inspire.openExternal")}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}
