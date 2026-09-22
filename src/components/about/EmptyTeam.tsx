import { Users } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import type { Messages } from "@/lib/utils/messages";

/**
 * The team band before the first person is published. The Coming Soon lines
 * again, and a group of people for the glyph. No CTA: this sits inside the
 * About page under THE TEAM heading, between the story and the footer, and a
 * BACK TO HOME button in the middle of a page would point nowhere useful.
 */
export function EmptyTeam({ messages }: { messages: Messages }) {
  const t = messages.comingSoon;
  return <EmptyState icon={Users} title={t.title} body={t.body} className="mt-14 xl:mt-23" />;
}
