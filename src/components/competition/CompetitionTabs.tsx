import { PanelTabs } from "@/components/ui/PanelTabs";
import type { Messages } from "@/lib/utils/messages";

export type CompetitionView = "tournaments" | "leaderboard";

/**
 * Tournaments / Leaderboards, in the bar under the hero. The row is the shared
 * `PanelTabs`; this file is its placement — the bar's ground and rule, the 61 of
 * air above the tabs, the container. The list runs 4px outside the container
 * because the underline runs past its label on both sides (padding on the tab).
 */
export function CompetitionTabs({
  messages,
  active,
  onChange,
}: {
  messages: Messages;
  active: CompetitionView;
  onChange: (view: CompetitionView) => void;
}) {
  const t = messages.competition.tabs;

  return (
    <div className="bg-roster-bottom border-menu border-b pt-[3.8125rem]">
      <PanelTabs
        name="competition"
        label={t.label}
        tabs={[
          { key: "tournaments", label: t.tournaments },
          { key: "leaderboard", label: t.leaderboards },
        ]}
        active={active}
        onChange={onChange}
        className="mx-auto w-full gap-[1.875rem] px-5 lg:px-19"
      />
    </div>
  );
}
