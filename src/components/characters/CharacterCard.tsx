import Image from "next/image";

import { TornDivider } from "@/components/ui/TornDivider";

/**
 * A Souls of the Arena card: portrait on the scar field, corner marks, and a
 * name plate separated from the image by a torn edge.
 *
 * TWO REDS, AND THEY ARE NOT INTERCHANGEABLE. Sampling the frame's card down a
 * column that misses the portrait gives #330500 from the card's top edge to the
 * seam, then #680500 from the seam to the bottom. So the portrait sits on the
 * DARKER --color-scar and the name plate is the LIGHTER --color-clot. This used
 * to paint the whole card oxblood with a clot plate, which had the two fields
 * far closer together than the frame does.
 *
 * The corner marks are clot on scar — the plate's colour, reused — and not the
 * bright --color-signal they were built with. Measured at 46 x 40 with a 2px
 * stroke, inset 15px, where they had been 28 x 28 at 1px inset 16.
 *
 * The torn seam is the same TornDivider used at section boundaries, pulled up
 * over the image so the plate appears to tear its way across. One
 * implementation, three cards, any colour.
 *
 * The portrait is SQUARE, not the 41:50 it was. The frame's card is 411 wide
 * with the seam 387 down and the plate 127 below it, so a square portrait plus
 * a 105px plate lands the frame's 514. The old ratio ran the portrait 114px long
 * and pushed the whole section 120px past the frame's height.
 *
 * FLAGGED: --color-clot (#680500) is still a sampled value, not confirmed from
 * Figma. --color-scar (#330500) is read from a delivered asset and is solid.
 */
export function CharacterCard({
  name,
  role,
  image,
  imageAlt,
  priority = false,
}: {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  priority?: boolean;
}) {
  return (
    <article className="bg-scar group relative flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden">
        {/*
          THE PORTRAIT ZOOMS ON HOVER, and the clip that makes that work is the
          wrapper's `overflow-hidden`, not the card's — the card also clips, but
          the corner marks sit outside this box and must not scale with the art.

          `scale-115` compiles to the `scale` property in v4, so it is safe from
          any GSAP scene that tweens an ancestor's `transform`. It must stay off
          any element a timeline touches directly: GSAP normalises `scale` onto
          its own transform and writes `scale: none` inline, which would kill
          this silently. SoulsSection tweens a wrapper around the card for
          exactly that reason.
        */}
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 30vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-115 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {/* Corner marks. Decorative, drawn rather than shipped as four files.
            Above the portrait so the zoom passes behind them. */}
        <span
          aria-hidden
          className="border-clot absolute top-[15px] left-[15px] z-10 h-10 w-11 border-t-2 border-l-2"
        />
        <span
          aria-hidden
          className="border-clot absolute top-3.75 right-[15px] z-10 h-10 w-11 border-t-2 border-r-2"
        />
        <span
          aria-hidden
          className="border-clot absolute bottom-[15px] left-[15px] z-10 h-10 w-11 border-b-2 border-l-2"
        />
        <span
          aria-hidden
          className="border-clot absolute right-[15px] bottom-[15px] z-10 h-10 w-11 border-r-2 border-b-2"
        />
      </div>

      {/* Pulled up so the plate tears into the portrait rather than butting it.
          The pull matches the divider's own height, which grew from 24/40 to a
          flat 56 when it moved onto TornSurface's 47.4 depth — leaving the old
          -mt-6 would have added 32px of plate below the seam. */}
      <TornDivider
        edge="top"
        seed={7311}
        className="text-clot relative z-10 -mt-14"
      />

      {/* The frame insets the name 37px from the card edge, not the 24 this had. */}
      <div className="bg-clot relative z-10 px-9 pb-6">
        <h3 className="font-display text-menu-fg text-[2.9375rem] leading-none font-semibold tracking-[-0.03em] uppercase">
          {name}
        </h3>
        <p className="text-menu-fg/85 font-body text-body mt-2">{role}</p>
      </div>
    </article>
  );
}
