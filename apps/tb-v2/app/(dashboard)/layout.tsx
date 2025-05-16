"use client"
import { useState } from "react"
import {DashboardLayout} from "@repo/design_system/templates/DashboardLayout"
import {IconlyGrid} from "@repo/design_system/atoms/icons/Grid"
import {IconlyLab} from "@repo/design_system/atoms/icons/Lab"
import {IconlyLocation} from "@repo/design_system/atoms/icons/Location"
import { SettingsProps } from "@repo/design_system/molecules/headers/SettingsDrawer"

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
  const [settings, setSettings] = useState<SettingsProps>({
    mode: "light",
    contrast: "positive",
    layout: "expanded",
    compact: "large",
  });

  const handleSetAppSettings = (settings: SettingsProps) => {
    console.log(settings);
    setSettings(settings);
  };

  return (
    <DashboardLayout 
      expanded={false} 
      color="integrate" 
      stacked={false}
      pagename="Dashboard"
      options={navbarSettings.options}
      user={user}
      settings={settings}
      handleSetAppSettings={handleSetAppSettings}
    >
      {children}
    </DashboardLayout>
  );
}