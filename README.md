# WorthRated (worthrated.com)

A Next.js 16 affiliate content site deployed to **Cloudflare** as a static export.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build and deploy

```bash
npm run build        # regenerates public/_headers + public/_redirects, exports to ./out, prunes it
npm run preview      # serve ./out through the real Cloudflare runtime (wrangler dev)
npm run deploy       # build, then wrangler deploy
npm run start        # plain static server over ./out, no Cloudflare runtime
```

Wrangler needs **Node 22 or newer**. The build itself runs on Node 20, but
`npm run preview` and `npm run deploy` do not.

`npm run preview` and `npm run deploy` run wrangler with `--env-file .env.cloudflare`
(an intentionally empty file). Wrangler otherwise picks up `.env.local` and uploads
the Amazon and Supabase keys in it as Worker secrets. This site has no Worker code
and needs no secrets.

### Deploying from GitHub instead

In the Cloudflare dashboard, create a **Worker** connected to this repository with:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Path / root directory | repository root |

Set `NEXT_PUBLIC_SITE_URL` to `https://www.worthrated.com` as a build-time
environment variable. Nothing else is needed: `.env.local` is gitignored, so a CI
build has no secrets to leak.

### The non-www redirect

Cloudflare matches `public/_redirects` on path only, so it cannot express the
`worthrated.com` to `www.worthrated.com` rule that `next.config.ts` used to hold.
Add it on the zone instead: **Rules > Redirect Rules**, when hostname equals
`worthrated.com`, dynamic redirect to
`concat("https://www.worthrated.com", http.request.uri.path)`, status 301.

## Why a static export

Vercel bills per request (ISR Reads, function invocations), which this site's
5,600+ guide pages made expensive. A static export has no per-request server cost
at all, so Cloudflare serves it from its asset hosting. The trade-offs this
imposes, and where each one is handled:

| Not available in a static export | Where it lives now |
|---|---|
| `next.config.ts` `headers()` | `public/_headers` |
| `next.config.ts` `redirects()` | `public/_redirects` |
| Route handlers (`app/api/**`) | removed |
| Middleware (`proxy.ts`) | removed; bot filtering belongs in Cloudflare's WAF |
| Admin panel + server actions (`app/admin/**`) | removed; content is edited in `data/` and rebuilt |
| `next/image` optimization | `images.unoptimized: true` |
| ISR / `export const revalidate` | removed; every route is prerendered at build time |
| `/reviews/<slug>` | removed; `data/products.ts` is empty so it prerendered zero pages |

Both generated files come from `scripts/build-cloudflare-static-config.mjs`
(`npm run cf:config`, which `npm run build` runs first). Edit the script, never
`public/_headers` or `public/_redirects` by hand.

The build then runs `scripts/prune-export.mjs`. Next 16 writes one `__next.*.txt`
segment-cache directory per route (8 files each), which for 5,600+ routes is
~45,000 extra files against Cloudflare's 20,000-asset cap, so an unpruned export
cannot be deployed at all. Nothing prefetches them (every `<Link>` sets
`prefetch={false}`), and without them the router falls back to a full-page
navigation, which is how a plain static site behaves anyway.

`app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx`, `app/apple-icon.tsx` and
`app/opengraph-image.tsx` all declare `export const dynamic = "force-static"` so
they are emitted as files at build time. Every dynamic route sets
`dynamicParams = false`: its `generateStaticParams()` list is the complete set of
URLs, and anything else serves the exported 404 page.

Supabase remains a build-time data source only. With no credentials present the
public data layer falls back to `data/`, which is what a CI build uses.

## Publishing new content

There is no admin panel and no ISR, so new or edited guides go live only through
a rebuild: edit `data/`, then `npm run build && npm run deploy` (or push and let
the Cloudflare build run).
