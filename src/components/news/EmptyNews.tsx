import { Newspaper } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The News page before the first article is published. The Coming Soon page's
 * lines, since no news-specific copy exists and none is invented, and a
 * newspaper for the glyph. See `EmptyState`.
 */
export function EmptyNews({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.comingSoon;
  return (
    <EmptyState
      icon={Newspaper}
      title={t.title}
      body={t.body}
      cta={{ href: `/${locale}`, label: t.cta }}
      className="pt-14 md:pt-29.5"
    />
  );
}
