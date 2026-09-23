"use client";

import { useGateEntry } from "@/components/gates/GateEntry";
import { BracketButton } from "@/components/ui/BracketButton";

/**
 * The entry screen's language gate. ENTER tears open onto Ọnụ Ụzọ 1 - the
 * first door of the portal, on this same route (see GateEntry).
 */
export function EnterButton({ label, hoverLabel }: { label: string; hoverLabel: string }) {
  const { showGate } = useGateEntry();

  return (
    <BracketButton hoverLabel={hoverLabel} onClick={() => showGate("theGame")}>
      {label}
    </BracketButton>
  );
}
