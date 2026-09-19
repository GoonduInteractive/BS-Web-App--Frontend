import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/seo";

/**
 * The web app manifest, served at `/manifest.webmanifest` and linked from
 * every page by Next's file convention.
 *
 * The delivered `assets/brand/site.webmanifest` carried empty names and a
 * white theme; this one names the site and takes the page's own black, and
 * points at the two Android icons where they were delivered. The favicon,
 * the 16 and 32 PNGs and the Apple touch icon live beside this file under
 * `src/app/` — Next serves those from the root and writes their `<link>`s.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Beyond Service",
    description: "The official site for Beyond Service: Trial of the Gods, by Goondu Games Studio.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/assets/brand/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/brand/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
