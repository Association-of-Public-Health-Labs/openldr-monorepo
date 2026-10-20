"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
// The file, not the "@repo/design_system_mui" barrel: the barrel touches `window`
// at import time and breaks prerendering of pages that use the root layout.
import { AppProvider } from "../../../design_system_mui/src/contexts/AppContext";
import type { DashboardId } from "../dashboards";
import { muiThemeOptions } from "./muiThemeOptions";

// AppProvider (not @mui/material's ThemeProvider) because it resolves the same
// @mui/material copy as the MUI components; another copy's context is never read.
function MuiBridge({ dashboard, children }: { dashboard: DashboardId; children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const lightTheme = React.useMemo(() => muiThemeOptions(dashboard, "light"), [dashboard]);
  const darkTheme = React.useMemo(() => muiThemeOptions(dashboard, "dark"), [dashboard]);

  return (
    <AppProvider lightTheme={lightTheme} darkTheme={darkTheme} themeMode={mode}>
      {children}
    </AppProvider>
  );
}

/** Theme for a whole app: next-themes owns light/dark, MUI follows it. */
export function PlatformThemeProvider({ dashboard, children }: { dashboard: DashboardId; children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Avoids a hydration mismatch, as the apps' previous ThemeProvider did.
  if (!mounted) return null;

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <MuiBridge dashboard={dashboard}>{children}</MuiBridge>
    </NextThemesProvider>
  );
}
