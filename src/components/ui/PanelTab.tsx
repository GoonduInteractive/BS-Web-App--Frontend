"use client";

import { cn } from "@/lib/utils/cn";

/**
 * One tab of a two-panel switcher: a 6px square marker, the label, and a
 * 1px underline with end ticks under the active one. The Competition frame
 * drew it first (Tournaments / Leaderboards) and the Community frame draws
 * the same control centred in its hero (Community Wall / Active Player Map),
 * so it lives here and both use it.
 *
 * Arrow keys move between the two tabs, per the tabs pattern; the sibling is
 * the only other tab, so either arrow reaches it.
 *
 * With `indicator={false}` the underline is the tablist's `TabSlider`, which
 * travels between the tabs; the tab keeps its slot, invisible, for height.
 */
export function PanelTab({
  id,
  panelId,
  label,
  active,
  onSelect,
  disabled = false,
  indicator = true,
}: {
  id: string;
  panelId: string;
  label: string;
  active: boolean;
  onSelect: () => void;
  /**
   * Drawn at full strength but not selectable — for a panel that has no design
   * yet. A tab that looked live and did nothing would mislead a keyboard user
   * twice; `disabled` says so once. FLAGGED wherever it is set.
   */
  disabled?: boolean;
  /** Draw the underline here (default), or leave it to a `TabSlider` in the list. */
  indicator?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={onSelect}
      onKeyDown={(event) => {
        // Arrow keys move between the two tabs, per the tabs pattern; the
        // sibling is the only other tab, so either arrow reaches it.
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[role=tab]");
          const other = tabs && [...tabs].find((tab) => tab !== event.currentTarget);
          other?.focus();
          other?.click();
        }
      }}

      className="text-menu-fg font-body text-body focus-visible:outline-signal flex cursor-pointer flex-col focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default"
    >
      <span className="flex items-center gap-2 px-2.5 whitespace-nowrap">
        <span
          aria-hidden
          className={cn("ease-gate size-1.5 shrink-0 transition-colors duration-300", active ? "bg-signal" : "bg-disabled-fg")}
        />
        {label}
      </span>

      <span
        aria-hidden
        className={cn("border-signal relative mt-0.5 h-1.5 w-full border-x-2", (!active || !indicator) && "invisible")}
      >
        <span className="bg-signal absolute inset-x-0 top-0.5 h-px" />
      </span>
    </button>
  );
}
