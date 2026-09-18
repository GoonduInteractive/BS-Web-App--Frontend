"use client";

import Image from "next/image";
import { useState } from "react";

import { ArticleCard } from "@/components/news/ArticleCard";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { Article } from "@/types/news";
import type { ComicIssue } from "@/types/merch";


const PAGE = 6;


export function LoadMore({
  articles,
  comics,
  messages,
  locale,
}: {
  articles: readonly Article[];
  comics: readonly ComicIssue[];
  messages: Messages;
  locale: Locale;
}) {
  const [shown, setShown] = useState(PAGE);
  const visible = articles.slice(0, shown);
  const more = shown < articles.length;

  return (
    <>
      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:mt-8.75 lg:grid-cols-3">
        {visible.map((article) => (
          <li key={article.slug}>
            <ArticleCard
              article={article}
              comics={comics}
              messages={messages}
              locale={locale}
            />
          </li>
        ))}
      </ul>

      {more ? (
        <div className="mt-16 flex justify-center md:mt-13.75">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="focus-visible:outline-signal group flex cursor-pointer flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-8"
          >
            <Image
              src="/assets/ornaments/arrow.svg"
              alt=""
              aria-hidden
              width={24}
              height={30}
              className="scroll-cue-bob text-menu-fg transition-[translate] duration-200 ease-gate group-hover:translate-y-1"
            />
            <span className="text-menu-fg font-display text-body-sm font-semibold tracking-widest">
              {messages.news.loadMore}
            </span>
          </button>
        </div>
      ) : null}
    </>
  );
}
