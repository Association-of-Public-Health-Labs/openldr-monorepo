"use client";

import { useEffect, useRef } from "react";
import type { DashboardId } from "../../dashboards";
import { pagePath, sendPageView, shouldSend } from "../../lib/usage-beacon";

/**
 * Reports a page view to the API when the page changes. `pathname` is passed in
 * because the kit has no Next dependency. `ready` is true once the user is signed
 * in with a token available; nothing is sent before. A new `getToken` identity on
 * re-render does not re-send, and a page counts as sent only after the API accepted it.
 */
export function useUsageBeacon(
  dashboard: DashboardId,
  pathname: string,
  getToken: () => Promise<string | null>,
  ready: boolean,
): void {
  const sent = useRef<string | null>(null);
  const inFlight = useRef<string | null>(null);
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;

  useEffect(() => {
    if (!ready) return;
    const page = pagePath(pathname);
    if (!shouldSend(sent.current, page) || inFlight.current === page) return;
    inFlight.current = page;
    void (async () => {
      try {
        const token = await tokenRef.current();
        const ok = await sendPageView({ apiBase: process.env.NEXT_PUBLIC_OPENLDR_API ?? "", token, dashboard, page });
        if (ok) sent.current = page;
      } catch {
        // Usage tracking is best effort.
      } finally {
        if (inFlight.current === page) inFlight.current = null;
      }
    })();
  }, [dashboard, pathname, ready]);
}
