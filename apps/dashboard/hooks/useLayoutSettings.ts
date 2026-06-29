"use client";

import { useCallback, useEffect, useState, type SetStateAction } from "react";
import type { SettingsProps } from "@repo/design_system_mui/molecules/headers/SettingsDrawer";

export const DASHBOARD_LAYOUT_SETTINGS_KEY = "openldr-dashboard-layout-settings";

export const defaultDashboardLayoutSettings: SettingsProps = {
  mode: "light",
  contrast: "positive",
  layout: "compact",
  compact: "large",
  color: "apparent",
  rightPanelWidth: 25,
  leftPanelWidth: 75,
};

function normalizeSettings(value: Partial<SettingsProps> | null): SettingsProps {
  return {
    ...defaultDashboardLayoutSettings,
    ...(value ?? {}),
  };
}

export function useLayoutSettings() {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettingsState] = useState<SettingsProps>(defaultDashboardLayoutSettings);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DASHBOARD_LAYOUT_SETTINGS_KEY);
      const parsed = stored ? (JSON.parse(stored) as Partial<SettingsProps>) : null;
      setSettingsState(normalizeSettings(parsed));
    } catch {
      setSettingsState(defaultDashboardLayoutSettings);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(DASHBOARD_LAYOUT_SETTINGS_KEY, JSON.stringify(settings));
  }, [hydrated, settings]);

  const setSettings = useCallback((next: SetStateAction<SettingsProps>) => {
    setSettingsState((current) => normalizeSettings(typeof next === "function" ? next(current) : next));
  }, []);

  return {
    hydrated,
    settings,
    setSettings,
  };
}
