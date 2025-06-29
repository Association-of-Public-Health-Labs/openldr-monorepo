"use client"
import { useEffect, useState } from "react"
import {DashboardLayout} from "@repo/design_system/templates/DashboardLayout"
import {IconlyGrid} from "@repo/design_system/atoms/icons/Grid"
import {IconlyLab} from "@repo/design_system/atoms/icons/Lab"
import {IconlyLocation} from "@repo/design_system/atoms/icons/Location"
import { SettingsProps } from "@repo/design_system/molecules/headers/SettingsDrawer"
import { useLayoutSettings } from "../../hooks/useLayoutSettings"
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider"
import { AppProvider } from "@repo/design_system/contexts/AppContext"
import { darkMode } from "../../themes/dark"
import { lightMode } from "../../themes/light"
import { useUser, useAuth, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs"

const navbarSettings = {
  options: [
    { label: "Dashboard", icon: <IconlyGrid/>, action: () => {}, active: true},
    { label: "Laboratorio", icon: <IconlyLab/>, action: () => {} },
    { label: "Provincia", icon: <IconlyLocation/>, action: () => {} },
  ]
}



export default function Layout({children}: {children: React.ReactNode}) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSetAppSettings = (settings: SettingsProps) => {
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
          pagename="Dashboard"
          options={navbarSettings.options}
          user={{
            name: user?.fullName || "",
            avatar: user?.imageUrl || "",
            email: user?.emailAddresses[0].emailAddress || "",
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