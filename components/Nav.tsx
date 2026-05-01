import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-subtle backdrop-blur-md bg-[color-mix(in_srgb,var(--color-bg)_80%,transparent)]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-accent group">
          <span className="text-xl group-hover:rotate-12 transition-transform">🧬</span>
          <span className="hidden sm:inline">Bio 9700</span>
          <span className="text-muted text-sm hidden md:inline">· Section B</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 text-sm">
          <NavLink href="/flashcards" label="Flashcards" />
          <NavLink href="/study" label="Study" primary />
          <NavLink href="/browse" label="Browse" />
          <NavLink href="/dashboard" label="Dashboard" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  if (primary) {
    return (
      <Link
        href={href}
        className="px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-fg)" }}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link href={href} className="px-3 py-1.5 rounded-lg text-secondary hover:text-accent hover:bg-elev transition-colors">
      {label}
    </Link>
  );
}
