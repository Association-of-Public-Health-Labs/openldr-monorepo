"use client"
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
import { useEffect, useState } from "react"

const navbarSettings = {
  options: [
    { label: "Dashboard", icon: <IconlyGrid/>, action: () => {}, active: true},
    { label: "Laboratorio", icon: <IconlyLab/>, action: () => {} },
    { label: "Provincia", icon: <IconlyLocation/>, action: () => {} },
  ]
}

const user = {
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  email: "jhon.doe@example.com",
};


export default function Layout({children}: {children: React.ReactNode}) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);

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
          user={user}
          settings={settings}
          handleSetAppSettings={handleSetAppSettings}
        >
          {children}
        </DashboardLayout> 
      </AIChatProvider>
    </AppProvider>
  );
}