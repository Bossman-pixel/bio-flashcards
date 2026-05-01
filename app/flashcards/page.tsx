import { getAllCards } from "@/lib/cards";
import { FlashcardsClient } from "./FlashcardsClient";

export const metadata = {
  title: "Flashcards · Bio 9700",
  description: "Quizlet-style flip-card revision for CIE 9700 Section B essays.",
};

export default function FlashcardsPage() {
  const cards = getAllCards();
  return <FlashcardsClient cards={cards} />;
}
