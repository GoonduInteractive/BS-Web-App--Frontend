import { ComicShareMarks } from "@/components/comics/ComicShareMarks";
import type { Messages } from "@/lib/utils/messages";

/**
 * SHARE THIS COMIC, under the reader's last page. Figma: `09-comics/Comics
 * Detail.png` and `comic-detail-mobile.png` (2026-09-15): a 33px heading, two
 * centred body lines with a hard break after "points", and the five marks
 * (`ShareMarks`) - 40px slots on a 76 pitch at 1440, 32 on 66 on the phone.
 * The SUBSCRIBE button the earlier frame drew is gone with this one.
 *
 * The points the copy promises are Seeds: the marks share the player's own
 * link to the chapter (`ComicShareMarks`), and friends reading through it
 * earn them.
 */
export function ShareComic({ title, chapterId, messages }: { title: string; chapterId?: string; messages: Messages }) {
  const t = messages.comics.reader;

  return (
    <section aria-labelledby="comic-share-heading" className="flex flex-col items-center px-6 text-center">
      <h2
        id="comic-share-heading"
        className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.06em] uppercase"
      >
        {t.shareHeading}
      </h2>
      {/* #cacccf on both frames - the white at 80%, the pills' grey elsewhere. */}
      <p className="text-menu-fg/80 font-body text-body mt-3 whitespace-pre-line">{t.shareSub}</p>

      <ComicShareMarks
        chapterId={chapterId}
        title={title}
        labels={t.share}
        className="mt-9.5 justify-center gap-[2.125rem] md:gap-9"
        markClassName="size-8 md:size-10"
      />
    </section>
  );
}
