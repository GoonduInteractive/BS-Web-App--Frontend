import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailBody } from "@/components/characters/DetailBody";
import { DetailHero } from "@/components/characters/DetailHero";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getAdjacentCharacters, getCharacter, getCharacterSlugs, getOtherCharacters } from "@/lib/api/characters";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * One character's detail page. Figma:
 * `context/design/04-characters/character-detail.png` - Soma's, at 1440 x 5040.
 *
 * Three sections, as the frame lays them out: the hero on its own radial field,
 * the detail body on the roster's gradient, and the site footer.
 *
 * NOT BEHIND A GATE. Every other route on this site is one of the four gates and
 * goes through `GatePage`; this one is reached from inside The Characters, so it
 * is a plain page. That is also why it is the only route that carries a footer -
 * see SiteFooter for why one under the gate sequence would be wrong.
 *
 * FULLY STATIC. `generateStaticParams` enumerates every locale and every
 * character the editor has switched on, so each page is prerendered at build
 * time, per the static-generation rule; a character switched off has no page.
 *
 * THE COPY IS THE CMS'S (2026-09-22): what the content team writes in
 * `src/content/characters/`, from Goondu's character bible.
 */
export function generateStaticParams() {
  const slugs = getCharacterSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const character = await getCharacter(locale, slug).catch(() => null);
  if (!character) return {};

  return pageMetadata({
    locale,
    path: `/characters/${character.slug}`,
    title: `${character.name} | Beyond Service: Trial of the Gods`,
    // The first line of the intro is the tightest summary the copy has; the
    // lore stands in for a character whose intro is still to come.
    description: character.intro[0] ?? character.lore[0] ?? character.name,
    // The character's own render as the card, not the key art.
    image: character.image,
    imageAlt: character.name,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const character = await getCharacter(locale, slug).catch(() => null);
  if (!character) notFound();

  const messages = getMessages(locale);
  const others = await getOtherCharacters(locale, slug);
  const adjacent = await getAdjacentCharacters(locale, slug);
  const link = (c: { name: string; slug: string }) => ({ name: c.name, href: `/${locale}/characters/${c.slug}` });

  return (
    <main>
      <DetailHero
        character={character}
        messages={messages}
        backHref={`/${locale}/characters`}
        adjacent={adjacent ? { prev: link(adjacent.prev), next: link(adjacent.next) } : null}
      />
      <DetailBody
        character={character}
        others={others}
        messages={messages}
        locale={locale}
      />
      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
