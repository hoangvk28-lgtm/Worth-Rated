import type { NextConfig } from "next";
import path from "path";

// Cloudflare deployment.
//
// This site is served as a pure static export (output: "export") from
// Cloudflare's static asset hosting. There is no Node server at runtime, which
// is deliberate: Vercel's per-request ISR Read / function-invocation billing is
// what this move exists to remove.
//
// Consequences, all handled elsewhere in the repo:
//   * next.config headers()/redirects() do nothing in an export, so they live
//     in public/_headers and public/_redirects, which Cloudflare reads.
//     scripts/build-cloudflare-static-config.mjs generates both (npm run cf:config).
//   * Route handlers (app/api), middleware (proxy.ts), the admin panel and
//     server actions are unsupported and have been removed.
//   * next/image optimization needs a server, so images are served unoptimized.
//   * ISR is gone: every route is prerendered at build time, including the
//     5,600+ rich guides in data/dynamic-guides-registry.ts.
//   * scripts/prune-export.mjs trims Next's per-route segment payloads from out/
//     so the deployment stays under Cloudflare's 20,000-asset cap.
const nextConfig: NextConfig = {
  output: "export",

  // Pin the workspace root explicitly. A stray lockfile above this folder can
  // otherwise make Next.js infer the whole home directory as the workspace.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  // Cloudflare serves /guide/foo from out/guide/foo.html with
  // html_handling: "drop-trailing-slash", which matches the canonical URLs
  // buildMetadata() emits (no trailing slash).
  trailingSlash: false,

  experimental: {
    // The export prerenders 5,600+ pages. The default worker count makes
    // several concurrent Node processes exhaust RAM + swap on this machine.
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },

  images: {
    // Required by output: "export" — there is no server to optimize images.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
};

export default nextConfig;
