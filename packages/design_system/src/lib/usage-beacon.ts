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

/** Fire-and-forget page view. Never rejects: a failure must not reach the user. */
export async function sendPageView({ apiBase, token, dashboard, page, fetchFn }: PageViewOptions): Promise<void> {
  if (!token || !apiBase) return;
  try {
    const doFetch = fetchFn ?? fetch;
    await doFetch(`${apiBase.replace(/\/+$/, "")}/usage/events`, {
      method: "POST",
      keepalive: true,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ dashboard, page }),
    });
  } catch {
    // Usage tracking is best effort.
  }
}
