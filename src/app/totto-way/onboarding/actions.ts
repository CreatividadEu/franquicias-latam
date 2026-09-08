"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { TW_LEARN_PATH, TW_LOGIN_PATH } from "@/lib/totto-way/paths";

/** Marca el onboarding como visto y lleva a la primera lección. */
export async function completeOnboarding() {
  const session = await getTwSessionOrNull();
  if (!session) redirect(TW_LOGIN_PATH);
  if (session.employee && !session.employee.onboardedAt) {
    await prisma.twEmployee.update({
      where: { id: session.employee.id },
      data: { onboardedAt: new Date() },
    });
  }
  redirect(TW_LEARN_PATH);
}
