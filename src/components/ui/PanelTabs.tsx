"use client";

import { PanelTab } from "@/components/ui/PanelTab";
import { TabSlider } from "@/components/ui/TabSlider";
import { cn } from "@/lib/utils/cn";

/**
 * The two-panel switcher's row - the tablist, its two tabs and the underline
 * that slides between them - as ONE component, at the human's direction
 * (2026-09-16): the Competition page's Tournaments / Leaderboards and the
 * Community page's Community Wall / Active Player Map are the same control and
 * were composed twice, and the two copies had drifted (the Competition copy
 * put its top padding INSIDE the tablist, which the slider then counted
 * twice - see TabSlider). Layout that differs between the pages - left-aligned
 * in a bar, or centred in a hero - comes in through `className`; the tabs, the
 * ids, the keyboard pattern and the slider do not.
 *
 * Ids follow one rule the panels share: the tab is `${name}-tab-${key}` and the
 * panel it controls `${name}-panel-${key}`.
 */
export function PanelTabs<K extends string>({
  name,
  label,
  tabs,
  active,
  onChange,
  className,
}: {
  /** The id prefix the panels use too: "competition", "community". */
  name: string;
  /** The tablist's accessible name. */
  label: string;
  tabs: readonly { key: K; label: string; disabled?: boolean }[];
  active: K;
  onChange: (key: K) => void;
  /** The row's layout: spacing, alignment, padding. It is already `relative flex`. */
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("relative flex", className)}>
      {tabs.map((tab) => (
        <PanelTab
          key={tab.key}
          id={`${name}-tab-${tab.key}`}
          panelId={`${name}-panel-${tab.key}`}
          label={tab.label}
          active={active === tab.key}
          disabled={tab.disabled}
          onSelect={() => onChange(tab.key)}
          indicator={false}
        />
      ))}
      <TabSlider activeId={`${name}-tab-${active}`} />
    </div>
  );
}
