import type { Messages } from "@/lib/utils/messages";
import type { ArticleTag } from "@/types/news";


export function relativeDate(published: string, messages: Messages): string {
  const t = messages.news;
  const then = new Date(published);
  if (Number.isNaN(then.getTime())) return "";

  const days = Math.max(0, Math.round((Date.now() - then.getTime()) / 86_400_000));
  return days === 0 ? t.relativeToday : t.relativeDays.replace("{n}", String(days));
}

export function TagPills({
  tags,
  messages,
  className = "",
  outline = "menu",
}: {
  tags: readonly ArticleTag[];
  messages: Messages;
  className?: string;
  /**
   * The ring. The index frame draws it in the page's white at 40%; the two
   * article frames (2026-09-15) draw it in --color-linen, exactly.
   */
  outline?: "menu" | "linen";
}) {
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={`${outline === "linen" ? "border-linen" : "border-menu-fg/40"} text-menu-fg font-body inline-flex h-6.5 items-center rounded-full border px-3 text-[0.625rem] leading-none tracking-[0.06em]`}
        >
          {messages.news.tags[tag]}
        </li>
      ))}
    </ul>
  );
}
