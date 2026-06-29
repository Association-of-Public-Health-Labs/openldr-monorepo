"use client";

import type { ReactNode } from "react";

// Deprecated: the route group now uses app/(dashboard)/layout.tsx with the
// official TB-based DashboardLayout shell. Keep this as a pass-through until
// the old loader is removed.
export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
