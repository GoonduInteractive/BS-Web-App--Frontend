import { cn } from "@/lib/utils/cn";
import type { Messages } from "@/lib/utils/messages";

/**
 * "Need support?" - where to write for payment disputes, account issues and
 * the rest. Added across the account and store screens in
 * `context/design/new-updates` (2026-09-26), in three arrangements:
 *
 * - `stacked`: the title, the sentence, and the address on a line of its own,
 *   under the checkout's order summary.
 * - `inline`: the title to the left of the sentence, the address closing it,
 *   centred under the transfer sheet. A stack below `md`.
 * - `plain`: the sentence and address only, no title, on the profile card.
 *
 * Measured off the 1440 frames: the title Teko 17 on its own line; the sentence
 * Host Grotesk 14 on a 23 pitch, wrapping at about 400; 25 between title and
 * sentence in the inline row.
 */
export function SupportNote({
  messages,
  layout,
  className,
}: {
  messages: Messages;
  layout: "stacked" | "inline" | "plain";
  className?: string;
}) {
  const t = messages.support;
  const email = (
    <a
      href={`mailto:${t.email}`}
      className="text-menu-fg focus-visible:outline-signal font-semibold transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {t.email}
    </a>
  );
  const title = (
    <h2 className="font-display text-menu-fg shrink-0 text-[1.0625rem] leading-none font-semibold tracking-[0.01em] uppercase">
      {t.title}
    </h2>
  );

  if (layout === "stacked") {
    return (
      <div className={className}>
        {title}
        <p className="text-menu-fg/85 font-body text-body-sm mt-2.25 max-w-100 leading-[1.4375rem]">{t.body}</p>
        <p className="font-body text-body-sm mt-6.5 leading-none">{email}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        layout === "inline" && "flex flex-col items-center gap-3 text-center md:flex-row md:items-start md:justify-center md:gap-6 md:text-left",
        className,
      )}
    >
      {layout === "inline" && <div className="md:pt-1">{title}</div>}
      <p className="text-menu-fg/85 font-body text-body-sm max-w-100 leading-[1.4375rem]">
        {t.body} {email}
      </p>
    </div>
  );
}
