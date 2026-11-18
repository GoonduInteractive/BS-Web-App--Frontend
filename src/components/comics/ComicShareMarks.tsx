"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComponentProps } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ShareMarks } from "@/components/ui/ShareMarks";
import { getShareLink } from "@/lib/api/library";

/**
 * A chapter's share marks. Signed in, they share the player's own link to
 * it, which earns them Seeds when a friend reads through it; read ahead, so a
 * tap opens the share at once. Signed out, or before the link arrives, they
 * share the page's address, as everywhere else.
 */
export function ComicShareMarks({
  chapterId,
  ...marks
}: Omit<ComponentProps<typeof ShareMarks>, "url"> & { chapterId?: string }) {
  const { status } = useAuth();
  const link = useQuery({
    queryKey: ["comics", "share-link", chapterId],
    queryFn: () => getShareLink(chapterId!),
    enabled: status === "signed-in" && Boolean(chapterId),
    staleTime: Infinity,
    retry: false,
  });
  return <ShareMarks {...marks} url={link.data} />;
}
