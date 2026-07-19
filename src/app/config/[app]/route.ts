import { NextResponse } from "next/server";
import {
  deviceConfigFallback,
  isUsableConfig,
} from "@/content/device-config-fallback";

/**
 * Serves the mobile apps' startup config at `/config/<app>.json`, proxied from the
 * platform API so it is editable from the dashboard instead of hand-edited.
 *
 * ## Why the `.json` is not decoration
 *
 * `proxy.ts` matches `/((?!api|_next|_vercel|.*\..*).*)` — the negative lookahead
 * excludes any path containing a dot. `/config/fawateer.json` is therefore exempt
 * from locale routing. Drop the extension and `/config/fawateer` gets redirected to
 * `/ar/config/fawateer`, which the shipped app would follow into an HTML page.
 *
 * ## Why this returns 200 even when the API is down
 *
 * Both health checks (`deploy.sh` and the deploy workflow) assert on HTTP status
 * only, and the workflow's hard-fails. Returning 503 while the backend blinked
 * would fail an unrelated deploy — and, worse, give an app no config at all when a
 * slightly stale one would have served it perfectly.
 */

// The apps re-fetch on every launch and the config changes rarely; 5 minutes
// matches the Cache-Control in next.config.ts, which owns the response header.
const REVALIDATE_SECONDS = 300;

/*
 * Runtime-first, build-time second. NEXT_PUBLIC_* values are inlined by `next
 * build`, so repointing the API through that variable alone would need a full
 * rebuild — which defeats the purpose of a config whose whole job is a fast,
 * reversible switch. CONFIG_API_URL is read from the environment at request time,
 * so setting it needs only a restart.
 */
const API_URL =
  process.env.CONFIG_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ app: string }> },
) {
  const { app } = await params;

  // Only the dotted form is reachable without tripping locale routing, so only
  // the dotted form is answered — an undotted request is a caller bug, not a
  // config we should invent a response for.
  if (!app.endsWith(".json")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const slug = app.slice(0, -".json".length).toLowerCase();
  const fallback = deviceConfigFallback[slug];

  if (fallback === undefined) {
    return NextResponse.json({ message: "Unknown app" }, { status: 404 });
  }

  try {
    const response = await fetch(`${API_URL}/${slug}/remote-config`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`remote-config returned ${response.status}`);
    }

    const payload: unknown = await response.json();

    // A 200 carrying a blank base_url is the failure this guard exists for: the
    // app applies it without complaint and there is no error to notice.
    if (!isUsableConfig(payload)) {
      throw new Error("remote-config payload has no usable api.base_url");
    }

    return NextResponse.json(payload, {
      headers: { "X-Config-Source": "api" },
    });
  } catch {
    // Deliberately swallowed. The app gets a working config either way, and a
    // thrown error here would 500 a path whose entire job is to always answer.
    return NextResponse.json(fallback, {
      headers: { "X-Config-Source": "fallback" },
    });
  }
}
