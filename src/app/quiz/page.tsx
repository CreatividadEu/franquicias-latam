import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ChatbotContainer } from "@/components/chatbot/ChatbotContainer";

// Hits the DB at request time — can't be statically prerendered.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quiz - Franquicias LATAM",
  description: "Encuentra la franquicia ideal para ti en Latinoamerica",
};

export default async function QuizPage() {
  const sectors = await prisma.sector.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, emoji: true },
  });

  return (
    <Suspense>
      <ChatbotContainer preloadedSectors={sectors} />
    </Suspense>
  );
}
