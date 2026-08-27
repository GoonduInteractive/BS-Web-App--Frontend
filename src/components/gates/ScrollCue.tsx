import Image from "next/image";
import Link from "next/link";

/**
 * The cue at the foot of every gate: a torn arrow over a label naming the gate
 * it leads to. Bottom-centred, and it is a real link.
 *
 * Because it is a plain `next/link`, TransitionProvider's delegated click
 * handler intercepts it and plays the tear. Nothing here calls the transition.
 *
 * THE ARROW BOBS. Added at Design's request after the gates were built, to say
 * the cue is something you can act on rather than an ornament. The keyframes are
 * in globals.css so the reduced-motion block reaches them.
 *
 * The bob writes `transform` and the hover lift writes `translate`, which are
 * separate properties in Tailwind v4, so the arrow keeps bobbing as it lifts
 * instead of one cancelling the other.
 *
 * `arrow.svg` renders at its natural 23x29, which is what the frames measure
 * (21 x 29 of visible ink).
 */
export function ScrollCue({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="focus-visible:outline-signal group flex flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-8"
    >
      <Image
        src="/assets/ornaments/arrow.svg"
        alt=""
        aria-hidden
        width={23}
        height={29}
        className="scroll-cue-bob h-[29px] w-[23px] transition-[translate] duration-200 ease-gate select-none group-hover:translate-y-1"
      />
      <span className="text-menu-fg font-display text-body-sm font-semibold tracking-[0.1em]">
        {label}
      </span>
    </Link>
  );
}
