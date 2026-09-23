import { ShareMarks } from "@/components/ui/ShareMarks";
import type { Messages } from "@/lib/utils/messages";

/**
 * SHARE VIA, at the foot of an article's body. Figma: `08-news/News Details.png`
 * (2026-09-15) - the heading at 31px Teko, then the five marks in a row
 * (`ShareMarks`): 40px slots on a 76 pitch at 1440, 22 on 54 on the phone
 * frame, where the heading is 24px.
 */
export function ShareArticle({ title, messages, className }: { title: string; messages: Messages; className?: string }) {
  const t = messages.news.share;

  return (
    <section aria-labelledby="article-share-heading" className={className}>
      <h2
        id="article-share-heading"
        className="font-display text-menu-fg text-h5 leading-none font-semibold tracking-[-0.03em] uppercase lg:text-[1.9375rem]"
      >
        {t.heading}
      </h2>

      <ShareMarks title={title} labels={t} className="mt-5 gap-8 lg:mt-10 lg:gap-9" markClassName="size-5.5 lg:size-10" />
    </section>
  );
}
