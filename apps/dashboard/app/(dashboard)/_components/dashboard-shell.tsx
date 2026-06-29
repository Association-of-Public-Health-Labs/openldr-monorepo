"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@repo/design_system/contexts";
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout";
import type { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer";
import { light } from "@repo/design_system/themes/light";
import { dark } from "@repo/design_system/themes/dark";
import { getDashboardNavigationOptions, getPageTitle } from "../../../config/navigation";

const DEFAULT_SETTINGS: SettingsProps = {
  mode: "light",
  contrast: "positive",
  layout: "expanded",
  compact: "large",
  color: "apparent",
  rightPanelWidth: 25,
  leftPanelWidth: 75,
};

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SettingsProps>(DEFAULT_SETTINGS);

  const navigationOptions = useMemo(
    () => getDashboardNavigationOptions(pathname),
    [pathname],
  );

  return (
    <AppProvider lightTheme={light} darkTheme={dark} themeMode={settings.mode}>
      <DashboardLayout
        aiChatIsOpen={false}
        handleSetAppSettings={setSettings}
        options={navigationOptions}
        pagename={getPageTitle(pathname)}
        settings={settings}
        user={{
          name: "Utilizador OpenLDR",
          email: "utilizador@openldr.org.mz",
        }}
      >
        {children}
      </DashboardLayout>
    </AppProvider>
  );
}
