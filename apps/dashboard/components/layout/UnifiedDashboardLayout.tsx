"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@repo/design_system_mui/contexts/AppContext";
import { SettingsDrawer, type SettingsProps } from "@repo/design_system_mui/molecules/headers/SettingsDrawer";
import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";
import { Menu } from "lucide-react";
import { getActivePage } from "../../config/navigation";
import { useLayoutSettings } from "../../hooks/useLayoutSettings";
import { darkMode } from "../../themes/dark";
import { lightMode } from "../../themes/light";
import { SidebarNavigation } from "./SidebarNavigation";

type UnifiedDashboardLayoutProps = {
  children: ReactNode;
};

const SIDEBAR_EXPANDED_WIDTH = 272;
const SIDEBAR_COMPACT_WIDTH = 76;

export function UnifiedDashboardLayout({ children }: UnifiedDashboardLayoutProps) {
  const pathname = usePathname();
  const { hydrated, settings, setSettings } = useLayoutSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const page = useMemo(() => getActivePage(pathname), [pathname]);
  const sidebarCollapsed = settings.layout === "compact" || settings.compact === "small";
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COMPACT_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const contentPaddingX = settings.compact === "large" ? { xs: 2, md: 4 } : { xs: 2, md: 2.5 };

  const handleSetSettings = useCallback(
    (nextSettings: SettingsProps) => {
      setSettings((current) => {
        const compactChanged = current.compact !== nextSettings.compact;

        return {
          ...nextSettings,
          ...(compactChanged
            ? {
                layout: nextSettings.compact === "small" ? "compact" : "expanded",
              }
            : {}),
        };
      });
    },
    [setSettings],
  );

  const handleToggleSidebar = useCallback(() => {
    setSettings((current) => {
      const collapsed = current.layout === "compact" || current.compact === "small";

      return {
        ...current,
        layout: collapsed ? "expanded" : "compact",
        compact: collapsed ? "large" : "small",
      };
    });
  }, [setSettings]);

  if (!hydrated) {
    return null;
  }

  return (
    <AppProvider lightTheme={lightMode} darkTheme={darkMode} themeMode={settings.mode}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          bgcolor: settings.contrast === "positive" ? "background.default" : "background.paper",
        }}
      >
        <SidebarNavigation
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapsed={handleToggleSidebar}
          navigationColor={settings.color}
          width={sidebarWidth}
        />

        <Box
          component="main"
          sx={{
            height: "100vh",
            ml: { md: `${sidebarWidth}px` },
            overflow: "hidden",
            transition: "margin-left 180ms ease",
          }}
        >
          <Box
            component="header"
            sx={{
              height: 72,
              px: { xs: 2, md: 4 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(29,35,42,0.72)" : "rgba(255,255,255,0.72)",
              backdropFilter: "blur(8px)",
              position: "sticky",
              top: 0,
              zIndex: 20,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
              <IconButton
                aria-label="Abrir navegação"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" } }}
              >
                <Menu size={22} />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography color="text.primary" fontSize={{ xs: 16, md: 19 }} fontWeight={900} noWrap>
                  Portal de Testagem Laboratorial
                </Typography>
                <Typography color="text.secondary" fontSize={13} fontWeight={700} noWrap>
                  {page.title}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <SettingsDrawer settings={settings} handleSetAppSettings={handleSetSettings} />
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                OL
              </Avatar>
            </Stack>
          </Box>

          <Box
            sx={{
              height: "calc(100vh - 72px)",
              overflowY: "auto",
              overflowX: "hidden",
              px: contentPaddingX,
              py: { xs: 2.5, md: 3.5 },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AppProvider>
  );
}
