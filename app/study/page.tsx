import { getAllCards } from "@/lib/cards";
import { StudyClient } from "./StudyClient";

export default function StudyPage() {
  const cards = getAllCards();
  return <StudyClient cards={cards} />;
}
