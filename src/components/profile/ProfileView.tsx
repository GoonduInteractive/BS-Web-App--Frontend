"use client";

import { ProfileCard } from "@/components/profile/ProfileCard";
import { useMyProfile } from "@/hooks/useMyProfile";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The profile card with the signed-in player's own data, read in the browser:
 * the page is static and can't know who is looking.
 *
 * While it loads, the card's own height holds the page still. No frame draws a
 * loading or failed state; a failure says so in the site's error line.
 */
export function ProfileView({ messages, locale }: { messages: Messages; locale: Locale }) {
  const profile = useMyProfile();

  if (profile.data) return <ProfileCard profile={profile.data} messages={messages} locale={locale} />;
  if (profile.isError) {
    return (
      <p role="alert" className="text-menu-fg/85 font-body text-body mx-auto max-w-[56.5rem] py-24 text-center">
        {messages.auth.errors.unknown}
      </p>
    );
  }
  return <div aria-busy className="bg-pitch mx-auto min-h-[43.625rem] w-full max-w-[56.5rem] rounded-[1.25rem]" />;
}
