"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import { AppProvider } from "@repo/design_system/contexts";
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout";
import type { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { DASHBOARD_APP_TITLE, getDocumentTitle } from "@/config/page-titles";
import { getActivePage, getModuleIcon, isNavigationNodeActive, navigationItems } from "@/config/navigation";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { darkMode } from "@/themes/dark";
import { lightMode } from "@/themes/light";

const SMALL_SCREEN_BREAKPOINT = 1280;

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
      if (isSmallScreen && settings.compact !== "large") {
        setSettings({ ...settings, compact: "large" });
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settings, setSettings]);

  const page = useMemo(() => getActivePage(pathname), [pathname]);

  useEffect(() => {
    document.title = getDocumentTitle(page.title);
  }, [page.title]);

  const navbarOptions = useMemo(
    () =>
      navigationItems.map((item) => ({
        label: item.label,
        icon: item.icon,
        href: item.href || item.children?.[0]?.href,
        basePath: item.basePath,
        active: isNavigationNodeActive(item, pathname),
        hideLabelWhenCompact: true,
        children: item.children?.map((child) => ({
          label: child.label,
          icon: getModuleIcon(child.label),
          href: child.href,
          active: pathname === child.href,
        })),
      })),
    [pathname],
  );

  const handleSetAppSettings = (nextSettings: SettingsProps) => {
    setTheme(nextSettings.mode);
    setSettings(nextSettings);
  };

  if (!mounted) {
    return null;
  }

  return (
    <AppProvider lightTheme={lightMode} darkTheme={darkMode} themeMode={settings.mode}>
      <AIChatProvider
        dashboard="tb"
        panelSizes={{ left: settings.leftPanelWidth, right: settings.rightPanelWidth }}
        onPanelResize={(sizes) => {
          setSettings({
            ...settings,
            leftPanelWidth: sizes.left,
            rightPanelWidth: sizes.right,
          });
        }}
      >
        <DashboardLayout
          appTitle={DASHBOARD_APP_TITLE}
          pagename={page.title}
          titleMode="separated"
          options={navbarOptions}
          user={{
            name: user?.fullName || "",
            avatar: user?.imageUrl || "",
            email: user?.emailAddresses[0]?.emailAddress || "",
            signOut: () => signOut(),
          }}
          settings={settings}
          handleSetAppSettings={handleSetAppSettings}
        >
          {children}
        </DashboardLayout>
      </AIChatProvider>
    </AppProvider>
  );
}
