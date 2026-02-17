"use client";

import { useEffect } from "react";
import type { MatchedFranchise } from "@/types";
import { ResultsStep } from "@/components/chatbot/steps/ResultsStep";

interface ResultsPageContentProps {
  results: MatchedFranchise[];
  resultsUrl: string;
}

const SCROLL_KEY_PREFIX = "results-scroll:";

export function ResultsPageContent({ results, resultsUrl }: ResultsPageContentProps) {
  useEffect(() => {
    const scrollKey = `${SCROLL_KEY_PREFIX}${resultsUrl}`;
    const savedScrollY = window.sessionStorage.getItem(scrollKey);

    if (savedScrollY) {
      const parsed = Number(savedScrollY);
      if (Number.isFinite(parsed)) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parsed);
        });
      }
    }

    const persistScroll = () => {
      window.sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener("scroll", persistScroll, { passive: true });
    window.addEventListener("pagehide", persistScroll);

    return () => {
      persistScroll();
      window.removeEventListener("scroll", persistScroll);
      window.removeEventListener("pagehide", persistScroll);
    };
  }, [resultsUrl]);

  return <ResultsStep results={results} backToResultsUrl={resultsUrl} />;
}
