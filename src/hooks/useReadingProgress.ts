"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type RefObject } from "react";

import { MY_PROFILE } from "@/hooks/useMyProfile";
import { MY_SEEDS } from "@/hooks/useSeeds";
import { ApiError } from "@/lib/api/client";
import { reportReading, reportReadingOnLeave } from "@/lib/api/library";

/** The API's heartbeat is about thirty seconds. */
const REPORT_EVERY = 30_000;

/**
 * Reports a chapter being read, which is what earns Seeds for it: the
 * furthest page reached and the seconds actually spent reading, every thirty
 * seconds and when the tab is hidden or the reader left.
 *
 * - A page is an element under `container` carrying `data-page` (1-based). It
 *   counts as reached once its top passes the middle of the screen.
 * - A second counts while the tab is in view and focused and the pages aren't
 *   covered (`paused`, the capture shield): an open tab nobody reads earns nothing.
 *
 * Once the API says the chapter is completed there is nothing left to report.
 * A refusal (not their chapter, the session over) stops the reports too; a
 * failed connection keeps its seconds for the next one.
 */
export function useReadingProgress({
  chapterId,
  container,
  pageCount,
  paused,
}: {
  chapterId: string | undefined;
  container: RefObject<HTMLElement | null>;
  pageCount: number;
  paused: boolean;
}) {
  const queryClient = useQueryClient();
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const root = container.current;
    if (!chapterId || !root || pageCount === 0) return;

    let furthest = 0;
    let reportedPage = 0;
    let seconds = 0;
    let done = false;
    let sending = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) furthest = Math.max(furthest, Number((entry.target as HTMLElement).dataset.page) || 0);
        }
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    root.querySelectorAll<HTMLElement>("[data-page]").forEach((page) => observer.observe(page));

    const clock = window.setInterval(() => {
      if (!pausedRef.current && document.visibilityState === "visible" && document.hasFocus()) seconds += 1;
    }, 1000);

    const report = (leaving = false) => {
      const page = Math.max(furthest, 1);
      if (done || (sending && !leaving) || (seconds === 0 && page <= reportedPage)) return;
      const progress = { page, seconds };
      seconds = 0;
      if (leaving) {
        // The tab is hidden or closing: a request that outlives the page, and no answer to wait for.
        reportedPage = page;
        reportReadingOnLeave(chapterId, progress);
        return;
      }
      sending = true;
      reportReading(chapterId, progress)
        .then(({ completed, seedsEarned }) => {
          reportedPage = progress.page;
          if (completed) done = true;
          if (seedsEarned > 0) {
            void queryClient.invalidateQueries({ queryKey: MY_SEEDS });
            void queryClient.invalidateQueries({ queryKey: MY_PROFILE });
          }
        })
        .catch((e: unknown) => {
          if (e instanceof ApiError && e.status >= 400 && e.status < 500) done = true;
          else seconds += progress.seconds;
        })
        .finally(() => {
          sending = false;
        });
    };

    const every = window.setInterval(report, REPORT_EVERY);
    // A hidden tab, or a page being left (`pagehide` is the one every browser fires on the way
    // out). Whichever comes first reports; the other finds nothing new to say.
    const onHide = () => {
      if (document.visibilityState === "hidden") report(true);
    };
    const onLeave = () => report(true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onLeave);

    return () => {
      report();
      observer.disconnect();
      window.clearInterval(clock);
      window.clearInterval(every);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onLeave);
    };
  }, [chapterId, container, pageCount, queryClient]);
}
