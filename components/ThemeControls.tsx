"use client";
import { useEffect, useRef, useState } from "react";
import {
  PALETTES,
  readPalette,
  readTheme,
  writePalette,
  writeTheme,
  type PaletteName,
  type ThemeName,
} from "@/lib/theme";

export function ThemeControls() {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [palette, setPalette] = useState<PaletteName>("emerald");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTheme(readTheme());
    setPalette(readPalette());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!paletteOpen) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPaletteOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [paletteOpen]);

  if (!mounted) return null;

  function toggleTheme() {
    const next: ThemeName = theme === "dark" ? "light" : "dark";
    setTheme(next);
    writeTheme(next);
  }

  function pick(p: PaletteName) {
    setPalette(p);
    writePalette(p);
    setPaletteOpen(false);
  }

  return (
    <div ref={rootRef} className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 items-start">
      {paletteOpen && (
        <div
          role="menu"
          aria-label="Colour palette"
          className="rounded-xl border border-token glass shadow-elev overflow-hidden w-[260px] animate-fade-up"
        >
          <div className="px-3 py-2 border-b border-subtle flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-dim">Palette</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-accent">Free</span>
          </div>
          <ul className="py-1">
            {PALETTES.map((p) => {
              const active = p.name === palette;
              return (
                <li key={p.name}>
                  <button
                    type="button"
                    onClick={() => pick(p.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                      active ? "bg-accent-dim" : "hover:bg-elev"
                    }`}
                  >
                    <span className="relative flex items-center shrink-0">
                      <span
                        className="w-5 h-5 rounded-full border border-subtle"
                        style={{ backgroundColor: p.swatch }}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-subtle -ml-2"
                        style={{ backgroundColor: p.swatchAlt }}
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm leading-tight ${active ? "text-accent font-medium" : "text-primary"}`}>
                        {p.label}
                      </span>
                      <span className="block text-[11px] text-muted italic leading-tight mt-0.5">
                        {p.tagline}
                      </span>
                    </span>
                    {active && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-token shadow-card hover:border-accent transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-accent">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="text-accent">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setPaletteOpen((v) => !v)}
          aria-label="Change colour palette"
          aria-expanded={paletteOpen}
          aria-haspopup="menu"
          title="Palette"
          className="flex items-center justify-center w-11 h-11 rounded-full shadow-card hover:opacity-90 transition-opacity cursor-pointer"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-accent-fg)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 9 9c0 1.657-1.343 3-3 3h-1.5a1.5 1.5 0 0 0-1.06 2.56 1.5 1.5 0 0 1-1.06 2.56H12z" />
            <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
            <circle cx="12" cy="7" r="1" fill="currentColor" />
            <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
