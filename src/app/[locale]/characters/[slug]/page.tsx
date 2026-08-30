import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailBody } from "@/components/characters/DetailBody";
import { DetailHero } from "@/components/characters/DetailHero";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * One character's detail page. Figma:
 * `context/design/04-characters/character-detail.png` — Soma's, at 1440 x 5040.
 *
 * Three sections, as the frame lays them out: the hero on its own radial field,
 * the detail body on the roster's gradient, and the site footer.
 *
 * NOT BEHIND A GATE. Every other route on this site is one of the four gates and
 * goes through `GatePage`; this one is reached from inside The Characters, so it
 * is a plain page. That is also why it is the only route that carries a footer —
 * see SiteFooter for why one under the gate sequence would be wrong.
 *
 * FULLY STATIC. `generateStaticParams` enumerates every locale and slug, so all
 * eighteen pages are prerendered at build time, per the static-generation rule.
 *
 * FLAGGED: only Soma's copy is real, transcribed from the frame. The other
 * eight carry dummy lore, abilities, variants and stats written to fit each
 * character at the human's explicit instruction, and every one of them reuses
 * its own portrait for the ability tiles and gallery because no action art was
 * delivered. Both are expected to be replaced.
 */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    CHARACTERS.map((character) => ({ locale, slug: character.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const character = getCharacter(slug);
  if (!character) return {};

  const cast = getMessages(locale).characters.roster.cast[character.castKey];
  return {
    title: `${cast.name} | Beyond Service: Trial of the Gods`,
    // The first line of the intro is the tightest summary the copy has.
    description: cast.detail.intro[0],
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const character = getCharacter(slug);
  if (!character) notFound();

  const messages = getMessages(locale);

  return (
    <main>
      <DetailHero
        character={character}
        messages={messages}
        backHref={`/${locale}/characters`}
      />
      <DetailBody
        character={character}
        messages={messages}
        locale={locale}
      />
      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
