"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { openShare, type ShareNetwork } from "@/lib/utils/share";

/**
 * The five share marks - Facebook, WhatsApp, X, Instagram, a link - in a row,
 * as the article page and the comic reader draw them (2026-09-15 frames). The
 * marks are the delivered SVGs in `public/assets/social/`, white strokes,
 * drawn through `next/image` at the slot's size the caller sets (24 in the
 * reader's bar, 32 → 40 under the comic, 22 → 40 under an article); the X
 * draws at three quarters of its slot, as every frame has it.
 *
 * Facebook, WhatsApp and X open the service's own share page with this
 * address (`lib/utils/share.ts` - no SDK, no pixel). The link mark copies the
 * address. INSTAGRAM HAS NO SHARE URL - no web endpoint takes a link into a
 * post or a story - so its mark copies the address too and its label says so.
 * FLAGGED: Design may prefer it to open Goondu's profile once there is a
 * handle.
 *
 * A copy the clipboard refuses says nothing rather than claiming a copy that
 * did not happen. One that lands is announced (`aria-live`) and shown under
 * the row for two seconds - out of flow, so nothing below moves - unless the
 * caller shows it elsewhere (`feedback="none"` and `onCopied`), as the
 * reader's bar does in place of its SHARE VIA label.
 */
export type ShareLabels = {
  facebook: string;
  whatsapp: string;
  x: string;
  instagram: string;
  copy: string;
  copied: string;
};

type Mark = { key: string; label: string; src: string; ratio?: number; action: () => void };

export function ShareMarks({
  title,
  labels,
  className,
  markClassName = "size-10",
  feedback = "inline",
  onCopied,
}: {
  /** What the share is about - the post's text where a service takes one. */
  title: string;
  labels: ShareLabels;
  /** The row: gap and alignment. */
  className?: string;
  /** Each mark's slot. */
  markClassName?: string;
  /** Where "Link copied" shows: under the row, or nowhere (the caller's). */
  feedback?: "inline" | "none";
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        onCopied?.();
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  const share = (network: ShareNetwork) => () => openShare(network, title);

  const marks: Mark[] = [
    { key: "facebook", label: labels.facebook, src: "/assets/social/facebook.svg", action: share("facebook") },
    { key: "whatsapp", label: labels.whatsapp, src: "/assets/social/whatsapp.svg", action: share("whatsapp") },
    { key: "x", label: labels.x, src: "/assets/social/twitter.svg", ratio: 0.75, action: share("x") },
    { key: "instagram", label: labels.instagram, src: "/assets/social/instagram.svg", action: copy },
    { key: "link", label: labels.copy, src: "/assets/social/link-icon.svg", action: copy },
  ];

  return (
    <div className={cn("relative flex items-center", className)}>
      {marks.map((mark) => (
        <button
          key={mark.key}
          type="button"
          onClick={mark.action}
          aria-label={mark.label}
          title={mark.label}
          className={cn(
            "focus-visible:outline-signal ease-gate grid shrink-0 cursor-pointer place-items-center transition-[opacity,translate] duration-150 hover:-translate-y-0.5 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none",
            markClassName,
          )}
        >
          <Image
            src={mark.src}
            alt=""
            aria-hidden
            width={40}
            height={40}
            className={cn("select-none", mark.ratio ? "size-[75%]" : "size-full")}
          />
        </button>
      ))}

      {feedback === "inline" ? (
        <p aria-live="polite" className="text-menu-fg/70 font-body absolute top-full left-0 mt-3 text-[0.75rem] leading-none whitespace-nowrap">
          {copied ? labels.copied : ""}
        </p>
      ) : null}
    </div>
  );
}
