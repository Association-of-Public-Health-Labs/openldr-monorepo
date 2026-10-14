"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLab } from "@repo/design_system/app/atoms/icons/Lab"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer"
import { AppProvider } from "@repo/design_system/contexts"
import { useUser, useAuth } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useLayoutSettings } from "../../hooks/useLayoutSettings"
import { darkMode } from "../../themes/dark"
import { lightMode } from "../../themes/light"
import { AdminProvider, useIsAdmin } from "@/lib/vl/admin"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/vl/nav"

const SMALL_SCREEN_BREAKPOINT = 1280;

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  lab: <IconlyLab style="two-tone" size={19} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < SMALL_SCREEN_BREAKPOINT && settings.compact !== "large") {
        setSettings({ ...settings, compact: "large" });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settings, setSettings]);

  const options = buildNavItems(pathname, isAdmin).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  const handleSetAppSettings = (next: SettingsProps) => {
    setTheme(next.mode);
    setSettings(next);
  };

  if (!mounted) return null;

  return (
    <AppProvider lightTheme={lightMode} darkTheme={darkMode} themeMode={settings?.mode}>
      <DashboardLayout
        portalTitle="Portal de Carga Viral"
        aiChatIsOpen={false}
        pagename={PAGE_LABELS[pathname]}
        options={options}
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
    </AppProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
