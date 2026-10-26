// Server only (app/api/reports/cv): reads the weekly CV reports from Nextcloud with the account the
// report generator uploads with. The app password never reaches the browser.

import { buildReports, parsePropfind, weekFolders, type WeeklyReport } from "./nextcloud";

const PROPFIND_BODY = `<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:"><d:prop><d:getlastmodified/><d:getcontentlength/><d:resourcetype/></d:prop></d:propfind>`;

/** Reports arrive once a week; a short cache keeps the drawer instant without going stale for long. */
const TTL_MS = 15 * 60 * 1000;
/** Parallel share lookups (one per week folder, ~0.35 s each). */
const CONCURRENCY = 6;
const TIMEOUT_MS = 30_000;

type Config = { baseUrl: string; username: string; password: string; folder: string };

export class NextcloudNotConfigured extends Error {}

function config(): Config {
  const { NEXTCLOUD_BASE_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_APP_PASSWORD, NEXTCLOUD_CV_FOLDER } = process.env;
  if (!NEXTCLOUD_BASE_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_APP_PASSWORD) {
    throw new NextcloudNotConfigured("Nextcloud não configurado.");
  }
  return {
    baseUrl: NEXTCLOUD_BASE_URL.replace(/\/+$/, ""),
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_APP_PASSWORD,
    folder: "/" + (NEXTCLOUD_CV_FOLDER || "/reports/CV").replace(/^\/+|\/+$/g, ""),
  };
}

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

async function request(cfg: Config, url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Authorization: "Basic " + Buffer.from(`${cfg.username}:${cfg.password}`).toString("base64"),
      "OCS-APIRequest": "true",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Nextcloud respondeu ${res.status}.`);
  return res;
}

/** file path relative to the reports folder → public link token, for one week folder. */
async function linkTokens(cfg: Config, folder: string): Promise<[string, string][]> {
  const params = new URLSearchParams({ format: "json", path: `${cfg.folder}/${folder}`, subfiles: "true" });
  const res = await request(cfg, `${cfg.baseUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares?${params}`);
  const body = (await res.json()) as { ocs?: { data?: { share_type: number; path: string; token?: string }[] } };
  const prefix = cfg.folder + "/";
  return (body.ocs?.data ?? [])
    .filter((s) => s.share_type === 3 && s.token && s.path.startsWith(prefix))
    .map((s) => [s.path.slice(prefix.length), s.token!]);
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function load(): Promise<WeeklyReport[]> {
  const cfg = config();
  const davRoot = `/remote.php/dav/files/${encodeURIComponent(cfg.username)}${encodePath(cfg.folder)}`;
  const res = await request(cfg, cfg.baseUrl + davRoot + "/", {
    method: "PROPFIND",
    headers: { Depth: "infinity", "Content-Type": "application/xml" },
    body: PROPFIND_BODY,
  });
  const files = parsePropfind(await res.text(), davRoot);
  const tokens = new Map((await mapLimit(weekFolders(files), CONCURRENCY, (f) => linkTokens(cfg, f))).flat());
  return buildReports(files, tokens, cfg.baseUrl);
}

let cache: { at: number; reports: WeeklyReport[] } | null = null;
let pending: Promise<WeeklyReport[]> | null = null;

/** Cached list; concurrent callers share one refresh, and a failed refresh serves the last list. */
export async function listCvReports(): Promise<{ reports: WeeklyReport[]; updatedAt: string }> {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    pending ??= load().finally(() => {
      pending = null;
    });
    try {
      cache = { at: Date.now(), reports: await pending };
    } catch (error) {
      if (!cache || error instanceof NextcloudNotConfigured) throw error;
      console.error("Nextcloud refresh failed, serving the cached list:", error);
    }
  }
  return { reports: cache.reports, updatedAt: new Date(cache.at).toISOString() };
}
