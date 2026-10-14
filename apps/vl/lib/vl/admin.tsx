"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/config/api";
import { ADMIN_PROBE_PATH, interpretProbe, type AdminStatus } from "./admin-probe";

/** Backoff before each retry of an inconclusive probe (network error / 5xx). */
const RETRY_DELAYS_MS = [2000, 5000];

const AdminContext = createContext<AdminStatus>("unknown");

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<AdminStatus>("unknown");

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const probe = async (attempt: number): Promise<void> => {
      let result: AdminStatus;
      try {
        const token = await getToken();
        const res = await api(token ?? "").get(ADMIN_PROBE_PATH, {
          params: { per_page: 1 },
          validateStatus: () => true,
        });
        result = interpretProbe(res.status);
      } catch {
        result = interpretProbe(null);
      }
      if (cancelled) return;
      if (result === "unknown") {
        if (attempt < RETRY_DELAYS_MS.length) {
          timer = setTimeout(() => void probe(attempt + 1), RETRY_DELAYS_MS[attempt]);
          return;
        }
        result = "user"; // settle so the UI is never stuck on a skeleton
      }
      setStatus(result);
    };
    void probe(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isSignedIn, getToken]);

  return <AdminContext.Provider value={status}>{children}</AdminContext.Provider>;
}

export const useAdminStatus = (): AdminStatus => useContext(AdminContext);
export const useIsAdmin = (): boolean => useContext(AdminContext) === "admin";
