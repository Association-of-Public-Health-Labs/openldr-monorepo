"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../config/api";
import {
  AdminProvider as KitAdminProvider,
  useAdminStatus,
  useIsAdmin,
} from "@repo/design_system/hooks/report/admin";

export { useAdminStatus, useIsAdmin };

/** Path probed to learn patient access: the API checks the permission before validating params. */
export const ADMIN_PROBE_PATH = "/tb/gx/patients/by_facility/";

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
