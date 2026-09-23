"use client";

import type { ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { GateSection } from "@/components/gates/GateSection";
import { gateHref, getGate, nextGate } from "@/lib/gates";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The home route's two faces: the entry screen, then the gate the visitor is
 * standing at. `/en` is the portal - ENTER opens onto Ọnụ Ụzọ 1, the cues and
 * the rail move between the four doors, and the URL never changes until a
 * door's CTA takes you through to its page. See `GateEntry`.
 *
 * The entry screen is server-rendered and passed in whole, so the landing
 * page's HTML is the entry screen; the gates paint on the client, after a
 * choice, from the same manifest and copy the pull-up previews use.
 */
export function GatePortal({ entry, locale, gates }: { entry: ReactNode; locale: Locale; gates: Messages["gates"] }) {
  const { shown } = useGateEntry();
  if (!shown) return <>{entry}</>;

  const gate = getGate(shown);
  const next = nextGate(gate);
  const copy = gates[gate.id];

  return (
    <main data-gate={gate.slug}>
      <GateSection
        gate={gate}
        chip={copy.chip}
        title={copy.title}
        cta={copy.cta}
        href={gateHref(locale, gate)}
        plateAlt={copy.plateAlt}
        characterAlt={gates.characterAlt}
        next={next.id}
        cueLabel={gates.cue[next.id]}
      />
    </main>
  );
}
