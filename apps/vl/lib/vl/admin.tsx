"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/config/api";
import { ADMIN_PROBE_PATH, interpretProbe, type AdminStatus } from "./admin-probe";

const AdminContext = createContext<AdminStatus>("unknown");

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<AdminStatus>("unknown");

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await api(token ?? "").get(ADMIN_PROBE_PATH, {
          params: { per_page: 1 },
          validateStatus: () => true,
        });
        if (!cancelled) setStatus(interpretProbe(res.status));
      } catch {
        if (!cancelled) setStatus(interpretProbe(null));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  return <AdminContext.Provider value={status}>{children}</AdminContext.Provider>;
}

export const useAdminStatus = (): AdminStatus => useContext(AdminContext);
export const useIsAdmin = (): boolean => useContext(AdminContext) === "admin";
