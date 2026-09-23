import { BracketButton } from "@/components/ui/BracketButton";
import { DOWNLOAD_GAME_URL } from "@/lib/links";

/**
 * DOWNLOAD GAME → the itch.io page, in a new tab. Per the human (2026-09-19)
 * this stands in for EVERY CTA on The Game and The Characters pages for now -
 * WATCH TRAILER, the story's and the summons' JOIN THE TRIAL, EXPLORE
 * CHARACTERS, the Characters hero's and MORE CHAMPIONS' JOIN THE TRIAL. Each
 * section renders this where its own button was, with its own dressing
 * (`className`, `field`, `tone`), so the frame's geometry holds and the old
 * button is one swap away. The frame's labels stay in the message files.
 *
 * A new tab because it leaves the site for a store - the visitor keeps their
 * place here. Our call; FLAGGED.
 */
export function DownloadGameButton({
  label,
  className,
  field,
  tone,
}: {
  /** `messages.site.downloadCta`. */
  label: string;
  className?: string;
  field?: "dark" | "light";
  tone?: "signal" | "ink" | "outline" | "ghost";
}) {
  return (
    <BracketButton href={DOWNLOAD_GAME_URL} field={field} tone={tone} className={className}>
      {label}
    </BracketButton>
  );
}
