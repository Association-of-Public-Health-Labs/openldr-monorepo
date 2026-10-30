// SERVER ONLY. Import this module from route handlers alone (apps/vl app/api/reports/cv, apps/eid
// app/api/reports/dpi), never from a component: it reads the Nextcloud app password from the env and must
// not reach a client bundle (the `server-only` package is not a dependency, hence this note).
// Reads the weekly reports from Nextcloud with the account the report generator uploads with.
// The app password never reaches the browser.

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

/** "reports/CV/" → "/reports/CV": the cache key and the path below the account's files. */
const normaliseFolder = (folder: string) => "/" + folder.replace(/^\/+|\/+$/g, "");

function config(folder: string): Config {
  const { NEXTCLOUD_BASE_URL, NEXTCLOUD_USERNAME, NEXTCLOUD_APP_PASSWORD } = process.env;
  if (!NEXTCLOUD_BASE_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_APP_PASSWORD) {
    throw new NextcloudNotConfigured("Nextcloud não configurado.");
  }
  return {
    baseUrl: NEXTCLOUD_BASE_URL.replace(/\/+$/, ""),
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_APP_PASSWORD,
    folder,
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

async function load(folder: string): Promise<WeeklyReport[]> {
  const cfg = config(folder);
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

type Slot = { cache: { at: number; reports: WeeklyReport[] } | null; pending: Promise<WeeklyReport[]> | null };

/** One cache per reports folder (e.g. /reports/CV for VL, /reports/DPI for EID). */
const slots = new Map<string, Slot>();

/**
 * The weekly reports below `folder`, cached per folder; concurrent callers share one refresh, and a
 * failed refresh serves the last list.
 */
export async function listWeeklyReports(folder: string): Promise<{ reports: WeeklyReport[]; updatedAt: string }> {
  const key = normaliseFolder(folder);
  let slot = slots.get(key);
  if (!slot) slots.set(key, (slot = { cache: null, pending: null }));
  const s = slot;
  if (!s.cache || Date.now() - s.cache.at > TTL_MS) {
    s.pending ??= load(key).finally(() => {
      s.pending = null;
    });
    try {
      s.cache = { at: Date.now(), reports: await s.pending };
    } catch (error) {
      if (!s.cache || error instanceof NextcloudNotConfigured) throw error;
      console.error("Nextcloud refresh failed, serving the cached list:", error);
    }
  }
  return { reports: s.cache.reports, updatedAt: new Date(s.cache.at).toISOString() };
}
