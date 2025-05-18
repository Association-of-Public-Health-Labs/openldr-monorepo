// stores/useLayoutSettings.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SettingsProps } from "@repo/design_system/molecules/headers/SettingsDrawer";

interface LayoutSettingsState {
  settings: SettingsProps;
  setSettings: (settings: SettingsProps) => void;
}

export const useLayoutSettings = create<LayoutSettingsState>()(
  persist(
    (set) => ({
      settings: {
        mode: "light",
        contrast: "positive",
        layout: "compact",
        compact: "large",
        color: "apparent",
      },
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: "layout-settings", // key in localStorage
    }
  )
);