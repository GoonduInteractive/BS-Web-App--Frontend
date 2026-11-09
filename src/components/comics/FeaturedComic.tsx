import Link from "next/link";

import { ComicCover } from "@/components/merch/ComicCover";
import type { Locale } from "@/lib/utils/locales";
import { ReadButton } from "@/components/comics/ReadButton";
import { comicLabel } from "@/lib/utils/comic-sales";
import { issueSynopsis } from "@/lib/utils/merch-copy";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";

export function FeaturedComic({
  issue,
  messages,
  locale,
}: {
  issue: ComicIssue;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.comics;
  const synopsis = issueSynopsis(issue);
  const href = issueHref(issue, locale);

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[47.5%_37.8%] lg:justify-between lg:gap-0 lg:pr-[15.2%] lg:pl-[17.1%]">
      <div className="relative max-md:mx-0.5">
        <CornerMarks />
        <Link
          href={href}
          className="focus-visible:outline-signal block transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ComicCover issue={issue} messages={messages} priority size="cover" />
        </Link>
      </div>

      <div className="lg:pt-18.5">
        {synopsis.length > 0 ? (
          <div>
            {synopsis.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 24)}
                className={`text-menu-fg/85 font-body text-body leading-6.25 ${i ? "mt-6" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {/* START READING for whoever can read it, else GET THIS COMIC (`ReadButton`). */}
        <ReadButton issue={issue} label={t.startReading} getLabel={t.getComic} locale={locale} className="mt-12.75 -ml-0.75" />
      </div>
    </div>
  );
}

/** Where a cover opens: its store page. Whoever owns the chapter reads it through START READING. */
function issueHref(issue: ComicIssue, locale: Locale): string {
  return `/${locale}/merch/comics/${issue.slug}`;
}

const CORNERS = [
  { side: "top-left", box: "border-t-2 border-l-2", a: "-top-[22px] -left-[26px]", b: "-top-[28px] -left-[20px]" },
  { side: "top-right", box: "border-t-2 border-r-2", a: "-top-[22px] -right-[26px]", b: "-top-[28px] -right-[20px]" },
  { side: "bottom-left", box: "border-b-2 border-l-2", a: "-bottom-[22px] -left-[26px]", b: "-bottom-[28px] -left-[20px]" },
  { side: "bottom-right", box: "border-b-2 border-r-2", a: "-bottom-[22px] -right-[26px]", b: "-bottom-[28px] -right-[20px]" },
] as const;

function CornerMarks() {
  return (
    <>
      {CORNERS.map((c) => (
        <span key={c.side} aria-hidden>
          <span className={`border-menu-fg/30 absolute z-10 h-7.75 w-9.25 ${c.box} ${c.a}`} />
          <span className={`border-menu-fg/30 absolute z-10 h-7.75 w-9.25 ${c.box} ${c.b}`} />
        </span>
      ))}
    </>
  );
}

/** The EXPLORE MORE COMICS grid, shown only when there is more than one issue. */
export function ExploreComics({
  issues,
  messages,
  locale,
}: {
  issues: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.comics;

  return (
    <section className="pt-24 pb-28 md:pt-63.75 md:pb-63.75">
      <h2 className="font-display text-menu-fg text-center text-[2.5rem] leading-none font-semibold tracking-[-0.045em] uppercase md:text-[4.9375rem]">
        {t.explore}
      </h2>

      {/* 1021 wide and centred, not the full 1280 container: the frame draws
          four 238-wide covers with 23px gutters. */}
      <ul className="mx-auto mt-12 grid max-w-255.25 grid-cols-1 gap-x-5.75 gap-y-37.25 sm:grid-cols-2 lg:mt-15.25 lg:grid-cols-4">
        {issues.map((issue, i) => {
          const copy = issue.copy;
          return (
            <li key={`${issue.slug}-${i}`}>
              <Link
                href={issueHref(issue, locale)}
                className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <ComicCover issue={issue} messages={messages} size="card" />
                <h3 className="font-display text-menu-fg mt-4.5 text-h7 leading-none font-semibold tracking-[-0.02em] uppercase">
                  {copy.title}
                </h3>
                <p className="text-menu-fg/85 font-body mt-2 text-[0.8125rem] leading-none">
                  {comicLabel(issue, messages)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
