import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-300">
          <span>🧬</span>
          <span>Bio 9700 · Section B</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link
            href="/study"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold"
          >
            Study
          </Link>
          <Link href="/browse" className="text-zinc-300 hover:text-emerald-300">
            Browse
          </Link>
        </div>
      </div>
    </nav>
  );
}
