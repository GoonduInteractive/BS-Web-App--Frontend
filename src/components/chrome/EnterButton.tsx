"use client";

import { usePageTransition } from "@/components/transition/TransitionProvider";
import { BracketButton } from "@/components/ui/BracketButton";

/**
 * The entry screen's language gate, wired to the tear transition.
 *
 * This exists as a client boundary because EntryScreen is a Server Component
 * and cannot hand an onClick across. Importing BracketButton here pulls it into
 * the client bundle automatically, so BracketButton itself stays free of a
 * "use client" directive and remains usable from either side.
 */
export function EnterButton({
  href,
  label,
  hoverLabel,
}: {
  href: string;
  label: string;
  hoverLabel: string;
}) {
  const { navigate } = usePageTransition();

  return (
    <BracketButton hoverLabel={hoverLabel} onClick={() => navigate(href)}>
      {label}
    </BracketButton>
  );
}
