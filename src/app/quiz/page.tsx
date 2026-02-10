import { Suspense } from "react";
import { ChatbotContainer } from "@/components/chatbot/ChatbotContainer";

export const metadata = {
  title: "Quiz - Franquicias LATAM",
  description: "Encuentra la franquicia ideal para ti en Latinoamerica",
};

export default function QuizPage() {
  return (
    <Suspense>
      <ChatbotContainer />
    </Suspense>
  );
}
