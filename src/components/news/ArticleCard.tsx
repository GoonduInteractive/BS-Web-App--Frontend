import Image from "next/image";
import Link from "next/link";

import { ComicBanner } from "@/components/merch/ComicBanner";
import { TagPills, relativeDate } from "@/components/news/ArticleMeta";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Article } from "@/types/news";
import type { ComicIssue } from "@/types/merch";

/**
 * One article card. Figma: `context/design/08-news/News.png`.
 *
 * Three sizes, all the same anatomy — media, title with the date beside it, tag
 * pills, excerpt — differing only in the media's aspect and the title's size:
 *
 *   lead   735 x 571 media (1.29), title ~31px    the index's left column
 *   wide   519 x 235 media (2.21), title ~25px    the two beside it
 *   grid   410 x 236 media (1.74), title ~25px    MORE NEWS, and the detail row
 *
 * TWO CARDS CARRY A COMIC INSTEAD OF A PHOTOGRAPH, and the frame draws them in
 * the LANDSCAPE composition rather than the portrait cover — band and title
 * left, a vertical torn edge, the figure beside it. `ComicBanner` is that
 * composition; `ArticleMedia` is a union so a card can hold either.
 */
const MEDIA: Record<CardSize, string> = {
  lead: "aspect-[735/571]",
  wide: "aspect-[519/235]",
  grid: "aspect-[410/236]",
};

const TITLE: Record<CardSize, string> = {
  lead: "text-[1.9375rem]",
  wide: "text-[1.5625rem]",
  grid: "text-[1.5625rem]",
};

export type CardSize = "lead" | "wide" | "grid";

export function ArticleCard({
  article,
  comics,
  messages,
  locale,
  size = "grid",
  priority = false,
}: {
  article: Article;
  /** Only needed when an article's media is a comic cover. */
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
  size?: CardSize;
  priority?: boolean;
}) {
  const t = messages.news;
  const copy = t.articles[article.copyKey as keyof typeof t.articles];

  return (
    <article>
      <Link
        href={`/${locale}/news/${article.slug}`}
        className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className={`relative w-full overflow-hidden ${MEDIA[size]}`}>
          <ArticleMediaView
            article={article}
            comics={comics}
            messages={messages}
            alt={copy.imageAlt}
            priority={priority}
          />
        </div>

        <div className="mt-4.25 flex items-start justify-between gap-6">
          <h3
            className={`font-display text-menu-fg leading-[1.15] font-semibold tracking-[-0.03em] uppercase ${TITLE[size]}`}
          >
            {copy.title}
          </h3>
          <p className="text-menu-fg/85 font-body mt-1 shrink-0 text-[0.6875rem] leading-none tracking-[0.06em] uppercase">
            {relativeDate(article.published, messages)}
          </p>
        </div>

        <TagPills tags={article.tags} messages={messages} className="mt-4.5" />

        {/* The frame clips the excerpt rather than wrapping it indefinitely —
            three lines on the lead card, two on the others. */}
        <p
          className={`text-menu-fg/85 font-body text-body-sm mt-5.5 leading-[1.4375rem] ${
            size === "lead" ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {copy.excerpt}
        </p>
      </Link>
    </article>
  );
}

export function ArticleMediaView({
  article,
  comics,
  messages,
  alt,
  priority = false,
  body = false,
}: {
  article: Article;
  comics: readonly ComicIssue[];
  messages: Messages;
  alt: string;
  priority?: boolean;
  body?: boolean;
}) {
  const media = body ? (article.bodyMedia ?? article.media) : article.media;

  if (media.kind === "comic") {
    const issue = comics.find((c) => c.slug === media.slug);
    // The cover is composed, so a missing issue means no media rather than a
    // broken image. Nothing is substituted.
    if (!issue) return null;
    return (
      <div className="absolute inset-0 overflow-hidden">
        <ComicBanner issue={issue} messages={messages} priority={priority} />
      </div>
    );
  }

  return (
    <Image
      src={media.src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 33vw"
      className="object-cover object-[50%_38%] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}
