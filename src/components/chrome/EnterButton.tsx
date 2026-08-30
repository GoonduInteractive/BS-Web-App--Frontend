"use client";

import { usePageTransition } from "@/components/transition/TransitionProvider";
import { BracketButton } from "@/components/ui/BracketButton";

/* The entry screen's language gate, wired to the tear transition.
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
