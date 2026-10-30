"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { interpretProbe } from "../../lib/report/admin-probe";
import type { AdminStatus } from "./report-context";

/** Backoff before each retry of an inconclusive probe (network error / 5xx). */
const RETRY_DELAYS_MS = [2000, 5000];

const AdminContext = createContext<AdminStatus>("unknown");

/**
 * Learns the user's role once signed in. `probe` returns the HTTP status of an admin-only
 * request (null on a network error); the app supplies it from its own auth and HTTP client.
 */
export function AdminProvider({
  enabled,
  probe: probeStatus,
  children,
}: {
  enabled: boolean;
  probe: () => Promise<number | null>;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AdminStatus>("unknown");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = async (attempt: number): Promise<void> => {
      let result: AdminStatus;
      try {
        result = interpretProbe(await probeStatus());
      } catch {
        result = interpretProbe(null);
      }
      if (cancelled) return;
      if (result === "unknown") {
        if (attempt < RETRY_DELAYS_MS.length) {
          timer = setTimeout(() => void run(attempt + 1), RETRY_DELAYS_MS[attempt]);
          return;
        }
        result = "user"; // settle so the UI is never stuck on a skeleton
      }
      setStatus(result);
    };
    void run(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, probeStatus]);

  return <AdminContext.Provider value={status}>{children}</AdminContext.Provider>;
}

export const useAdminStatus = (): AdminStatus => useContext(AdminContext);
export const useIsAdmin = (): boolean => useContext(AdminContext) === "admin";
