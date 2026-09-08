"use client";

import { usePathname } from "next/navigation";
import { Flame, Sparkles } from "lucide-react";
import { pickHeaderTitle, type HeaderTitle } from "@/lib/totto-way/nav";
import { useAssistant } from "./AssistantPanel";

export function TwHeader({
  titles,
  streakLabel,
  xpLabel,
  assistantLabel,
  showGamification,
}: {
  titles: HeaderTitle[];
  streakLabel: string | null;
  xpLabel: string | null;
  assistantLabel: string;
  showGamification: boolean;
}) {
  const pathname = usePathname();
  const { open } = useAssistant();
  const title = pickHeaderTitle(pathname, titles) ?? titles[0];
  return (
    <header className="tw-header">
      <div className="tw-header__titles">
        <span className="tw-eyebrow">{title.eyebrow}</span>
        <span className="tw-header__title">{title.title}</span>
      </div>
      <div className="tw-header__meta">
        {showGamification && streakLabel ? (
          <span className="tw-pill tw-pill--yellow" data-hide-mobile>
            <Flame strokeWidth={1.8} />
            {streakLabel}
          </span>
        ) : null}
        {showGamification && xpLabel ? <span className="tw-pill tw-pill--black">{xpLabel}</span> : null}
        <button
          type="button"
          className="tw-pill tw-pill--outline tw-header__assistant"
          onClick={() => open()}
          title={assistantLabel}
          aria-label={assistantLabel}
        >
          <Sparkles strokeWidth={1.8} />
          <span data-hide-mobile>{assistantLabel}</span>
          <span className="tw-header__dot" aria-hidden />
        </button>
      </div>
    </header>
  );
}
