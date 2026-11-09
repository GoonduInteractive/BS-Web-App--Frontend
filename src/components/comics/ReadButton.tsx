"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/AuthProvider";
import { BracketButton } from "@/components/ui/BracketButton";
import { getLibrary } from "@/lib/api/library";
import type { Locale } from "@/lib/utils/locales";
import type { ComicIssue } from "@/types/merch";

/** The library's cache key: the reader and this button share it. */
export const LIBRARY = ["comics", "library"] as const;

/**
 * START READING, for a chapter the visitor can read: one the signed-in player
 * owns (their library, `/v1/comics`).
 * Anyone else gets GET THIS COMIC, to the chapter's store page. Nothing shows
 * until that's known, so a player who owns it never sees the wrong one first.
 */
export function ReadButton({
  issue,
  label,
  getLabel,
  locale,
  className,
}: {
  issue: ComicIssue;
  label: string;
  getLabel: string;
  locale: Locale;
  className?: string;
}) {
  const { status } = useAuth();
  const library = useQuery({ queryKey: LIBRARY, queryFn: getLibrary, enabled: status === "signed-in" });
  const known = status === "signed-out" || library.isSuccess || library.isError;
  if (!known) return null;
  const readable = library.data?.has(issue.slug) === true;

  return (
    <div className={className}>
      <BracketButton
        href={readable ? `/${locale}/comics/${issue.slug}` : `/${locale}/merch/comics/${issue.slug}`}
        className="px-5.75 py-[1.22rem] text-body tracking-normal"
      >
        {readable ? label : getLabel}
      </BracketButton>
    </div>
  );
}
