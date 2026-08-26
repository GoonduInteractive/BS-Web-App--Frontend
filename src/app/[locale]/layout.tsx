import type { Metadata } from "next";
import { Host_Grotesk, Teko } from "next/font/google";
import { notFound } from "next/navigation";

import { isLocale, LOCALES } from "@/lib/utils/locales";
import "../globals.css";

/**
 * Display face — headings, gate titles, section titles, menu links, buttons.
 * Teko ships weights 300-700 only: the Figma sheet's "Heavy" maps to 700 and
 * "Roman" maps to 400 (overview section 8, open question 2).
 */
const teko = Teko({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});

/**
 * Body face — body copy, and the NNOO / WELCOME entry choice per Figma.
 * Variable 300-800 with a true italic, so no weight array is needed.
 */
const hostGrotesk = Host_Grotesk({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-host-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beyond Service: Trial of the Gods",
  description: "The official site for Beyond Service: Trial of the Gods, by Goondu Games Studio.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${teko.variable} ${hostGrotesk.variable}`}>
      {/* SiteHeader, MenuOverlay, SoundToggle and TransitionProvider mount here in chunk 1. */}
      <body>{children}</body>
    </html>
  );
}
