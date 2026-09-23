import Image from "next/image";
import Link from "next/link";

import { TagPills, relativeDate } from "@/components/news/ArticleMeta";
import { BAND, BAND_FIELD, seedFor } from "@/components/news/bands";
import { TornBanner } from "@/components/ui/TornBanner";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Article, ArticleCover } from "@/types/news";

/**
 * One article card. Figma: `context/design/08-news/News.png`.
 *
 * Three sizes, all the same anatomy - cover, title with the date beside it, tag
 * pills, excerpt - differing only in the cover's aspect and the title's size:
 *
 *   lead   735 x 571 cover (1.29), title ~31px    the index's left column
 *   wide   519 x 235 cover (2.21), title ~25px    the two beside it
 *   grid   410 x 236 cover (1.74), title ~25px    MORE NEWS, and the detail row
 *
 * THE COVER IS THE ADMIN'S CHOICE, per article, in the CMS: the picture full
 * bleed, or the frame's torn banner - a coloured band carrying a volume tag,
 * the title and an author line, torn vertically, with the picture beside it.
 * `ArticleCover` is that union; `CoverView` draws either.
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
  messages,
  locale,
  size = "grid",
  priority = false,
}: {
  article: Article;
  messages: Messages;
  locale: Locale;
  size?: CardSize;
  priority?: boolean;
}) {
  return (
    <article>
      <Link
        href={`/${locale}/news/${article.slug}`}
        className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div className={`relative w-full overflow-hidden ${MEDIA[size]}`}>
          <CoverView
            cover={article.cover}
            alt={article.imageAlt}
            author={article.author}
            seed={seedFor(article.slug)}
            priority={priority}
          />
        </div>

        <div className="mt-4.25 flex items-start justify-between gap-6">
          <h3
            className={`font-display text-menu-fg leading-[1.15] font-semibold tracking-[-0.03em] uppercase ${TITLE[size]}`}
          >
            {article.title}
          </h3>
          <p className="text-menu-fg/85 font-body mt-1 shrink-0 text-[0.6875rem] leading-none tracking-[0.06em] uppercase">
            {relativeDate(article.published, messages)}
          </p>
        </div>

        <TagPills tags={article.tags} messages={messages} className="mt-4.5" />

        {/* The frame clips the excerpt rather than wrapping it indefinitely -
            three lines on the lead card, two on the others. */}
        <p
          className={`text-menu-fg/85 font-body text-body-sm mt-5.5 leading-[1.4375rem] ${
            size === "lead" ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {article.excerpt}
        </p>
      </Link>
    </article>
  );
}

/** The cover, in a box the caller has already sized. */
export function CoverView({
  cover,
  alt,
  author,
  seed,
  priority = false,
}: {
  cover: ArticleCover;
  alt: string;
  /** The line at the foot of a torn band. Absent draws none. */
  author?: string;
  seed: number;
  priority?: boolean;
}) {
  if (cover.kind === "torn") {
    const band = BAND[cover.band];
    return (
      <div className="absolute inset-0 overflow-hidden">
        <TornBanner
          figure={cover.src}
          alt={alt}
          // Whole, on the dark field, as the frame shows its renders - a picture
          // with its own dark ground reads the same; a padded render sits smaller.
          figureClass="object-contain object-[76%_center]"
          seamClass={band.seam}
          fieldClass={BAND_FIELD}
          chipClass={band.chip}
          volume={cover.volume}
          title={cover.title}
          author={author}
          seed={seed}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <Image
      src={cover.src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 33vw"
      className="object-cover object-[50%_38%] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}

/** A plain picture in a box the caller has already sized - the detail page's second image. */
export function BodyImage({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill sizes="(max-width: 1023px) 92vw, 60vw" className="object-cover object-[50%_38%]" />;
}
