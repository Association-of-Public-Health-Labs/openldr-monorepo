"use client";

import { useEffect, useRef } from "react";
import type { DashboardId } from "../../dashboards";
import { pagePath, sendPageView, shouldSend } from "../../lib/usage-beacon";

/**
 * Reports a page view to the API when the page changes. `pathname` is passed in
 * because the kit has no Next dependency. A new `getToken` identity on re-render
 * does not re-send: the effect depends on the page only.
 */
export function useUsageBeacon(
  dashboard: DashboardId,
  pathname: string,
  getToken: () => Promise<string | null>,
): void {
  const last = useRef<string | null>(null);
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;

  useEffect(() => {
    const page = pagePath(pathname);
    if (!shouldSend(last.current, page)) return;
    last.current = page;
    void (async () => {
      try {
        const token = await tokenRef.current();
        await sendPageView({ apiBase: process.env.NEXT_PUBLIC_OPENLDR_API ?? "", token, dashboard, page });
      } catch {
        // Usage tracking is best effort.
      }
    })();
  }, [dashboard, pathname]);
}
