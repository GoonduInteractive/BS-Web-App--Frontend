"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ShareMarks } from "@/components/ui/ShareMarks";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue } from "@/types/merch";


export function ComicReader({
  issue,
  title,
  messages,
  locale,
}: {
  issue: ComicIssue;
  title: string;
  messages: Messages;
  locale: Locale;
}) {
  const t = messages.comics.reader;
  const [copied, setCopied] = useState(false);

  return (
    <>
      <div className="bg-ink/60 fixed inset-x-0 top-0 z-40 px-5 pt-5.75 backdrop-blur-md md:px-7">
        <div className="bg-ash flex h-25.75 flex-col justify-center gap-3.5 px-5.25 md:h-23.25 md:flex-row md:items-center md:justify-between md:gap-4 md:px-25">
          <div className="flex flex-col items-start gap-3.5 md:flex-row md:items-center md:gap-4.5">
            <Link
              href={`/${locale}/comics`}
              className="text-ink font-body focus-visible:outline-signal inline-flex h-6 items-center gap-2 bg-[url('/assets/ornaments/back-chip.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-3 text-[0.8125rem] leading-none font-semibold tracking-[0.04em] focus-visible:outline-2 focus-visible:outline-offset-4 md:h-7.75"
            >
              <ArrowLeft aria-hidden className="h-3 w-2.5 select-none" />
              {t.back}
            </Link>

            <h1 className="font-display text-menu-fg text-[36px] leading-none font-semibold tracking-tighter uppercase">
              {title}
            </h1>
          </div>

          <div className="hidden items-center gap-4.5 md:flex">
            <span className="text-menu-fg font-body text-body-sm leading-none tracking-[0.02em] uppercase">
              {copied ? t.share.copied : t.shareVia}
            </span>
            <ShareMarks
              title={title}
              labels={t.share}
              className="gap-4"
              markClassName="size-6"
              feedback="none"
              onCopied={() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[65.75rem] px-4.5 pt-42.5 pb-20 md:px-0 md:pt-40.25">
        {issue.pages.map((page, i) => (
          <div key={`${page}-${i}`} className="relative mt-1.5 first:mt-0 md:mt-6.25">
            <Image
              src={page}
              alt={t.pageAlt.replace("{title}", title).replace("{n}", String(i + 1))}
              width={1581}
              height={2768}
              priority={i === 0}
              sizes="(max-width: 1023px) 100vw, 1000px"
              className="h-auto w-full select-none"
            />
          </div>
        ))}
      </div>
    </>
  );
}
