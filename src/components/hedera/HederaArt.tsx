import Image from "next/image";

import { HbarIcon } from "@/components/ui/CurrencyIcons";
import { HEDERA_ART, type HederaArtKey } from "@/lib/hedera/art";

/**
 * A Hedera screen's art: a character on an ember-and-gold glow with HBAR's
 * mark and the Hedera logo beside it - a stand-in for Sophia's "characters
 * interacting with the Hedera logo" until they're delivered (`lib/hedera/art.ts`).
 *
 * - `header`: the right of a Hedera page's title (`HederaFrame`), head and
 *   shoulders, fading into the page at the foot.
 * - `hero`: the explainer's right half, the whole figure; fills its parent.
 * - `tile`: a card's picture slot (the HBAR checkout's ITEM for a merch order).
 *
 * Decorative, and drawn only from `lg` up for `header` and `hero` (the caller
 * hides it), so phones on metered data never fetch it: a lazy image that's
 * never shown is never loaded.
 */
export function HederaArt({ art, variant }: { art: HederaArtKey; variant: "header" | "hero" | "tile" }) {
  const image = HEDERA_ART[art];
  const hero = variant === "hero";

  return (
    <div aria-hidden className={`relative ${variant === "tile" ? "bg-ash aspect-[4/5] w-full overflow-hidden rounded-lg" : "h-full w-full"}`}>
      {/* The glow the figure stands in: ember low down, gold where the head is. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_55%_70%,color-mix(in_oklab,var(--color-ember)_55%,transparent),transparent_75%),radial-gradient(40%_35%_at_55%_30%,color-mix(in_oklab,var(--color-gild)_22%,transparent),transparent_80%)]" />
      {/* A stand-in fades out over its lower third into the page; delivered art keeps its foot,
          only softening the last few percent so it meets the section's edge. */}
      <div
        className={`absolute inset-0 ${
          variant === "tile"
            ? ""
            : image.delivered
              ? "[mask-image:linear-gradient(to_bottom,black_92%,transparent)]"
              : "[mask-image:linear-gradient(to_bottom,black_62%,transparent)]"
        }`}
      >
        <Image
          src={image.src}
          alt=""
          fill
          sizes={hero ? "(min-width: 1024px) 40vw, 1px" : variant === "header" ? "(min-width: 1024px) 360px, 1px" : "240px"}
          className={`select-none ${hero ? (image.heroFit ?? "object-contain object-bottom") : `object-cover ${image.position}`}`}
        />
      </div>
      {/* HBAR's mark and the Hedera logo, where the real art will have them. Delivered art
          carries the Hedera mark itself, so it gets none. */}
      {image.delivered ? null : (
        <div className={`absolute flex items-center gap-2 ${hero ? "bottom-16 left-4" : "bottom-3 left-3"}`}>
          <HbarIcon className={`${hero ? "size-14" : "size-9"} drop-shadow-[0_6px_14px_rgb(0_0_0/0.6)]`} />
          <span className={`bg-ink/85 inline-flex items-center rounded-full ${hero ? "h-9 px-4" : "h-7 px-3"}`}>
            <Image src="/assets/partners/hedera-logo.webp" alt="" width={214} height={60} className={`${hero ? "h-4.5" : "h-3.5"} w-auto select-none`} />
          </span>
        </div>
      )}
    </div>
  );
}
