import "server-only";
import { UPTIMEWATCH_BASE_URL } from "../../config/api";
import type { Host, ConnectivityLog, GroupedStat, DateRangeStr, ConnectivityTrend } from "./types";

type F = typeof fetch;
// The DisaStatus 12-month aggregation queries are slow (tens of seconds), so cache
// results for a long window — once computed, most page loads are served from cache.
const REVALIDATE = 1_800; // 30 min
// Generous ceiling: these queries legitimately take up to ~2.5 min, so we must let
// them finish (a successful response gets cached); this only guards true hangs.
const TIMEOUT_MS = 180_000;
const MAX_RETRIES = 1;
const qsArray = (key: string, values: string[]) => values.map(v => `${key}=${encodeURIComponent(v)}`).join("&");
const dateQs = (r?: DateRangeStr) => (r ? `&startDate=${r.startDate}&endDate=${r.endDate}` : "");

// Gateway errors mean the query was slow, not that it failed fast: repeating it only adds load.
const NO_RETRY_STATUS = new Set([502, 503, 504]);

class UpstreamError extends Error {
  constructor(readonly status: number, url: string) {
    super(`DisaStatus ${status} for ${url}`);
  }
}

// Upstream calls in flight, by URL: concurrent route handlers (two cards, two users on a cold cache)
// share one DisaStatus query instead of each running it. The data cache takes over once it answers.
const inFlight = new Map<string, Promise<unknown>>();

function getJson<T>(url: string, f: F): Promise<T> {
  const pending = inFlight.get(url);
  if (pending) return pending as Promise<T>;
  const request = fetchJson<T>(url, f).finally(() => inFlight.delete(url));
  inFlight.set(url, request);
  return request;
}

// Fetch upstream JSON. We retry only FAST/transient failures (network blip, 500) —
// never a timeout abort or a gateway error, since retrying an already-slow query just
// multiplies the wait and the load (this was turning slow-but-working requests into 502s).
async function fetchJson<T>(url: string, f: F, attempt = 0): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await f(url, {
      next: { revalidate: REVALIDATE },
      signal: controller.signal,
    } as RequestInit);
    if (!res.ok) throw new UpstreamError(res.status, url);
    return (await res.json()) as T;
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    const slow = e instanceof UpstreamError && NO_RETRY_STATUS.has(e.status);
    if (!aborted && !slow && attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 500));
      return fetchJson<T>(url, f, attempt + 1);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllSites(f: F = fetch): Promise<Host[]> {
  const perPage = 200, MAX_PAGES = 25;
  const all: Host[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${UPTIMEWATCH_BASE_URL}/teamviewer/sites?page=${page}&perPage=${perPage}`;
    const { teamViewerHosts } = await getJson<{ teamViewerHosts: Host[] }>(url, f);
    if (!teamViewerHosts?.length) return all;
    all.push(...teamViewerHosts);
    if (page === MAX_PAGES) console.warn(`fetchAllSites hit page cap ${MAX_PAGES}; results may be truncated`);
  }
  return all;
}

export async function fetchHistoryByFacility(names: string[], range: DateRangeStr, page = 1, perPage = 100, f: F = fetch): Promise<ConnectivityLog[]> {
  const url = `${UPTIMEWATCH_BASE_URL}/teamviewer/offline-history/interval-dates-health-facility?${qsArray("healthFacilityName", names)}${dateQs(range)}&page=${page}&perPage=${perPage}`;
  const { internetConnectivityLogs } = await getJson<{ internetConnectivityLogs: ConnectivityLog[] }>(url, f);
  return internetConnectivityLogs ?? [];
}

// One request per name, all concurrently: DisaStatus answers a multi-name query roughly in the sum
// of the single-name times (12 provinces: ~187 s, past TIMEOUT_MS), but single names in parallel
// in ~45 s (measured 2026-11-16).
async function groupedPerName(path: string, param: string, names: string[], range: DateRangeStr, f: F): Promise<GroupedStat[]> {
  const results = await Promise.all(
    names.map(name => {
      const url = `${UPTIMEWATCH_BASE_URL}/teamviewer/offline-grouped-statistics/${path}?${qsArray(param, [name])}${dateQs(range)}`;
      return getJson<{ data: GroupedStat[] }>(url, f).then(r => r.data ?? []);
    })
  );
  return results.flat();
}

export function fetchOfflineMinutesByProvince(names: string[], range: DateRangeStr, f: F = fetch): Promise<GroupedStat[]> {
  return groupedPerName("interval-dates-province", "provinceName", names, range, f);
}

export function fetchOfflineMinutesByDistrict(names: string[], range: DateRangeStr, f: F = fetch): Promise<GroupedStat[]> {
  return groupedPerName("interval-dates-district", "districtName", names, range, f);
}

export async function fetchOfflineMinutesByFacility(names: string[], range: DateRangeStr, f: F = fetch): Promise<GroupedStat[]> {
  const CHUNK = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < names.length; i += CHUNK) {
    const chunk = names.slice(i, i + CHUNK);
    if (chunk.length) chunks.push(chunk);
  }
  // Fetch all chunks concurrently rather than one-by-one.
  const results = await Promise.all(
    chunks.map(chunk => {
      const url = `${UPTIMEWATCH_BASE_URL}/teamviewer/offline-grouped-statistics/interval-dates-health-facility?${qsArray("healthFacilityName", chunk)}${dateQs(range)}`;
      return getJson<{ data: GroupedStat[] }>(url, f).then(r => r.data ?? []);
    })
  );
  return results.flat();
}

export async function fetchConnectivityTrend(range?: DateRangeStr, f: F = fetch): Promise<ConnectivityTrend> {
  const query = range ? `?startDate=${range.startDate}&endDate=${range.endDate}` : "";
  const url = `${UPTIMEWATCH_BASE_URL}/teamviewer/connectivity-trend${query}`;
  const { data } = await getJson<{ data: ConnectivityTrend }>(url, f);
  return data ?? { labels: [], series: { all: [], Disalab: [], Disapoc: [], Disalink: [] } };
}
