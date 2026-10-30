"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/config/api";
import {
  AdminProvider as KitAdminProvider,
  useAdminStatus,
  useIsAdmin,
} from "@repo/design_system/hooks/report/admin";
import { ADMIN_PROBE_PATH } from "./admin-probe";

export { useAdminStatus, useIsAdmin };

/** Wires Clerk + axios into the shared AdminProvider. */
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const probe = useCallback(async (): Promise<number | null> => {
    try {
      const token = await getToken();
      const res = await api(token ?? "").get(ADMIN_PROBE_PATH, {
        params: { per_page: 1 },
        validateStatus: () => true,
      });
      return res.status;
    } catch {
      return null;
    }
  }, [getToken]);
  return (
    <KitAdminProvider enabled={!!isSignedIn} probe={probe}>
      {children}
    </KitAdminProvider>
  );
}
