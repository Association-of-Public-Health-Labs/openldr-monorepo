"use client"
import { useEffect, useState } from "react"
import {DashboardLayout} from "@repo/design_system/app/templates/DashboardLayout"
import {IconlyGrid} from "@repo/design_system/app/atoms/icons/Grid"
import {IconlyLab} from "@repo/design_system/app/atoms/icons/Lab"
import {IconlyLocation} from "@repo/design_system/app/atoms/icons/Location"
import {IconlyPatients} from "@repo/design_system/app/atoms/icons/Patients"
import { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer"
import { useLayoutSettings } from "../../hooks/useLayoutSettings"
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider"
import { AppProvider } from "@repo/design_system/contexts"
import { darkMode } from "../../themes/dark"
import { lightMode } from "../../themes/light"
import { useUser, useAuth, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation";

const SMALL_SCREEN_BREAKPOINT = 1280; // xl breakpoint - covers tablets and small laptops

export default function Layout({children}: {children: React.ReactNode}) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Set compact to "large" on small screens for better UX
  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
      if (isSmallScreen && settings.compact !== "large") {
        setSettings({ ...settings, compact: "large" });
      }
    };

    // Check on mount
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settings, setSettings]);

  // Map pathnames to option labels
  const pathToLabel: Record<string, string> = {
    "/": "Sumário",
    "/lab": "Laboratório",
    "/clinic": "Província",
    "/patients": "Resultados de Pacientes"
  };

  // Compute active option based on current pathname
  const navbarOptions = [
    { label: "Sumário", icon: <IconlyGrid style="two-tone" size={18}/>, href: "/", active: false },
    { label: "Laboratório", icon: <IconlyLab style="two-tone" size={19}/>, href: "/lab", active: false },
    { label: "Província", icon: <IconlyLocation style="two-tone" size={19}/>, href: "/clinic", active: false },
    { label: "Pacientes", icon: <IconlyPatients style="two-tone" size={19}/>, href: "/patients", active: false },
  ].map(option => ({
    ...option,
    active: option.href === pathname
  }));   

  const handleSetAppSettings = (settings: SettingsProps) => {
    setTheme(settings.mode);
    setSettings(settings);
  };

  if (!mounted) {
    return null; 
  }

  return (
    <AppProvider
      lightTheme={lightMode}
      darkTheme={darkMode}
      themeMode={settings?.mode}  
    >
      <AIChatProvider 
        dashboard="tb" 
        panelSizes={{ left: settings.leftPanelWidth, right: settings.rightPanelWidth }}
        onPanelResize={(sizes) => {
          setSettings({
            ...settings,
            leftPanelWidth: sizes.left,
            rightPanelWidth: sizes.right
          })
        }}
      >
        <DashboardLayout 
          pagename={pathToLabel[pathname]}
          options={navbarOptions}
          user={{
            name: user?.fullName || "",
            avatar: user?.imageUrl || "",
            email: user?.emailAddresses[0].emailAddress || "",
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