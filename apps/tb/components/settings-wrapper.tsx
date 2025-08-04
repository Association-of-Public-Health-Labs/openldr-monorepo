// apps/tb-v2/app/(dashboard)/settings-wrapper.tsx
"use client"
import { useState } from "react"
import { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer"
import { useLayoutSettings } from "../hooks/useLayoutSettings"
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout"
import {IconlyGrid} from "@repo/design_system/app/atoms/icons/Grid"
import {IconlyLab} from "@repo/design_system/app/atoms/icons/Lab"
import {IconlyLocation} from "@repo/design_system/app/atoms/icons/Location"

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

export function SettingsWrapper({ children }: { children: React.ReactNode }) {
  const { settings, setSettings } = useLayoutSettings();

  const handleSetAppSettings = (settings: SettingsProps) => {
    setSettings(settings);
  };

  return (
    <DashboardLayout 
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