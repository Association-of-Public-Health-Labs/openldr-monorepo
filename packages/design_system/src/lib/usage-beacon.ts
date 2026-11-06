import type { DashboardId } from "../dashboards";

export type PageViewOptions = {
  apiBase: string;
  token: string | null;
  dashboard: DashboardId;
  page: string;
  fetchFn?: typeof fetch;
};

/** The path without any query or hash, so names and filters never leave the browser (pure). */
export function pagePath(pathname: string): string {
  return pathname.split(/[?#]/)[0] || "/";
}

/** True when `next` is a page the beacon has not just reported (pure). */
export function shouldSend(previous: string | null, next: string): boolean {
  return previous !== next;
}

/** Fire-and-forget page view. Never rejects; true only when the API answered ok. */
export async function sendPageView({ apiBase, token, dashboard, page, fetchFn }: PageViewOptions): Promise<boolean> {
  if (!token || !apiBase) return false;
  try {
    const doFetch = fetchFn ?? fetch;
    const response = await doFetch(`${apiBase.replace(/\/+$/, "")}/usage/events`, {
      method: "POST",
      keepalive: true,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ dashboard, page }),
    });
    return response.ok;
  } catch {
    // Usage tracking is best effort.
    return false;
  }
}
