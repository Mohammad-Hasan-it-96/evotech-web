@AGENTS.md

# CLAUDE.md — evotech-web

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## What this is

`evotech-web` is the **frontend** of the EVOTECH Platform (Phase 1 = marketing website). It is a decoupled Next.js app that will later also host the subscriptions **dashboard** (Phase 3) under a separate route group. The Laravel API lives in the sibling `evotech-core` repo. Architecture is governed by `evotech-core/docs/ARCHITECTURE.md` (§8 Frontend) and `evotech-core/docs/ROADMAP.md`; ADR 0001 records the decoupled/single-domain/self-hosted decision.

## Commands

```bash
npm run dev      # Dev server (Turbopack) → http://localhost:3000
npm run build    # Production build (all marketing pages prerender as SSG for ar + en)
npm run start    # Serve the production build
npm run lint     # ESLint (must be clean before commit)
```

## Dashboard (Phase 3)

An authenticated admin dashboard lives under `src/app/[locale]/dashboard/` (path-based; maps to `app.<domain>` at deploy time):
- `dashboard/login/` — public login. `dashboard/(app)/` — the protected shell (sidebar + topbar); its layout is a **client** component that redirects to login when unauthenticated.
- `dashboard/layout.tsx` wraps everything in `QueryProvider` (TanStack Query) + `AuthProvider`.
- **Auth is token-based** (Sanctum Bearer): `src/lib/auth/` holds token storage (localStorage) + `AuthProvider`; `src/lib/api/client.ts` is the fetch wrapper that attaches the token and throws `ApiError` from the standard `{error:{…}}` envelope. API base URL: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`).
- To run against the backend: start the Laravel API (`php artisan serve`, port 8000) + `npm run dev`. CORS is open for `api/*` by default. Demo login: `admin@evotech.test` / `Password12345`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · next-intl (i18n) · next-themes (dark/light) · motion (animations) · lucide-react (icons).

## Architecture notes (read before editing)

- **i18n is first-class.** Locales are `ar` (default, RTL) and `en` (LTR), defined in `src/i18n/routing.ts`. Every route is under `src/app/[locale]/`. The locale prefix is always present; `src/proxy.ts` (Next 16's renamed middleware) redirects `/` → `/ar`.
  - Use `Link`, `useRouter`, `usePathname` from **`@/i18n/navigation`** — never `next/link` / `next/navigation` directly (they lose the locale).
  - Every page **and** layout must call `setRequestLocale(locale)` before using translations, or the route falls back to dynamic rendering instead of SSG.
- **Content vs. copy split:**
  - UI chrome + marketing copy → `src/messages/{ar,en}.json` (next-intl).
  - **Catalog data** (products, services, pricing) → `src/content/*.ts` as locale-keyed objects (`{ ar, en }`), resolved with `localized(field, locale)`. This shape is intentional: Phase 3 swaps the data source to the platform API (Products/Subscriptions modules) with no component rewrite.
- **Design tokens** live in `src/app/globals.css` (`:root` + `.dark`, oklch). Brand = violet/white with a `--brand-2` accent for gradients. **Never hard-code colors** — use token-backed classes (`bg-primary`, `text-gradient-brand`, etc.). Light + dark parity is required.
- **RTL:** prefer logical utilities (`ms/me`, `ps/pe`, `start-*`, `end-*`, `border-s/e`) over physical (`ml/mr`, `left/right`) so Arabic mirrors correctly. The Sheet has logical `side="start|end"`.
- **Icons in content** are stored as string names and resolved by `src/components/icon.tsx` (keeps `src/content` UI-agnostic for the API migration).

## Deployment

Self-hosted on the company Contabo VPS (no Vercel): `next build` → PM2 → Nginx reverse proxy per subdomain → certbot TLS. Must not disrupt the existing restaurant system on the same server (separate Nginx server block + internal port).
