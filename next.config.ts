import type { NextConfig } from "next";

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
};

export default nextConfig;
