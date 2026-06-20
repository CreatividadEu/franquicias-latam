import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ChatbotContainer } from "@/components/chatbot/ChatbotContainer";

export const metadata = {
  title: "Quiz - Franquicias LATAM",
  description: "Encuentra la franquicia ideal para ti en Latinoamerica",
};

// Sectors are loaded from the database, so render at request time rather than
// prerendering at build (which would require DATABASE_URL during the build).
export const dynamic = "force-dynamic";

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
