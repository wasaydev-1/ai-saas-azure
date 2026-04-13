import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Azure Static Web Apps expects a static artifact folder (default: `out`)
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  /**
   * In dev, webpack’s filesystem cache can get out of sync on Windows after Fast Refresh
   * or env reloads, causing missing chunk errors (`Cannot find module './NNN.js'`) and
   * cascading `/_next/static/*` 404s. Prefer `npm run dev` (Turbopack). This helps when
   * using `npm run dev:webpack`.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
