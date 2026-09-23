import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * `/robots.txt`. Everything is crawlable except what is one visitor's own -
 * their profile, their cart, their checkout - and the CMS admin. Those pages
 * also carry `noindex` through `pageMetadata`, so a crawler that ignores this
 * file still leaves them out.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/profile", "/*/merch/cart", "/*/merch/checkout", "/admin"],
    },
    sitemap: `${SITE_URL.origin}/sitemap.xml`,
    host: SITE_URL.origin,
  };
}
