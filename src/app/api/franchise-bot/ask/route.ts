import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureFranchiseLandingConfig,
  scoreFaqMatch,
  tokenizeBotText,
} from "@/lib/franchiseLanding";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const franchiseId = typeof body.franchiseId === "string" ? body.franchiseId : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!franchiseId || !message) {
      return NextResponse.json(
        { error: "franchiseId y message son requeridos" },
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

    if (!franchise.featureFlags?.showBot || !franchise.botConfig?.enabled) {
      return NextResponse.json(
        {
          reply:
            franchise.botConfig?.fallbackMessage ||
            "Este asistente no esta habilitado para esta franquicia.",
          matchedFaqId: null,
          confidence: 0,
        },
        { status: 200 }
      );
    }

    const tokens = tokenizeBotText(message);
    const threshold = Math.max(12, Math.min(36, tokens.length * 8));

    let bestMatch:
      | {
          id: string;
          answer: string;
          score: number;
        }
      | undefined;

    for (const faq of franchise.botFaqs) {
      const score = scoreFaqMatch(message, faq.question, faq.answer, faq.priority);

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          id: faq.id,
          answer: faq.answer,
          score,
        };
      }
    }

    const matched = bestMatch && bestMatch.score >= threshold ? bestMatch : null;
    const confidence = matched
      ? Math.max(0.25, Math.min(0.98, matched.score / Math.max(threshold * 2, 1)))
      : 0;

    return NextResponse.json({
      reply: matched
        ? matched.answer
        : franchise.botConfig.fallbackMessage ||
          "No encontre una respuesta especifica. Deja tus datos y te ayudamos.",
      matchedFaqId: matched?.id || null,
      confidence,
    });
  } catch (error) {
    console.error("Error in franchise bot ask:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud" },
      { status: 500 }
    );
  }
}
