"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * The explainer's GOOD TO KNOW as questions that open (Sophia, 2026-11-23:
 * "converted to an FAQ accordion for better readability").
 *
 * Laid out as the right-hand column beside the section's heading (the page
 * puts the two side by side), so it runs the width of the page rather than
 * leaving a column empty (the human, 2026-11-23). Each question is a numbered
 * row between hairlines - 01 in gild, the question in the display face - and
 * opens under itself, the answer set in line with the question. A plus turns
 * into a cross when open. One open at a time; the first starts open, so the
 * section never reads as a closed list.
 *
 * No frame draws it: the site's display and body faces, its gild and its
 * grid-rows opening (the tournament accordion's). A `button` with
 * `aria-expanded` over the region it controls, inside a heading.
 */
export function HederaFaq({ items }: { items: readonly { id: string; question: string; answer: string }[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const base = useId();

  return (
    <ul className="border-menu-fg/15 border-t">
      {items.map((item, i) => {
        const on = open === item.id;
        const panelId = `${base}-${item.id}`;
        return (
          <li key={item.id} className="border-menu-fg/15 border-b">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={panelId}
                onClick={() => setOpen(on ? null : item.id)}
                className="group focus-visible:outline-signal flex w-full cursor-pointer items-center gap-5 py-6 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 md:gap-8 md:py-7"
              >
                <span aria-hidden className="font-display text-gild w-9 shrink-0 text-[1.375rem] leading-none font-semibold tracking-[-0.02em] md:w-11 md:text-[1.75rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-display ease-gate flex-1 text-[1.5rem] leading-[1.05] font-semibold tracking-[-0.03em] uppercase transition-colors duration-200 md:text-[2rem]",
                    on ? "text-menu-fg" : "text-menu-fg/80 group-hover:text-menu-fg",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "ease-gate grid size-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 md:size-10",
                    on ? "bg-gild border-gild text-ink rotate-45" : "border-menu-fg/35 text-menu-fg group-hover:border-menu-fg",
                  )}
                >
                  <Plus className="size-4.5" strokeWidth={1.75} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-label={item.question}
              inert={!on}
              className={cn("ease-gate grid transition-[grid-template-rows] duration-400", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                {/* Not cn(): tailwind-merge reads text-body as a colour and would drop text-menu-fg/85. */}
                <p
                  className={`text-menu-fg/85 font-body text-body ease-gate max-w-[40rem] pr-14 pb-7 pl-14 transition-[opacity,translate] duration-400 md:pl-19 ${
                    on ? "translate-y-0 opacity-100 delay-75" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
