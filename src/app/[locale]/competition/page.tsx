import type { Metadata } from "next";

import { GatePage, gateMetadata } from "@/components/gates/GatePage";

/** Ọnụ Ụzọ 4 — Competition. Figma: context/design/02-gates/. */
export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return gateMetadata("competition", params);
}

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GatePage id="competition" params={params} />;
}
