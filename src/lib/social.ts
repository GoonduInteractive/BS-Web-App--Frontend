export type SocialKey = "instagram" | "tiktok" | "x" | "youtube";

export const SOCIAL_LINKS: readonly { key: SocialKey; href: string | null; icon: string }[] = [
  { key: "instagram", href: "https://www.instagram.com/goonduinteractive", icon: "/assets/social/instagram.svg" },
  { key: "tiktok", href: null, icon: "/assets/social/tiktok.svg" },
  { key: "x", href: "https://x.com/goondugames", icon: "/assets/social/twitter.svg" },
  { key: "youtube", href: null, icon: "/assets/social/youtube.svg" },
];
