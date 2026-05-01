import { getAllCards } from "@/lib/cards";
import { DashboardClient } from "./DashboardClient";

export const metadata = {
  title: "Dashboard · Bio 9700",
  description: "Track revision progress, accuracy by topic, streaks, and review history.",
};

export default function DashboardPage() {
  const cards = getAllCards();
  // strip raw text for client weight
  const slim = cards.map((c) => ({
    id: c.id,
    topics: c.topics ?? [],
    year: c.year,
    session: c.session,
    variant: c.variant,
    sessionLabel: c.sessionLabel,
    questionNumber: c.questionNumber,
  }));
  return <DashboardClient cards={slim} totalCards={cards.length} />;
}
