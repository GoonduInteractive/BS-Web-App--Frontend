"use client";

import Image from "next/image";
import { memo } from "react";

import { TornPanel } from "@/components/ui/TornPanel";
import { relativeTime } from "@/lib/api/community";
import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";
import type { CommunityNote, NoteTint } from "@/types/community";

/**
 * One note on the wall. Figma: `Community Wall.png`, the 416-wide cards.
 *
 * WHAT THE FRAME MEASURES, on the 684..1100 x 699..931 card:
 *
 *   paper    the delivered card.svg - a 410 x 225 rect displaced by fractal
 *            noise (baseFrequency 0.0775, scale 15.4, seed 5288) inside a 426
 *            box; so the visible card is ~416 wide and its edge is the tear
 *   avatar   32 circle in --color-gild, centre 48 in and 42 down; the user glyph
 *   name     Host Grotesk 16, beside the avatar
 *   note     the handwriting face at 17px on a 25 pitch, from 90 down, 32 in
 *   foot     thumbs-up + count at the left, the time at the right, 16px row 26
 *            above the foot and ~56 under the note's last line
 *
 * THE PAPER IS THE DELIVERED SVG'S FILTER, PROCEDURALLY. The human sent one
 * card as SVG with "add all colours": `TornPanel` reproduces its displacement
 * at the card's real size (the filter is in user units, so a stretched SVG
 * would smear - the TornDivider lesson), and the four tints are tokens on
 * `currentColor`. The four fills are flat vector fills read off the frame; the
 * sky one is the SVG's own #EBF8FF.
 *
 * TWO HEIGHTS, ONE COMPONENT: the short note and the long one differ only in
 * copy, and the paper follows the copy.
 */
export const NoteCard = memo(function NoteCard({
  note,
  liked,
  onLike,
  messages,
  className,
}: {
  note: CommunityNote;
  liked: boolean;
  /** Called with the note's id, so the wall can hand every card one stable handler. */
  onLike: (id: string) => void;
  messages: Messages;
  className?: string;
}) {
  const t = messages.community.wall;
  const time = relativeTime(note.postedAt, { minutes: t.minsAgo, hours: t.hoursAgo, days: t.daysAgo });

  return (
    <TornPanel
      seed={5288}
      depth={15.4}
      frequency={0.0775}
      bleed={7.7}
      className={cn("w-[26rem] shrink-0", TINT[note.tint], className)}
    >
      <article className="relative px-8 pt-6.5 pb-6.5">
        <header className="flex items-center gap-2.5">
          <span className="bg-gild grid size-8 shrink-0 place-items-center rounded-full">
            <Image
              src="/assets/ornaments/user.svg"
              alt={t.avatarAlt.replace("{name}", note.author)}
              width={20}
              height={20}
              className="size-4.5 select-none"
            />
          </span>
          <p className="text-graphite font-body text-body leading-none">{note.author}</p>
        </header>

        <p className="font-hand text-ink mt-6.5 text-[1.0625rem] leading-[1.5625rem]">{note.body}</p>

        <footer className="mt-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onLike(note.id)}
            aria-pressed={liked}
            aria-label={liked ? t.liked : t.like}
            // A drag that starts on the button must still pan; the wall decides
            // from movement whether this was a click - see CommunityWall.
            className={cn(
              // `text-[0.875rem]`, not `text-body-sm`: inside cn() twMerge takes the
              // size token for a colour and drops one of the two (the
              // BracketButton lesson).
              // The press squashes a touch; the glyph pops when a like lands
              // (`like-pop` in globals.css, keyed off aria-pressed).
              "font-body text-graphite focus-visible:outline-signal ease-gate flex cursor-pointer items-center gap-2 text-[0.875rem] leading-none transition-[color,scale] duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2",
              liked && "text-signal",
            )}
          >
            <ThumbGlyph filled={liked} />
            <span aria-hidden>{new Intl.NumberFormat("en-NG").format(note.likes + (liked ? 1 : 0))}</span>
          </button>
          {/* Relative, so it is computed at render: a page prerendered at build
              hydrates against a client that computes a later value, and React
              would log the mismatch on every note. The client's value wins. */}
          <time dateTime={note.postedAt} suppressHydrationWarning className="text-graphite font-body text-[0.75rem] leading-none">
            {time}
          </time>
        </footer>
      </article>
    </TornPanel>
  );
});

/** The four papers, as `text-*` tokens for TornPanel's `currentColor` fill. */
const TINT: Record<NoteTint, string> = {
  cream: "text-note-cream",
  mint: "text-note-mint",
  sky: "text-note-sky",
  rose: "text-note-rose",
};

/**
 * The thumbs-up, drawn - no icon was delivered. 16 square, a 1.5 stroke,
 * filled when the visitor has liked the note. FLAGGED like the other drawn
 * glyphs (the profile's, the points chevron).
 */
function ThumbGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="like-glyph size-4 shrink-0"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M2 7.2h2.6v6.6H2zM4.6 7.6l3-5.4c.9 0 1.7.6 1.7 1.6v2.6h3.3c.9 0 1.5.8 1.3 1.6l-1 4.6c-.2.7-.8 1.2-1.5 1.2H4.6" />
    </svg>
  );
}
