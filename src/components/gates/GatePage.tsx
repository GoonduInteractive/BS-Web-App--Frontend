import { notFound } from "next/navigation";

import { GateSection } from "@/components/gates/GateSection";
import { GateView } from "@/components/gates/GateView";
import { gateHref, getGate, nextGate, type Gate, type GateId } from "@/lib/gates";
import { isLocale, type Locale } from "@/lib/utils/locales";
import { getMessages, type Messages } from "@/lib/utils/messages";

/**
 * Shared body of the four gate routes.
 *
 * Each `page.tsx` stays a thin Server Component that names its gate and nothing
 * else, so the four routes cannot drift apart. Everything variable — plate, chip
 * label, title, CTA, Ken Burns origin, and which gate the cue points at — is
 * read from the manifest in `src/lib/gates.ts`.
 */
export async function GatePage({
  id,
  params,
  children,
}: {
  id: GateId;
  params: Promise<{ locale: string }>;
  /**
   * The page BEHIND this gate — not sections below it.
   *
   * The gate and its page are two faces of one route and only one is ever in
   * the document; `GateView` swaps them. Pass the sections plainly, it does the
   * wrapping. A gate given no children is a gate with nothing behind it yet,
   * and its CTA stays inert.
   */
  children?: React.ReactNode;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const gate = getGate(id);
  const next = nextGate(gate);
  const copy = messages.gates[gate.id];

  return (
    <main>
      <GateView
        gate={
          <GateSection
            gate={gate}
            chip={copy.chip}
            title={copy.title}
            cta={copy.cta}
            plateAlt={copy.plateAlt}
            characterAlt={messages.gates.characterAlt}
            // The cue names its DESTINATION, so it is keyed on the next gate.
            // Gate 4 wraps back to gate 1 — the competition frame's cue reads
            // DISCOVER THE GAME, so the sequence is a loop, not a dead end.
            cueHref={gateHref(locale, next)}
            cueLabel={messages.gates.cue[next.id]}
          />
        }
      >
        {children}
      </GateView>
    </main>
  );
}

/**
 * The gate hero as a standalone element, for the pull-up's preview panel.
 *
 * THE POINT IS THAT IT IS THE SAME COMPONENT, built from the same manifest and
 * the same messages as the route it stands in for. The pull-up's swap is
 * invisible only if what rises is pixel-identical to what the next route paints,
 * and the reliable way to guarantee that is to render the thing itself rather
 * than reproduce it. If `GateSection` changes, both change together.
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
      plateAlt={copy.plateAlt}
      characterAlt={messages.gates.characterAlt}
      cueHref={gateHref(locale, after)}
      cueLabel={messages.gates.cue[after.id]}
    />
  );
}

/** Per-route, per-locale metadata. Overview: metadata is localised per route. */
export async function gateMetadata(id: GateId, params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getMessages(locale).gates[id];
  return {
    title: `${copy.title} | Beyond Service: Trial of the Gods`,
    description: copy.plateAlt,
  };
}
