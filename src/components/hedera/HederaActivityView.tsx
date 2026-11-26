"use client";

import { History } from "lucide-react";

import { ActivityList } from "@/components/hedera/ActivityList";
import { PANEL } from "@/components/hedera/styles";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHederaActivity } from "@/hooks/useHedera";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/** Hedera activity (the doc's screen 14): every purchase, claim, prize and refund. States: empty, list. */
export function HederaActivityView({ messages, locale }: { messages: Messages; locale: Locale }) {
  const t = messages.hedera.activity;
  const activity = useHederaActivity();

  if (activity.isPending) return <div aria-busy className="h-64" />;
  if (!activity.data?.length) {
    return <EmptyState icon={History} title={t.empty.title} body={t.empty.body} cta={{ href: `/${locale}/hedera/store`, label: t.empty.cta }} className="pt-10" />;
  }
  return (
    <section className={PANEL}>
      <ActivityList rows={activity.data} messages={messages} locale={locale} />
    </section>
  );
}
