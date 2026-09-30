"use client";

import Image from "next/image";

import { ScrollCue } from "@/components/gates/ScrollCue";
import { BracketButton } from "@/components/ui/BracketButton";
import { Chip } from "@/components/ui/Chip";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import { GATE_CHARACTER, type Gate, type GateId } from "@/lib/gates";

/**
 * One gate - the full-viewport door the portal shows for an Ọnụ Ụzọ.
 *
 * Vertical positions are in `dvh` rather than percentages. A percentage padding
 * resolves against the containing block's WIDTH, not its height, so `pt-[28%]`
 * on a full-height hero drifts wildly with viewport aspect. The frame values
 * below are all measured against a 941px-tall 1440 frame and converted to dvh.
 *
 * TWO LAYERS, AND THEY MUST STAY SEPARATE
 *
 * Ken Burns (motion moment 3) is a CSS animation on `transform`. Pointer drift
 * (motion moment 4) is a JS write to `transform`. On the same element the two
 * silently clobber each other - whichever wrote last wins and the other appears
 * broken. So they are nested: the drift layer takes the translate, and its child
 * takes the Ken Burns scale. Nothing writes `transform` twice on one node.
 *
 * The drift layer carries a small `scale` overscan so the plate never reveals an
 * edge as it leans. In Tailwind v4 `scale-105` compiles to the `scale` property,
 * not to `transform`, so it coexists with the hook's transform write rather than
 * being overwritten by it.
 */
export function GateSection({
  gate,
  chip,
  title,
  cta,
  href,
  plateAlt,
  characterAlt,
  next,
  cueLabel,
}: {
  gate: Gate;
  chip: string;
  title: string;
  cta: string;
  /** The page behind this door - the CTA's destination. */
  href: string;
  plateAlt: string;
  characterAlt: string;
  /** The door the cue leads to; gate 4 wraps back to gate 1. */
  next: GateId;
  cueLabel: string;
}) {
  // front = character, back = environment plate. 3% and 1% respectively.
  const { frontRef, backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section
      className="relative flex h-dvh flex-col items-center overflow-hidden"
    >
      {/* ---- Environment plate. Drifts 1%. ---- */}
      <div ref={backRef} aria-hidden className="absolute inset-0 scale-105">
        <div className="ken-burns absolute inset-0" style={{ "--kb-origin": gate.kenBurnsOrigin } as React.CSSProperties}>
          <Image
            src={gate.plate}
            alt={plateAlt}
            fill
            // Each gate route owns its own plate as the LCP image.
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Scrim. Flat ink, not a gradient, per Design.

          Design gave #00000033, which is 20%. This is 50%: the plates are bright
          enough at 20% that the white title loses contrast against sky and
          foliage. Deepened deliberately - worth confirming, since it is a
          departure from the supplied value rather than a translation of it. */}
      <div aria-hidden className="bg-ink/50 absolute inset-0" />

      {/* ---- Character. Drifts 3%, so it leads the plate and reads as nearer. ----
          The art is 2146x3997 inside a 4096 square, so the visible figure is
          52.4% of this box's width. The frame puts it at ~738px tall on a
          941px viewport, bottom-cropped by the viewport.

          SIZE IS CAPPED ON BOTH AXES. Sizing on `dvh` alone meant a tall, narrow
          viewport blew the character up: at 820x1180 the box became 925px on an
          820px-wide screen and the head swallowed the gate. The `min()` with a vw
          term holds the figure at roughly 40% of viewport width on tablet and 27% on
          desktop, where the dvh term wins and the frame value is untouched.

          ANCHORED FROM THE BOTTOM, NOT THE TOP. `translate-y` percentages resolve
          against the ELEMENT's own size, unlike `bottom`, so a fixed percentage
          keeps the crop proportional at every viewport instead of the figure
          sliding up or down as the box resizes. 24% reproduces the frame's crop.

          Both `translate` utilities compile to the `translate` property in v4, so
          they coexist with the drift hook's `transform` write rather than being
          overwritten by it - the same arrangement the plate's `scale-105` uses. */}
      <div
        ref={frontRef}
        className="pointer-events-none absolute bottom-0 left-1/2 aspect-square h-[min(62dvh,140vw)] -translate-x-1/2 translate-y-[13%] select-none md:h-[min(78.4dvh,76vw)] md:translate-y-[24%]"
      >
        <Image
          src={GATE_CHARACTER}
          alt={characterAlt}
          fill
          priority
          sizes="(max-width: 767px) 140vh, 80vh"
          className="object-contain object-top"
        />
      </div>

      {/* ---- Content ---- */}
      <div className="relative z-10 flex h-full w-full flex-col items-center px-6">
        {/* Chip top sits at 267/941 of the frame; gap to the title is 29px.

            TRACKING IS -0.02em, which is Figma's -2% expressed the way CSS wants
            it. Prefer this form: `letter-spacing` does take a percentage in
            Chrome, but it is not portable, so the em is the safe translation of
            the same intent.

            IT DOES NOT FULLY MATCH THE FRAME, and that is expected. Untracked,
            Teko sets "THE GAME" 405px wide against the frame's 357. -0.02em
            brings it to 386, so the title still runs about 8% wide. Closing the
            rest needs roughly -0.053em, which is compensation for the face
            difference documented on --text-gate rather than a design value.
            Following the spec here instead. When Design supplies the real face
            the residual should disappear on its own. */}
        {/* `data-gate-heading`: the portal's gate rise reveals these two after
            the door lands. */}
        <div data-gate-heading className="flex flex-col items-center gap-[3.1dvh] pt-[28.4dvh]">
          <Chip>{chip}</Chip>
          <h1 className="font-display text-gate text-menu-fg text-center leading-[0.78] font-semibold tracking-[-0.02em] uppercase">
            {title}
          </h1>
        </div>

        <div className="mt-auto flex flex-col items-center gap-[6.8dvh] pb-[3.35dvh]">
          {/* A real link to the page: TransitionProvider's delegated handler
              plays the tear around the push, and the destination is announced
              and openable in a new tab like any link. */}
          {/* ONE LINE, ALWAYS. At text-body the longest label, DISCOVER THE
              COMPETITION, needs 358px with its brackets, and the gate's px-6
              leaves 345 at 393 and 312 at 360, so it was breaking in two. The
              size is text-body (16px) wherever that fits - about 415px and up -
              and below that shrinks with the viewport just enough to keep the
              longest label inside the padding: 14.8px at 393, 12.8 at 360,
              10.4 at 320. */}
          <BracketButton
            href={href}
            className="text-[length:clamp(0.625rem,calc(6vw-0.55rem),1rem)] leading-none tracking-[0.04em] px-4.5 whitespace-nowrap"
          >
            {cta}
          </BracketButton>
          {/* Only the bobbing arrow is clickable at a gate; its label is text. */}
          <ScrollCue gate={next} label={cueLabel} arrowOnly />
        </div>
      </div>
    </section>
  );
}

