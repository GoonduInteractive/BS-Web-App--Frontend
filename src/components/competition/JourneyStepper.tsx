import { Scene } from "@/components/competition/Scene";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { Stage, StageStatus } from "@/types/tournament";

/**
 * FOLLOW THE JOURNEY TO ASCENSION - the six stages as a stepper. Figma:
 * `Tournament (upcoming).png` y 987..1272 and `…ongoing.png` y 1077..1362, and
 * the phone frame, where the stepper is vertical.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   heading  centred, ink 594 wide, cap 35 at 987 → 55px, --text-h1
 *   sub      two centred lines at a 25 pitch from 1054, 512 wide
 *   chips    62 tall, ~22 of side padding, Teko 25 labels; 48 apart with a 4px
 *            connector between: white after a stage that is done or running,
 *            #3d3d3d before one that is not
 *   colours  in progress #fdb022 with ink text; completed #d41400; upcoming
 *            --color-scar; both with white text
 *   status   Host Grotesk 16, white, centred 24 under the chip; a tick before
 *            "Completed"
 *
 * The row is centred on the page and is 1044 wide, which is why it turns
 * horizontal at `xl` rather than `lg`: at 1024 it ran 10px past the page.
 * Below that it is vertical, as the phone frame draws it: chips 35 in from
 * each edge and full width, the status centred 10 under each, a 4 x 20 link
 * centred under that, the next chip 10 under the link - a 135 pitch. The
 * heading wraps to three lines there at a 50 pitch (0.91) and the sub sits 21
 * under it.
 */
export function JourneyStepper({ stages, messages }: { stages: readonly Stage[]; messages: Messages }) {
  const t = messages.competition.detail;

  return (
    <section className="mx-auto w-full px-5 pt-25 lg:px-20 lg:pt-[8.375rem]">
      <Reveal
        as="h2"
        className="font-display text-menu-fg text-h1 text-center leading-[0.91] font-semibold tracking-[-0.058em] uppercase md:leading-[4rem]"
      >
        {t.journey.heading}
      </Reveal>
      <Reveal delay={80} className="mx-auto mt-5 max-w-132 md:mt-1.5">
        <p className="text-menu-fg font-body text-body text-center">{t.journey.sub}</p>
      </Reveal>

      {/* The `stepper` scene: each stage rises in turn and the link out of it
          draws itself towards the next - along the row at xl, down the column
          below it. */}
      <Scene scene="stepper" as="ol" className="mx-3.75 mt-19 flex flex-col xl:mx-0 xl:mt-[4.4375rem] xl:flex-row xl:items-start xl:justify-center">
        {stages.map((stage, index) => {
          const next = stages[index + 1];
          // The connector after a chip is lit once the journey has reached that
          // chip. THE TWO FRAMES DISAGREE HERE: the upcoming one lights the link
          // out of its in-progress REGISTRATION, the ongoing one leaves the link
          // out of its in-progress QUARTER FINALS grey. Lit is the reading that
          // makes the path grow with progress; FLAGGED.
          const lit = stage.status !== "upcoming";
          return (
            <li key={stage.key} className="flex flex-col items-center xl:flex-row xl:items-start">
              <div data-stage className="flex w-full flex-col items-center xl:w-auto">
                <Chip status={stage.status}>{t.stages[stage.key]}</Chip>
                <p className="text-menu-fg font-body text-body mt-2.5 flex items-center justify-center gap-1.5 xl:mt-4.5">
                  {stage.status === "completed" ? <Tick /> : null}
                  {t.stageStatus[stage.status]}
                </p>
              </div>
              {next ? (
                <span
                  aria-hidden
                  data-link
                  className={cn(
                    "mt-2.75 mb-2.5 h-5 w-1 xl:my-0 xl:mt-[1.8125rem] xl:h-1 xl:w-12",
                    lit ? "bg-menu-fg" : "bg-cinder",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </Scene>
    </section>
  );
}

const CHIP: Record<StageStatus, string> = {
  inProgress: "bg-amber text-ink",
  completed: "bg-lava text-menu-fg",
  upcoming: "bg-scar text-menu-fg",
};

function Chip({ status, children }: { status: StageStatus; children: string }) {
  return (
    <span
      className={cn(
        "font-display inline-grid h-15.5 w-full shrink-0 place-items-center px-5.5 text-[1.5625rem] leading-none font-semibold tracking-[-0.07em] uppercase whitespace-nowrap xl:w-auto",
        CHIP[status],
      )}
    >
      {children}
    </span>
  );
}

/** The 11 x 12 tick before "Completed". */
function Tick() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 6.5l3 3L10.5 2" />
    </svg>
  );
}
