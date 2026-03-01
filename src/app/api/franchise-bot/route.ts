import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureFranchiseLandingConfig } from "@/lib/franchiseLanding";

export async function GET(request: NextRequest) {
  const franchiseId = request.nextUrl.searchParams.get("franchiseId");

  if (!franchiseId) {
    return NextResponse.json(
      { error: "franchiseId es requerido" },
      { status: 400 }
    );
  }

  const franchise = await prisma.franchise.findUnique({
    where: { id: franchiseId },
    include: {
      featureFlags: true,
      botConfig: true,
      botFaqs: {
        where: { enabled: true },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!franchise) {
    return NextResponse.json(
      { error: "Franquicia no encontrada" },
      { status: 404 }
    );
  }

  await ensureFranchiseLandingConfig({
    id: franchise.id,
    name: franchise.name,
    description: franchise.description,
    logo: franchise.logo,
    video: franchise.video,
    investmentMin: franchise.investmentMin,
    investmentMax: franchise.investmentMax,
  });

  const enabled = Boolean(franchise.featureFlags?.showBot && franchise.botConfig?.enabled);

  return NextResponse.json({
    enabled,
    fallbackMessage: franchise.botConfig?.fallbackMessage || "",
    tone: franchise.botConfig?.tone || "consultivo",
    suggestedQuestions: enabled
      ? franchise.botFaqs.slice(0, 3).map((faq) => faq.question)
      : [],
  });
}
