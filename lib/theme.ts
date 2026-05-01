export type ThemeName = "dark" | "light";
export type PaletteName = "emerald" | "sapphire" | "aubergine" | "burgundy" | "slate";

export const DEFAULT_THEME: ThemeName = "light";
export const DEFAULT_PALETTE: PaletteName = "emerald";

export const THEME_KEY = "bio-flashcards-theme";
export const PALETTE_KEY = "bio-flashcards-palette";

export interface PaletteMeta {
  name: PaletteName;
  label: string;
  tagline: string;
  swatch: string;
  swatchAlt: string;
}

export const PALETTES: PaletteMeta[] = [
  { name: "emerald", label: "Emerald", tagline: "Forest & Brass", swatch: "#10b981", swatchAlt: "#fbbf24" },
  { name: "sapphire", label: "Sapphire", tagline: "Royal & Copper", swatch: "#3b82f6", swatchAlt: "#f59e0b" },
  { name: "aubergine", label: "Aubergine", tagline: "Violet & Rose", swatch: "#a855f7", swatchAlt: "#ec4899" },
  { name: "burgundy", label: "Burgundy", tagline: "Claret & Ink", swatch: "#dc2626", swatchAlt: "#a3b8d4" },
  { name: "slate", label: "Slate", tagline: "Mono & Ice", swatch: "#64748b", swatchAlt: "#06b6d4" },
];

export function isPalette(v: unknown): v is PaletteName {
  return typeof v === "string" && PALETTES.some((p) => p.name === v);
}

export function isTheme(v: unknown): v is ThemeName {
  return v === "dark" || v === "light";
}

export function readTheme(): ThemeName {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = window.localStorage.getItem(THEME_KEY);
  return isTheme(v) ? v : DEFAULT_THEME;
}

export function readPalette(): PaletteName {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  const v = window.localStorage.getItem(PALETTE_KEY);
  return isPalette(v) ? v : DEFAULT_PALETTE;
}

export function writeTheme(t: ThemeName) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute("data-theme", t);
}

export function writePalette(p: PaletteName) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PALETTE_KEY, p);
  document.documentElement.setAttribute("data-palette", p);
}

export const themeBootstrapScript = `
(function () {
  try {
    var t = localStorage.getItem("${THEME_KEY}");
    var p = localStorage.getItem("${PALETTE_KEY}");
    if (t !== "dark" && t !== "light") t = "${DEFAULT_THEME}";
    var allowedPalettes = ["emerald","sapphire","aubergine","burgundy","slate"];
    if (allowedPalettes.indexOf(p) === -1) p = "${DEFAULT_PALETTE}";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-palette", p);
  } catch (e) {}
})();
`;
