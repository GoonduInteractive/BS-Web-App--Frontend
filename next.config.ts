import type { NextConfig } from "next";

// The API is where every list, account, cart and order comes from: there is no
// stand-in data, so a dev server or build without it stops here, plainly,
// rather than shipping an empty site. Locally, copy `.env.example` to `.env`.
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env, and set it in the host's environment to deploy.");
}

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Overview section 9: every gate plate ships AVIF with a WebP fallback.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Stand-in for locale negotiation. next-intl's middleware replaces this
      // in chunk 1 and will honour Accept-Language instead of always sending en.
      { source: "/", destination: "/en", permanent: false },
    ];
  },
  async rewrites() {
    return [
      // The Decap admin lives in public/admin/. Next serves public files at
      // their exact path and never resolves a directory index, so without this
      // `/admin` would fall into the [locale] segment and 404.
      { source: "/admin", destination: "/admin/index.html" },
    ];
  },
  async headers() {
    return [
      {
        // THE EDITOR MUST NEVER RUN AN OLD SCHEMA. Next serves `public/` with
        // `public, max-age=0`, which a browser may reuse without asking, and
        // Decap reads `config.yml` once when the page loads - so an admin tab
        // opened before a field was added keeps offering the fields it knew.
        // That happened on 2026-09-22: an article was published with a field
        // that had been removed hours earlier. `no-store` means every load of
        // `/admin` fetches the current config; an already-open tab still needs
        // a reload, which is now all it needs.
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
