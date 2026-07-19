/**
 * Last-resort remote config, served when the API cannot be reached.
 *
 * Committed TypeScript rather than a file read at runtime, matching
 * `catalog-fallback.ts`: a disk read would depend on `process.cwd()` and would
 * break the moment `output: "standalone"` is turned on.
 *
 * These values mirror the hand-edited `public/config/fawateer.json` this replaced.
 * The one that genuinely matters is `api.base_url` — the app applies it silently
 * and never reports a problem, so serving a blank one would leave devices talking
 * to whatever URL was compiled into them, with no signal anywhere that it happened.
 */
export interface DeviceRemoteConfig {
  latest_version: string;
  api: { base_url: string };
  downloads: Record<string, string>;
  update_notes: string[];
  support: { email: string; whatsapp: string; telegram: string };
}

export const deviceConfigFallback: Record<string, DeviceRemoteConfig> = {
  /*
   * Smart-Agent's users are on the legacy backend, and its parser applies
   * `base_url` destructively: where Fawateer keeps its current value when the
   * field is blank, Smart-Agent resets to its compiled-in default. Whatever is
   * here becomes where every device talks, so this mirrors the Google Drive file
   * its shipped builds read — legacy host included.
   *
   * Nothing reads this yet: shipped builds still fetch that Drive file, and Drive
   * serves bytes rather than redirecting here. It exists so the release that
   * repoints them is a one-line change.
   */
  smartagent: {
    latest_version: "1.1.1",
    api: { base_url: "https://harrypotter.foodsalebot.com/api" },
    downloads: {
      "arm64-v8a":
        "https://harrypotter.foodsalebot.com/downloads/app-arm64-v8a-release.apk",
      "armeabi-v7a":
        "https://harrypotter.foodsalebot.com/downloads/app-armeabi-v7a-release.apk",
    },
    update_notes: [],
    support: {
      // Its own inbox — deliberately not Fawateer's.
      email: "smart.agent.app.support@gmail.com",
      whatsapp: "963959027196",
      telegram: "https://t.me/+963959027196",
    },
  },
  fawateer: {
    latest_version: "1.0.0",
    api: { base_url: "https://api.evotech-sys.com/api/fawateer" },
    downloads: {},
    update_notes: [],
    support: {
      email: "mohamad.hasan.it.96@gmail.com",
      whatsapp: "963959027196",
      telegram: "https://t.me/+963959027196",
    },
  },
};

/**
 * A payload is only usable if it carries a non-empty `api.base_url`.
 *
 * This is the difference between a proxy and a liability: a 200 from the API with
 * a missing or empty base URL would be passed straight through, and the app would
 * accept it without complaint. Anything failing this check is discarded in favour
 * of the fallback above.
 */
export function isUsableConfig(value: unknown): value is DeviceRemoteConfig {
  if (typeof value !== "object" || value === null) return false;

  const api = (value as { api?: unknown }).api;
  if (typeof api !== "object" || api === null) return false;

  const baseUrl = (api as { base_url?: unknown }).base_url;

  return typeof baseUrl === "string" && baseUrl.trim() !== "";
}
