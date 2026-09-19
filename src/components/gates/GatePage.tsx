import { notFound } from "next/navigation";

import { GateSection } from "@/components/gates/GateSection";
import { gateHref, getGate, nextGate, type Gate, type GateId } from "@/lib/gates";
import { isLocale, type Locale } from "@/lib/utils/locales";
import { getMessages, type Messages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * Shared body of the four gate routes: the PAGE behind a gate, rendered as a
 * page.
 *
 * The gate itself is not here. Per the human (2026-09-14) the doors stand on
 * the home route — `/en` is the portal, see `GatePortal` and `GateEntry` — and a
 * gate route is the page its CTA opens onto, so a shared link lands on the
 * page and a crawler reads it without a click. Each `page.tsx` stays a thin
 * Server Component that names its gate and passes its sections.
 */
export async function GatePage({
  id,
  params,
  children,
}: {
  id: GateId;
  params: Promise<{ locale: string }>;
  /** The page's sections, plainly. */
  children?: React.ReactNode;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main data-gate={getGate(id).slug}>{children}</main>;
}

/**
 * The gate hero as a standalone element, for the pull-up's preview panel.
 *
 * THE POINT IS THAT IT IS THE SAME COMPONENT, built from the same manifest and
 * the same messages as the portal paints. The pull-up's swap is invisible only
 * if what rises is pixel-identical to what the home route then shows, and the
 * reliable way to guarantee that is to render the thing itself rather than
 * reproduce it. If `GateSection` changes, both change together.
 */
export function gatePreview(gate: Gate, locale: Locale, messages: Messages) {
  const copy = messages.gates[gate.id];
  const after = nextGate(gate);
  return (
    <GateSection
      gate={gate}
      chip={copy.chip}
      title={copy.title}
      cta={copy.cta}
      href={gateHref(locale, gate)}
      plateAlt={copy.plateAlt}
      characterAlt={messages.gates.characterAlt}
      next={after.id}
      cueLabel={messages.gates.cue[after.id]}
    />
  );
}

/**
 * Per-route, per-locale metadata for the four gate pages, through
 * `pageMetadata` so each carries its canonical, its language alternates and
 * its cards. The description is the page's own opening copy — the Game hero's
 * body, the Characters hero's aside, the Competition hero's pitch — rather
 * than the plate's alt text, which described a picture, not a page. Community
 * has no page copy yet (no design), so it takes the site's description.
 */
export async function gateMetadata(id: GateId, params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale);
  const copy = messages.gates[id];
  const description: Record<GateId, string> = {
    theGame: messages.theGame.hero.body,
    characters: messages.characters.hero.aside,
    community: messages.site.description,
    competition: messages.competition.hero.body.split("\n").slice(0, 2).join(" "),
  };
  return pageMetadata({
    locale,
    path: `/${getGate(id).slug}`,
    title: `${copy.title} | Beyond Service: Trial of the Gods`,
    description: description[id],
  });
}
