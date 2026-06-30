"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import { AppProvider } from "@repo/design_system/contexts";
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout";
import type { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer";
import {
  Activity,
  Baby,
  FlaskConical,
  Grid2X2,
  MapPinned,
  Route,
  Search,
  TestTubeDiagonal,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { getActivePage } from "@/config/navigation";
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

  const navbarOptions = useMemo(
    () => [
      {
        label: "Sumário Geral",
        icon: <Grid2X2 size={18} />,
        href: "/summary",
        active: pathname === "/summary",
      },
      {
        label: "TB Sumário",
        icon: <Activity size={18} />,
        href: "/tb",
        active: pathname === "/tb",
      },
      {
        label: "TB Lab",
        icon: <FlaskConical size={18} />,
        href: "/tb/lab",
        active: pathname === "/tb/lab",
      },
      {
        label: "TB Província",
        icon: <MapPinned size={18} />,
        href: "/tb/clinic",
        active: pathname === "/tb/clinic",
      },
      {
        label: "TB Pacientes",
        icon: <Search size={18} />,
        href: "/tb/patients",
        active: pathname === "/tb/patients",
      },
      {
        label: "CV Sumário",
        icon: <TestTubeDiagonal size={18} />,
        href: "/viral-load",
        active: pathname === "/viral-load",
      },
      {
        label: "CV Lab",
        icon: <FlaskConical size={18} />,
        href: "/viral-load/lab",
        active: pathname === "/viral-load/lab",
      },
      {
        label: "CV Província",
        icon: <MapPinned size={18} />,
        href: "/viral-load/clinic",
        active: pathname === "/viral-load/clinic",
      },
      {
        label: "CV Pacientes",
        icon: <Search size={18} />,
        href: "/viral-load/patients",
        active: pathname === "/viral-load/patients",
      },
      {
        label: "DPI Sumário",
        icon: <Baby size={18} />,
        href: "/dpi",
        active: pathname === "/dpi",
      },
      {
        label: "DPI Lab",
        icon: <FlaskConical size={18} />,
        href: "/dpi/lab",
        active: pathname === "/dpi/lab",
      },
      {
        label: "DPI Província",
        icon: <MapPinned size={18} />,
        href: "/dpi/clinic",
        active: pathname === "/dpi/clinic",
      },
      {
        label: "DPI Rotas",
        icon: <Route size={18} />,
        href: "/dpi/routes",
        active: pathname === "/dpi/routes",
      },
    ],
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
          pagename={page.title}
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
