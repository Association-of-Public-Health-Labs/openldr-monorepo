"use client";

import type { ReactNode } from "react";
import { UnifiedDashboardLayout } from "@/components/layout/UnifiedDashboardLayout";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return <UnifiedDashboardLayout>{children}</UnifiedDashboardLayout>;
}
