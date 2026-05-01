import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardsByPaper, getPapers } from "@/lib/cards";
import { CardSelfStudy } from "@/components/Card";

export function generateStaticParams() {
  return getPapers().map((p) => ({ code: p.code }));
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cards = getCardsByPaper(code);
  if (cards.length === 0) notFound();

  const c0 = cards[0];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link href="/" className="text-xs text-muted hover:text-accent">
          ← All papers
        </Link>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-primary">
          {c0.sessionLabel} · {c0.variantLabel}
        </h1>
        <div className="text-sm text-muted font-mono">{c0.paperCode}</div>
        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <a
            href={c0.sourceQpUrl}
            target="_blank"
            rel="noreferrer"
            className="underline text-accent hover:opacity-80"
          >
            QP PDF ↗
          </a>
          <a
            href={c0.sourceMsUrl}
            target="_blank"
            rel="noreferrer"
            className="underline text-accent hover:opacity-80"
          >
            MS PDF ↗
          </a>
        </div>
      </header>

      <div className="space-y-8">
        {cards.map((card) => (
          <CardSelfStudy key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
