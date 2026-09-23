import { ScrollCue } from "@/components/gates/ScrollCue";
import type { GateId } from "@/lib/gates";
import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 7 of the Competition page - THE GODS ARE WATCHING, and the scroll
 * cue to the next gate. Figma: `context/design/06-competition/Competition.png`,
 * y 5221..6083 at 1440. The last section, so it sits INSIDE the GateCurtain
 * and the pull-up rides over it, as on The Game and The Characters.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   strip     97..124 x 5549..5775 - nsibidi-glyphs-2.svg's 28 x 227 exactly, in ember
 *   heading   ink 202..535, two lines, cap 49 at 5557 and 5625 → --text-story-title
 *             at a 68 pitch, flat #dedede
 *   copy      950..1260, five lines at a 25 pitch from cap 5539 - three hard
 *             breaks and one wrap - #e6e6e6
 *   CTA       red 977..1273 x 5691..5746, brackets at 949 and 1290
 *   cue       arrow 692..712 x 5965..5993, label cap 6012, white
 *   panel     the next gate's preview from 6083
 *
 * THE STRIP IS THE DELIVERED SVG, MASKED. `nsibidi-glyphs-2.svg` is the glyph
 * strip to the pixel, but its fill is #620002 and the frame paints the glyphs
 * in --color-ember (#800c00, read exactly). An `<img>` cannot be recoloured, so
 * the file is a `mask-image` over an ember box - the way TornBand masks its
 * photograph - and the colour comes from the token. FLAGGED: the asset and the
 * frame disagree on the red.
 *
 * THE GREYS ARE OPACITIES OF MENU-FG: 89% lands on the heading's #dedede and
 * 92% on the copy's #e6e6e6, both within a value over this ground. Same
 * arrangement as the tournament cards' names.
 *
 * THE CTA LABEL DROPS A STRAY "]". The frame reads "REGISTER FOR A TOURNAMENT]";
 * the bracket is a keystroke, not copy, and is treated the way "orignals" was
 * on the merch store - corrected and flagged.
 */
export function GodsWatching({
  messages,
  nextGate,
  cta,
}: {
  messages: Messages;
  /**
   * Where the scroll cue points. The competition page hands on to the next
   * gate; the tournament detail page is not a gate and ends on the footer, so
   * it passes none and the cue is not drawn.
   */
  /** The door the cue leads to, on the portal; none on the tournament page. */
  nextGate?: GateId;
  /** The CTA's label when it is not the competition page's. */
  cta?: string;
}) {
  const t = messages.competition.gods;

  return (
    <section className="relative mx-auto w-full px-6 pt-62 pb-14 lg:px-20 lg:pt-78">
      <div className="relative lg:flex lg:items-start lg:justify-between">
        {/* ---- Left: the glyph strip and the heading ---- */}
        <div className="relative lg:pt-5.5 lg:pl-30">
          <div
            aria-hidden
            // The phone frame (leaderboard-mobile.png) keeps the strip and moves it to
            // the right, 25 in and 41 above the heading's box; at lg it is the
            // desktop frame's, 17 in from the left and 16 down.
            className="bg-ember absolute -top-10 right-6 h-[14.1875rem] w-7 lg:top-4 lg:right-auto lg:left-[1.0625rem] [mask-image:url(/assets/ornaments/nsibidi-glyphs-2.svg)] [mask-repeat:no-repeat] [mask-size:100%_100%]"
          />
          {/* 24rem breaks THE GODS ARE / WATCHING: the first line sets at 334
              and the whole title near 600. Leading is MoreChampions' 0.87, the
              frame's 68 pitch on a 78.5 face. */}
          <Reveal
            as="h2"
            className="font-display text-menu-fg/89 max-w-96 text-[3.9375rem] leading-[0.87] font-semibold tracking-[-0.056em] uppercase lg:text-story-title"
          >
            {t.title}
          </Reveal>
        </div>

        {/* ---- Right: the pitch and the CTA, 352 wide, 59 short of the edge ---- */}
        <Reveal delay={80} className="mt-9 lg:mt-0 lg:mr-14.75 lg:w-88 lg:shrink-0">
          {/* 328 wraps the fourth sentence at "a", as the frame does; the three
              before it are hard breaks in the copy. */}
          <p className="text-menu-fg/92 font-body text-body max-w-82 whitespace-pre-line">{t.body}</p>
          {/* The widest label on the site: 262 at 18px, which with its brackets
              does not fit a 332 column. It wraps below lg and holds the frame's
              one line from lg. */}
          <div className="mt-7">
            <BracketButton className="px-4 py-4.75 text-center leading-tight tracking-normal lg:leading-none lg:whitespace-nowrap">
              {cta ?? t.cta}
            </BracketButton>
          </div>
        </Reveal>
      </div>

      {/* 219 under the CTA's foot, which is the row's - the strip is absolute and
          runs 29 further, so the frame's 190 under the strip is this. */}
      {nextGate ? (
        <Reveal delay={160} className="flex justify-center pt-24 lg:pt-[13.6875rem]">
          <ScrollCue gate={nextGate} label={t.cue} />
        </Reveal>
      ) : null}
    </section>
  );
}
