import type { Metadata } from "next";

import { GatePage, gateMetadata } from "@/components/gates/GatePage";

/** Ọnụ Ụzọ 3 — Community. Figma: context/design/02-gates/. */
export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return gateMetadata("community", params);
}

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GatePage id="community" params={params} />;
}
