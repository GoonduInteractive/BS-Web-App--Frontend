import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import type { Messages } from "@/lib/utils/messages";

export function TrialIntro({ messages }: { messages: Messages }) {
  const t = messages.competition.intro;

  return (
    <div className="mx-auto w-full px-6 pt-16 pb-11 lg:px-20 lg:pt-26.5">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <Reveal className="max-w-164">
          <p className="text-menu-fg font-body text-body">{t.body}</p>
        </Reveal>

        <Reveal delay={80} className="-ml-1 shrink-0 lg:ml-0 lg:mt-3.5">
          <BracketButton className="px-4 py-4.75 leading-none tracking-normal whitespace-nowrap">
            {t.cta}
          </BracketButton>
        </Reveal>
      </div>
    </div>
  );
}
