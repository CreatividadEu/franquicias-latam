import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { TW_HOME_PATH } from "@/lib/totto-way/paths";
import { XP_RULES } from "@/lib/totto-way/xp";
import { OnboardingSteps } from "../_components/OnboardingSteps";
import { completeOnboarding } from "./actions";

export const metadata: Metadata = { title: "Bienvenida" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await requireTwSession({ allowOnboarding: true });
  if (!session.needsOnboarding) redirect(TW_HOME_PATH);
  const t = createTranslator(session.locale);

  return (
    <main className="tw-onboarding">
      <OnboardingSteps
        onFinish={completeOnboarding}
        copy={{
          eyebrows: [1, 2, 3].map((step) => t("onboarding.eyebrow", { step })),
          steps: [
            { title: t("onboarding.step1Title"), body: t("onboarding.step1Body") },
            { title: t("onboarding.step2Title"), body: t("onboarding.step2Body") },
            { title: t("onboarding.step3Title"), body: t("onboarding.step3Body") },
          ],
          xpRows: [
            { label: t("onboarding.step2Lesson"), xp: "+50–120 XP" },
            { label: t("onboarding.step2Quiz"), xp: `+${XP_RULES.QUIZ_PERFECT} XP` },
            { label: t("onboarding.step2Checkpoint"), xp: `+${XP_RULES.CHECKPOINT} XP` },
            { label: t("onboarding.step2Attendance"), xp: `+${XP_RULES.ATTENDANCE} XP` },
          ],
          next: t("common.next"),
          finish: t("onboarding.finish"),
          skip: t("onboarding.skip"),
        }}
      />
    </main>
  );
}
