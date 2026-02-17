"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useChatbot } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import type { ChatStep } from "@/types";
import { ChatShell } from "./ChatShell";
import { ChatHeader } from "./ChatHeader";
import { BackButton } from "./BackButton";
import { ChatTranscript } from "./ChatTranscript";
import { ChatComposer } from "./ChatComposer";
import { ChatProgress } from "./ChatProgress";
import { SectorStep } from "./steps/SectorStep";
import { InvestmentStep } from "./steps/InvestmentStep";
import { CountryStep } from "./steps/CountryStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { ContactStep } from "./steps/ContactStep";
import { VerificationStep } from "./steps/VerificationStep";

const COMPOSER_ENABLED_STEPS: ChatStep[] = [];

export function ChatbotContainer() {
  const searchParams = useSearchParams();

  const initialSectors = useMemo(() => {
    const ids = searchParams.get("sectors");
    const names = searchParams.get("sectorNames");
    if (ids && names) {
      return { ids: ids.split(","), names: names.split(",") };
    }
    return undefined;
  }, [searchParams]);

  const {
    state,
    selectSectors,
    selectInvestment,
    selectCountry,
    selectExperience,
    submitContact,
    verifyCode,
    goBack,
  } = useChatbot({ initialSectors });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    // Small delay to let messages render before scrolling
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [state.messages.length, state.currentStep, scrollToBottom]);

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case "sector":
        return <SectorStep onSelect={selectSectors} />;
      case "investment":
        return <InvestmentStep onSelect={selectInvestment} />;
      case "country":
        return <CountryStep onSelect={selectCountry} />;
      case "experience":
        return <ExperienceStep onSelect={selectExperience} />;
      case "contact":
        return (
          <ContactStep
            countryId={state.answers.countryId}
            onSubmit={submitContact}
            isLoading={state.isLoading}
          />
        );
      case "verification":
        return (
          <VerificationStep
            onVerify={verifyCode}
            isLoading={state.isLoading}
            error={state.error}
            phone={state.answers.phone}
          />
        );
      default:
        return null;
    }
  };

  const canGoBack = state.stepHistory.length > 1 && state.currentStep !== "verification" && state.currentStep !== "results";
  const showProgress = state.currentStep !== "sector" && state.currentStep !== "results";
  const showFullHeader = state.currentStep === "sector" || state.currentStep === "welcome";
  const showComposer = COMPOSER_ENABLED_STEPS.includes(state.currentStep);

  return (
    <ChatShell>
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white overflow-hidden">
        <div
          className={cn(
            "transition-all duration-[260ms] ease-out",
            showFullHeader
              ? "max-h-56 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <ChatHeader />
        </div>
        <div
          className={cn(
            "transition-all duration-[260ms] ease-out",
            showFullHeader
              ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
              : "max-h-16 opacity-100 translate-y-0"
          )}
        >
          <ChatHeader compact />
        </div>
      </div>

      {/* Back Button */}
      <BackButton onBack={goBack} disabled={!canGoBack} />

      {/* Progress Bar */}
      {showProgress && <ChatProgress currentStep={state.currentStep} />}

      {/* Chat Transcript */}
      <ChatTranscript ref={scrollAreaRef} messages={state.messages}>
        {state.isLoading && state.currentStep !== "verification" && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </ChatTranscript>

      {/* Step Input Area */}
      <div className="border-t border-neutral-200 bg-white transition-all duration-200 ease-out">
        {renderCurrentStep()}
      </div>

      {/* Chat Composer (only for future free-text steps) */}
      {showComposer && <ChatComposer />}
    </ChatShell>
  );
}
