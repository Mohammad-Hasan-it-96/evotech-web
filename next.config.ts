import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Remote config for the mobile apps (e.g. /config/fawateer.json): the file
        // that tells an app which API to talk to. It is served from the web host,
        // not the API host, so an API outage cannot take down the config that says
        // where the API is.
        //
        // Short max-age on purpose. Editing this file is how we move an app to a
        // different server and how we roll that back, so a long cache would mean a
        // rollback that quietly does nothing for hours. The apps fetch it once at
        // startup, so the extra requests cost nothing.
        source: "/config/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, must-revalidate" },
        ],
      },
      {
        // Shared customer statements (evotech-core ADR 0013): a debtor's balance,
        // reachable by anyone holding the link. Never indexed, never cached by a
        // shared cache, and the token in the URL never leaks through a Referer.
        source: "/:locale(ar|en)/s/:token",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
