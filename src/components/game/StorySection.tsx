"use client";

import Image from "next/image";
import { useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { Chip } from "@/components/ui/Chip";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

/**
 * Section 2 — The Story. Figma: `context/design/03-the-game/full-page.png`
 * y 828..1920 at 1440, and `full-page-mobile.png` y 782..1926 at 361.
 *
 * WHAT THE FRAMES MEASURE. Geometry only; no colour was read off a PNG.
 *
 * 1440, all offsets from the top tear line:
 *
 *   chip        x 673..767   y 141..170   (the 96x30 plate at natural size)
 *   title       cap top 204, cap 50, line pitch 80, line 1 ink 605 wide
 *   left copy   x 213..478   cap top 447   body 16/25.9, 3 + 8 lines
 *   right copy  x 977..1231  cap top 597   body 16/25.9, 5 lines
 *   button      x 1005..1163 y 785..840    (159 x 55, brackets at 977 and 1190)
 *   glyphs      77 x 359 natural, left x 99 y 108, right x 99 y 184
 *   figure      372 wide, centred, top 447, CUT BY THE BOTTOM TEAR
 *   section     1092 tall, tear line to tear line
 *
 * 361: chip y 83, title cap 35 on a 54 pitch, copy from x 24 at y 335, figure
 * 260 wide (0.7 of desktop) from y 733, button 157 x 55 centred at y 1052.
 *
 * THE SECTION OWNS BOTH ITS EDGES, which is the SummonsSection pattern and for
 * the same reason: the tear has to be drawn OVER the figure, and a divider
 * living in the next section's flow can only ever end above this one's content.
 *
 *   - The TOP tear is oxblood teeth pointing up into the hero plate. It hangs
 *     above the section box, so the box must not be `overflow-hidden`.
 *   - The BOTTOM tear is char teeth pointing up — the next field's colour, this
 *     section's boundary — laid over Soma's waist. It is why TwoPathsSection no
 *     longer draws one; two sections cannot both own one edge.
 *
 * Soma therefore overhangs the box by about 47px. Nothing clips him: the next
 * section's gradient is opaque and painted after, which covers the overhang for
 * free. Clipping here instead would put a straight cut in the tear's troughs.
 *
 * FLAGGED, unchanged: --color-oxblood (#310400) is still a sampled value. The
 * overview names it "story section field", which is this, but it is unconfirmed.
 *
 * FLAGGED, NOT FIXED HERE: the chip's LABEL is set in the wrong face. `Chip`
 * uses `font-display` (Teko) with tracking-[0.17em]; both this frame and the
 * gate frames set it in the proportional body face at ordinary tracking. The
 * ink measures 61 x 9 in the frame against our 59 x 8, so the box is right and
 * only the letterforms are wrong — but `Chip` is shared with all four gates,
 * which were signed off against their own frames, so changing its typeface is a
 * decision about five screens rather than this one. Raised, not taken.
 *
 * FLAGGED: the body copy's first paragraph breaks one line later here than in
 * the 361 frame. Our Host Grotesk sets "Soma was an ordinary youth corps
 * member" at 324.6px where the frame's ink measures 316 — 2.7% wide, the body
 * face's version of the display-face discrepancy recorded on --text-gate. The
 * section absorbs it: the figure and the mobile CTA are both anchored to the
 * bottom, so a longer copy block moves them together and the composition holds.
 */
export function StorySection({ messages }: { messages: Messages }) {
  const t = messages.theGame.story;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, storyScene);

  return (
    <section ref={root} className="bg-oxblood relative">
      {/* Top edge, hung above the box so its teeth bite into the hero plate. */}
      <TornDivider
        edge="top"
        seed={3120}
        className="text-oxblood absolute inset-x-0 -top-6 z-20"
      />

      {/* Mirrored glyph columns. Decorative, and hidden below lg where they
          would crowd the copy — the 361 frame has none either. Rendered at the
          delivered 77 x 359, which is exactly what the frame measures. They
          carry their own colour (#550800, baked into the SVG), so no token. */}
      <Image
        src="/assets/ornaments/nsibidi-glyphs-1.svg"
        alt=""
        aria-hidden
        width={77}
        height={359}
        data-story-glyphs
        className="absolute top-[6.3125rem] left-[6.1875rem] hidden w-[4.8125rem] select-none lg:block"
      />
      <Image
        src="/assets/ornaments/nsibidi-glyphs-1.svg"
        alt=""
        aria-hidden
        width={77}
        height={359}
        data-story-glyphs
        className="absolute top-[11.0625rem] right-[6.1875rem] hidden w-[4.8125rem] select-none lg:block"
      />

      {/*
        Soma. Absolute at both widths, because at both widths he is a backdrop
        the copy is laid over rather than an item in the column flow — on mobile
        the CTA sits ON him, which no flow order can produce.

        SIZED AND PLACED BY THE SILHOUETTE, NOT THE FILE BOUNDS, which is the
        same correction SummonsSection records. `soma-gate-character.png` is a
        4096 square that is 63.3% transparent; the figure inside it occupies
        2148 x 3997 at x 964, y 99, so it is only 52.4% of the file's width.
        Sizing the box to the frame's 372 renders him at 195. The box is
        therefore 363 x 4096/2148 = 692, and 260 x 4096/2148 = 496 (137.4vw) on
        mobile, which is what puts the SILHOUETTE at the measured widths. The
        overhang is transparent and `overflow-x: hidden` on `html` contains it.
        His centre is 10/4096 off the file's, which is 1.7px here — ignorable.

        ANCHORED BY HIS FEET, not his head. The figure has no transparent margin
        below it, so the box's bottom edge IS the silhouette's, and the tear
        cutting him is a fixed distance up from there. Anchoring by the top would
        instead tie him to the copy above, whose height moves with the locale.

        THREE NESTED ELEMENTS, and the nesting is load-bearing. The outer one
        holds the layout (including `-translate-x-1/2`, which Tailwind v4
        compiles to the `translate` property), the middle one takes the scrub and
        the inner one the entrance. Two GSAP tweens on one element fight over
        `transform` and the last write wins — see the warning on useGsapScene.
      */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 w-[137.4vw] -translate-x-1/2 md:bottom-[-2.5625rem] md:w-[43.25rem]">
        <div data-story-figure>
          <div data-story-figure-inner>
            <Image
              src="/assets/characters/soma-gate-character.png"
              alt={t.characterAlt}
              width={4096}
              height={4096}
              sizes="(max-width: 767px) 138vw, 692px"
              className="w-full select-none"
            />
          </div>
        </div>
      </div>

      {/* THE COLUMNS ARE NOT THIRDS, which is why the template is explicit.
          1018px centred is what puts the outer columns' ink at the measured
          x 213 and x 1231, and 272 / 254 is what puts the right one's left edge
          at 977 — three equal columns cannot satisfy both at once, and the frame
          is under no obligation to be a regular grid. `px-6` is mobile only; on
          desktop the max-width alone sets the margin. */}
      <div className="relative z-10 mx-auto max-w-[63.625rem] px-6 pt-[5.1875rem] pb-[28.5rem] md:px-0 md:pt-[8.4375rem] md:pb-[18rem]">
        <header
          data-story-head
          className="flex flex-col items-start text-left md:items-center md:text-center"
        >
          <Chip>{t.chip}</Chip>
          {/*
            THE TRACKING IS A MEASUREMENT. Teko sets "SOMA WAS NEVER MEANT" at
            693.5px where the frame measures 605 — 14.6% wide, the third
            independent confirmation that the frames are not set in Teko (see
            --text-gate and --text-menu-link). -88.5px over the line's 20
            characters is -4.4px each, which is -0.056em.

            The max-width is then the LINE BREAK, not a safety margin: wide
            enough for that 605px line and too narrow for the following "TO".
          */}
          <h2 className="font-display text-menu-fg text-story-title mt-[1.125rem] max-w-[39.5rem] md:mt-[1.5rem] font-semibold tracking-[-0.056em] uppercase">
            {t.title}
          </h2>
        </header>

        <div className="md:grid md:grid-cols-[17rem_1fr_15.875rem]">
          <div data-story-copy className="mt-[2.125rem] md:mt-[5.5625rem]">
            <p className="text-menu-fg/80 font-body text-body">{t.body1}</p>
            <p className="text-menu-fg/80 font-body text-body mt-[1.5625rem]">
              {t.body2}
            </p>
          </div>

          {/* Soma's lane. Empty on purpose — he is absolute, and this is the
              column the frame reserves for him. */}
          <div aria-hidden className="hidden md:block" />

          <div data-story-aside className="mt-[1.5625rem] md:mt-[14.9375rem]">
            <p className="text-menu-fg/80 font-body text-body">{t.aside}</p>
            {/*
              THE MOBILE MARGIN IS THE FIGURE. The 361 frame leaves 353px of
              apparently empty flow between the copy and the button because Soma
              is behind it, and the button lands on his chest. Centred there,
              left-aligned with the column on desktop.
            */}
            <div
              data-story-cta
              className="absolute inset-x-0 bottom-[4.1875rem] flex justify-center pr-8 md:static md:mt-[3.8125rem] md:justify-start md:pr-0"
            >
              <BracketButton className="text-body px-4.5 leading-none tracking-[0.04em]">
                {t.cta}
              </BracketButton>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom edge, in the next field's colour, laid over Soma's waist. */}
      <TornDivider
        edge="top"
        seed={7714}
        className="text-char absolute inset-x-0 bottom-0 z-20"
      />
    </section>
  );
}

/**
 * "Soma rises." The section's entrance and its parallax.
 *
 * WHY THIS SECTION GETS A SCENE AND NOT `Reveal`
 *
 * Same test SummonsSection applies. `Reveal` is an IntersectionObserver flipping
 * one attribute and it cannot do either thing this needs: a TIMELINE, where the
 * heading, the two copy columns and the figure arrive in a deliberate order, and
 * a SCRUB, where Soma's drift is tied to scroll position rather than to an event.
 * GSAP is already a lazy chunk on this route (Souls and Summons both build one),
 * so this adds choreography and no bytes.
 *
 * WHAT THE MOTION IS SAYING. This is the section where Soma is killed and given
 * a second chance, and the frame already stages it: he is cut off at the waist
 * by the torn ground rather than standing on it. So he COUNTER-SCROLLS — drifts
 * up as the page comes down — and because the tear is a fixed line across him,
 * rising against it reads as climbing out of it. The copy scrolls normally past
 * a figure that is going the other way, which is the whole effect. 130px over a
 * full section; any more and he separates from the ground he is supposed to be
 * emerging from.
 *
 * THE TORN EDGES ARE NEVER ANIMATED. TornSurface warns about this and it is not
 * theoretical: feTurbulence re-rasterises on every repaint, so moving a filtered
 * element re-runs the noise each frame. Both dividers are left completely alone
 * and everything between them moves instead.
 *
 * THE BRACKETS ARE NOT IN THE SCENE either, for the reason recorded on
 * useGsapScene: tweening them writes `translate: none` and `scale: none` inline
 * over BracketButton's own classes and kills the mirroring and the hover spread.
 * The CTA WRAPPER fades and rises, carrying them.
 */
const storyScene: SceneBuilder = (gsap, q, section) => {
  const figure = q("[data-story-figure]");
  const figureInner = q("[data-story-figure-inner]");
  const head = q("[data-story-head]");
  const copy = q("[data-story-copy]");
  const aside = q("[data-story-aside] p");
  const cta = q("[data-story-cta]");
  const glyphs = q("[data-story-glyphs]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      // Reduced motion gets the composed result and nothing else. Not a slower
      // version — no movement at all, per overview section 10.
      if (!motion) {
        gsap.set([figure, figureInner, head, copy, aside, cta, glyphs], { clearProps: "all" });
        return;
      }

      // ---- Entrance. Once, on the way down. ----
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      });

      // Soma leads, and he arrives from BELOW the tear — the same direction the
      // scrub then keeps pushing him. Everything else settles onto a figure that
      // is already coming up.
      tl.from(figureInner, { yPercent: 9, opacity: 0, duration: 1.2 })
        .from(head, { y: 26, opacity: 0, duration: 0.8 }, 0.1)
        .from(glyphs, { opacity: 0, duration: 1.1 }, 0.2)
        .from(copy, { y: 22, opacity: 0, duration: 0.75 }, 0.38)
        .from(aside, { y: 22, opacity: 0, duration: 0.75 }, 0.52)
        .from(cta, { y: 18, opacity: 0, duration: 0.6 }, 0.66);

      // ---- The rise. Tied to scroll, not to time. ----
      gsap.fromTo(
        figure,
        { y: 65 },
        {
          y: -65,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            // A number, not `true`: the drift lags the scroll slightly, which is
            // what stops it feeling glued to the wheel.
            scrub: 0.6,
          },
        },
      );

      // The glyph columns take the opposite sign at a fifth of the travel, so
      // the field reads as having two planes rather than one moving cut-out.
      // Desktop only — they are display:none below lg and a tween on a hidden
      // element is wasted work.
      gsap.fromTo(
        glyphs,
        { y: -13 },
        {
          y: 13,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    },
  );
};
