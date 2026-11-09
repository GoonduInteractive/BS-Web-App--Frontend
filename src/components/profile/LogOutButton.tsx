"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { LogOutGlyph } from "@/components/profile/ProfileGlyphs";

/** The profile card's Log Out. Ends the session and leaves the profile for The Game. */
export function LogOutButton({ label, locale }: { label: string; locale: string }) {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.replace(`/${locale}/the-game`);
      }}
      className="text-flare font-body focus-visible:outline-signal inline-flex cursor-pointer items-center gap-2.5 text-body leading-none transition-opacity duration-150 ease-gate hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <LogOutGlyph />
      {label}
    </button>
  );
}
