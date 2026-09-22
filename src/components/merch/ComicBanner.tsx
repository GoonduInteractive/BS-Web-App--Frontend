import { TornBanner } from "@/components/ui/TornBanner";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";

/**
 * A comic issue as a LANDSCAPE banner — `TornBanner` fed from the issue's
 * cover parts and its copy in `messages.merch.comics`. The composition itself
 * (band, vertical tear, figure) lives in `TornBanner`, which the news cards
 * also draw from CMS fields; this is only the mapping.
 *
 * The render carries transparent padding, so contain leaves the figure short
 * of the banner's height. The scale closes that; it rides on the `scale`
 * property, which is separate from `transform` in v4.
 */
export function ComicBanner({
  issue,
  messages,
  priority = false,
}: {
  issue: ComicIssue;
  messages: Messages;
  priority?: boolean;
}) {
  const t = messages.merch.comics;
  const copy = t.issues[issue.copyKey as keyof typeof t.issues];
  const { cover } = issue;

  return (
    <TornBanner
      figure={cover.figure}
      alt={copy.coverAlt}
      figureClass="scale-[1.28] object-contain object-[76%_center]"
      seamClass={cover.seam}
      fieldClass={cover.field}
      chipClass={cover.chip}
      volume={copy.volume}
      title={copy.coverTitle}
      author={t.partner}
      seed={issue.volume * 913}
      priority={priority}
    />
  );
}
