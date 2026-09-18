import Link from "next/link";

import { ComicCover } from "@/components/merch/ComicCover";
import { BracketButton } from "@/components/ui/BracketButton";
import type { Locale } from "@/lib/utils/locales";
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
  const synopsis = t.synopsis[issue.copyKey as keyof typeof t.synopsis];

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[47.5%_37.8%] lg:justify-between lg:gap-0 lg:pr-[15.2%] lg:pl-[17.1%]">
      <div className="relative max-md:mx-0.5">
        <CornerMarks />
        <ComicCover issue={issue} messages={messages} priority size="cover" />
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

        {issue.pages.length > 0 ? (
          <div className="mt-12.75 -ml-0.75">
            <BracketButton
              href={`/${locale}/comics/${issue.slug}`}
              className="px-5.75 py-[1.22rem] text-body tracking-normal"
            >
              {t.startReading}
            </BracketButton>
          </div>
        ) : null}
      </div>
    </div>
  );
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
  const c = messages.merch.comics;

  return (
    <section className="pt-24 pb-28 md:pt-63.75 md:pb-63.75">
      <h2 className="font-display text-menu-fg text-center text-[2.5rem] leading-none font-semibold tracking-[-0.045em] uppercase md:text-[4.9375rem]">
        {t.explore}
      </h2>

      {/* 1021 wide and centred, not the full 1280 container: the frame draws
          four 238-wide covers with 23px gutters. */}
      <ul className="mx-auto mt-12 grid max-w-255.25 grid-cols-1 gap-x-5.75 gap-y-37.25 sm:grid-cols-2 lg:mt-15.25 lg:grid-cols-4">
        {issues.map((issue, i) => {
          const copy = c.issues[issue.copyKey as keyof typeof c.issues];
          return (
            <li key={`${issue.slug}-${i}`}>
              <Link
                href={
                  issue.pages.length > 0
                    ? `/${locale}/comics/${issue.slug}`
                    : `/${locale}/merch/comics/${issue.slug}`
                }
                className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <ComicCover issue={issue} messages={messages} size="card" />
                <h3 className="font-display text-menu-fg mt-4.5 text-h7 leading-none font-semibold tracking-[-0.02em] uppercase">
                  {copy.title}
                </h3>
                <p className="text-menu-fg/85 font-body mt-2 text-[0.8125rem] leading-none">
                  {copy.format}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
