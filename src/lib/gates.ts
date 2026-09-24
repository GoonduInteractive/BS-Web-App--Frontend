import type { Messages } from "@/lib/utils/messages";

/**
 * The gate manifest. Gate order lives here and nowhere else - the rail, the four
 * gate routes and each scroll cue all read from this list, so adding or
 * reordering a gate is a one-line change.
 *
 * THE DOORS SHARE THE HOME ROUTE; THE PAGES HAVE THE SLUGS. `/en` is the portal
 * and shows one gate at a time (`GateEntry` holds which); `/en/{slug}` is the
 * page a gate's CTA opens onto. So the rail and the cues swap the portal's
 * face - the tear plays, the URL holds - and a CTA is a real link to a page.
 *
 * Route slugs are English per the naming rule in coding-standard.md, even though
 * the chip labels are Igbo.
 */

/** Keys into `messages.gates`. Not a free-form string, so a typo is a build error. */
export type GateId = "theGame" | "characters" | "community" | "competition";

export type Gate = {
  id: GateId;
  /** Ọnụ Ụzọ number, 1-indexed, as shown on the chip. */
  index: number;
  /** Path below the locale segment. */
  slug: string;
  /** Full-bleed environment plate. The character is NOT baked into these. */
  plate: string;
  /**
   * Ken Burns transform-origin. Alternating it is what makes the drift run a
   * different way per gate (motion moment 3); the scale is identical on all four.
   */
  kenBurnsOrigin: string;
};

export const GATES: readonly Gate[] = [
  {
    id: "theGame",
    index: 1,
    slug: "the-game",
    plate: "/assets/gates/onu-uzo-1.png",
    kenBurnsOrigin: "50% 40%",
  },
  {
    id: "characters",
    index: 2,
    slug: "characters",
    plate: "/assets/gates/onu-uzo-2.png",
    kenBurnsOrigin: "35% 60%",
  },
  {
    id: "community",
    index: 3,
    slug: "community",
    plate: "/assets/gates/onu-uzo-3.png",
    kenBurnsOrigin: "65% 45%",
  },
  {
    id: "competition",
    index: 4,
    slug: "competition",
    plate: "/assets/gates/onu-uzo-4.png",
    kenBurnsOrigin: "50% 65%",
  },
] as const;

/** Shared by every gate. Ships on its own layer, so it can drift independently. */
export const GATE_CHARACTER = "/assets/characters/soma-gate-character.png";

export function getGate(id: GateId): Gate {
  const gate = GATES.find((g) => g.id === id);
  if (!gate) throw new Error(`Unknown gate: ${id}`);
  return gate;
}

/**
 * The gate after this one, wrapping gate 4 back to gate 1.
 *
 * The wrap is not an invention: the competition frame's scroll cue reads
 * DISCOVER THE GAME, so the sequence is a loop rather than a dead end.
 */
export function nextGate(gate: Gate): Gate {
  return GATES[(gate.index % GATES.length)];
}

/** The gate before this one, wrapping gate 1 back to gate 4 - `nextGate` run backwards. */
export function prevGate(gate: Gate): Gate {
  return GATES[(gate.index - 2 + GATES.length) % GATES.length];
}

export function gateHref(locale: string, gate: Gate): string {
  return `/${locale}/${gate.slug}`;
}

/**
 * Which gate's PAGE a pathname is, or null if it is not one - what BACK TO ỤZỌ
 * reads to know which door to return to.
 */
export function gateFromPathname(pathname: string): Gate | null {
  const segments = pathname.split("/").filter(Boolean);
  // [locale, slug] - anything shorter is the entry screen, anything deeper is a
  // detail route that is not itself a gate.
  if (segments.length !== 2) return null;
  return GATES.find((g) => g.slug === segments[1]) ?? null;
}

/** Copy for one gate. Typed off Messages, so a missing key fails the build. */
export function gateMessages(messages: Messages, id: GateId) {
  return messages.gates[id];
}
