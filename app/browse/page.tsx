import { getAllCards, getAllTopics } from "@/lib/cards";
import { BrowseClient } from "./BrowseClient";

export default function BrowsePage() {
  const cards = getAllCards();
  const topics = getAllTopics();
  return <BrowseClient cards={cards} topics={topics} />;
}
