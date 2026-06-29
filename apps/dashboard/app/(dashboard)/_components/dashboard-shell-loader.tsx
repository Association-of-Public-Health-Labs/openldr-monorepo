"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

type DashboardShellComponent = ComponentType<DashboardShellProps>;

export function DashboardShellLoader({ children }: DashboardShellProps) {
  const [DashboardShell, setDashboardShell] = useState<DashboardShellComponent | null>(null);

  useEffect(() => {
    let mounted = true;

    import("./dashboard-shell").then((module) => {
      if (mounted) {
        setDashboardShell(() => module.DashboardShell);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!DashboardShell) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-open-sans), sans-serif",
        }}
      >
        A carregar a Dashboard Unificada...
      </main>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
