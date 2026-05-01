import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bio 9700 — Section B Essay Flashcards",
  description:
    "Cambridge International A Level Biology (9700) Paper 4 Section B essay questions and mark schemes from 2019–2021, verbatim, with spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <Nav />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-6 pb-24">
          {children}
        </main>
        <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
          Built for Kayaan · Verbatim from CAIE 9700 P4 PDFs · For revision use only
        </footer>
      </body>
    </html>
  );
}
