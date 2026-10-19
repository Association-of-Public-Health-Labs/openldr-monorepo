"use client";

import { useSyncExternalStore } from "react";
import type { SettingsProps } from "../app/molecules/headers/SettingsDrawer";

export type LayoutSettings = SettingsProps;

export const LAYOUT_SETTINGS_KEY = "layout-settings";

// The defaults of the per-app zustand stores this replaces.
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  mode: "light",
  contrast: "positive",
  layout: "compact",
  compact: "large",
  color: "apparent",
  rightPanelWidth: 25,
  leftPanelWidth: 75,
};

const CHOICES = {
  mode: ["light", "dark"],
  contrast: ["positive", "negative"],
  layout: ["expanded", "compact", "stacked"],
  compact: ["small", "large"],
  color: ["integrate", "apparent"],
} as const;

function pick<K extends keyof typeof CHOICES>(key: K, value: unknown): LayoutSettings[K] {
  return ((CHOICES[key] as readonly unknown[]).includes(value) ? value : DEFAULT_LAYOUT_SETTINGS[key]) as LayoutSettings[K];
}

function width(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Reads the old zustand persist format; bad fields fall back to the defaults one by one. */
export function parseLayoutSettings(raw: string | null): LayoutSettings {
  let stored: Record<string, unknown> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    const settings = parsed?.state?.settings;
    if (settings && typeof settings === "object") stored = settings;
  } catch {
    // unparsable: defaults
  }
  return {
    mode: pick("mode", stored.mode),
    contrast: pick("contrast", stored.contrast),
    layout: pick("layout", stored.layout),
    compact: pick("compact", stored.compact),
    color: pick("color", stored.color),
    rightPanelWidth: width(stored.rightPanelWidth, DEFAULT_LAYOUT_SETTINGS.rightPanelWidth),
    leftPanelWidth: width(stored.leftPanelWidth, DEFAULT_LAYOUT_SETTINGS.leftPanelWidth),
  };
}

export function serializeLayoutSettings(settings: LayoutSettings): string {
  return JSON.stringify({ state: { settings }, version: 0 });
}


export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createLayoutSettingsStore(storage: () => StorageLike | undefined) {
  let current: LayoutSettings | null = null;
  const listeners = new Set<() => void>();

  function get(): LayoutSettings {
    if (current === null) {
      let raw: string | null = null;
      try {
        raw = storage()?.getItem(LAYOUT_SETTINGS_KEY) ?? null;
      } catch {
        raw = null;
      }
      current = parseLayoutSettings(raw);
    }
    return current;
  }

  function set(settings: LayoutSettings) {
    current = settings;
    try {
      storage()?.setItem(LAYOUT_SETTINGS_KEY, serializeLayoutSettings(settings));
    } catch {
      // storage blocked: keep the in-memory value
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { get, set, subscribe };
}

export const layoutSettingsStore = createLayoutSettingsStore(() =>
  typeof window === "undefined" ? undefined : window.localStorage,
);

/** Shared by the shell and app layouts (TB reads the AI chat panel widths). */
export function useLayoutSettings() {
  const settings = useSyncExternalStore(layoutSettingsStore.subscribe, layoutSettingsStore.get, layoutSettingsStore.get);
  return { settings, setSettings: layoutSettingsStore.set };
}
