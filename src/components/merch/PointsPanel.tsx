import Image from "next/image";

import type { Messages } from "@/lib/utils/messages";
import type { PointsBalance } from "@/types/merch";


export function PointsPanel({
  balance,
  messages,
}: {
  balance: PointsBalance;
  messages: Messages;
}) {
  const t = messages.merch.points;
  const remaining = Math.max(0, balance.nextTierAt - balance.points);
  const progress = balance.nextTierAt > 0 ? balance.points / balance.nextTierAt : 0;

  return (
    <div className="lg:ml-4.5">
      {/* ---- Claimable points ---- */}
      <section className="bg-ash relative px-6.5 pt-8.75 pb-9">
        <h2 className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">
          {t.claimable}
        </h2>


        <span className="bg-gild absolute top-8.25 right-8.25 grid size-9.5 place-items-center">
          <Image
            src="/assets/merch/nsibidi-black.svg"
            alt=""
            aria-hidden
            width={22}
            height={22}
            className="size-5.5 select-none"
          />
        </span>

        <p className="mt-4.5 flex items-baseline gap-2.5">
          <span className="font-display text-menu-fg text-[4.5rem] leading-none font-semibold tracking-normal">
            {balance.points}
          </span>
          <span className="font-display text-menu-fg text-[2.0625rem] leading-none font-semibold tracking-[-0.02em]">
            {t.unit}
          </span>
        </p>

        <div
          role="progressbar"
          aria-valuenow={balance.points}
          aria-valuemin={0}
          aria-valuemax={balance.nextTierAt}
          className="bg-menu-fg/70 mt-6.75 h-1.5 w-[96.5%]"
        >
          <div
            className="bg-crimson h-full"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>

        <p className="text-menu-fg font-body text-body mt-3.25 leading-none">
          {t.next.replace("{count}", String(remaining))}
        </p>
      </section>

      {/* ---- Point perks ---- */}
      <section className="bg-ash mt-11 px-6.5 pt-8.75 pb-8.5 lg:min-h-71.25">
        <h2 className="text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider">
          {t.perksTitle}
        </h2>

        {balance.perkKeys.length > 0 ? (
          <>
            <ul className="mt-6 flex flex-col gap-6">
              {balance.perkKeys.map((key) => (
                <li key={key} className="flex items-center gap-2.5">
                  <Image
                    src="/assets/merch/red-arrow.svg"
                    alt=""
                    aria-hidden
                    width={23}
                    height={28}
                    className="h-[27.77px] w-[22.86px] shrink-0"
                  />
                  <span className="text-menu-fg font-body text-body">
                    {t.perks[key as keyof typeof t.perks]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-menu-fg font-body text-body mt-17.75">{t.more}</p>
          </>
        ) : (
          <p className="text-menu-fg font-body text-body mt-5.25 max-w-[85%]">{t.none}</p>
        )}
      </section>
    </div>
  );
}
