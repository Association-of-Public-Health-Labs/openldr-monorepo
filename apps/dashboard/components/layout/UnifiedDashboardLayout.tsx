"use client";

import type { ReactNode } from "react";

type UnifiedDashboardLayoutProps = {
  children: ReactNode;
};

// Deprecated: Fase A moved apps/dashboard to the official TB-based DashboardLayout shell.
// This pass-through remains temporarily so old imports fail softly until removal.
export function UnifiedDashboardLayout({ children }: UnifiedDashboardLayoutProps) {
  return <>{children}</>;
}
