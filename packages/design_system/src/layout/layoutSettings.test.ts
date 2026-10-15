import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LAYOUT_SETTINGS,
  LAYOUT_SETTINGS_KEY,
  applySmallScreenRule,
  createLayoutSettingsStore,
  parseLayoutSettings,
  serializeLayoutSettings,
  type StorageLike,
} from "./layoutSettings";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
}

describe("parseLayoutSettings", () => {
  it("uses the old defaults when nothing is stored", () => {
    expect(parseLayoutSettings(null)).toEqual({
      mode: "light", contrast: "positive", layout: "compact", compact: "large",
      color: "apparent", rightPanelWidth: 25, leftPanelWidth: 75,
    });
  });

  it("reads the old zustand persist format", () => {
    const raw = JSON.stringify({ state: { settings: { ...DEFAULT_LAYOUT_SETTINGS, layout: "expanded", color: "integrate" } }, version: 0 });
    expect(parseLayoutSettings(raw)).toMatchObject({ layout: "expanded", color: "integrate" });
  });

  it("falls back field by field on bad data", () => {
    const raw = JSON.stringify({ state: { settings: { layout: "wide", mode: "dark", leftPanelWidth: "x" } }, version: 0 });
    expect(parseLayoutSettings(raw)).toEqual({ ...DEFAULT_LAYOUT_SETTINGS, mode: "dark" });
  });

  it("ignores unparsable or wrongly shaped data", () => {
    expect(parseLayoutSettings("oops")).toEqual(DEFAULT_LAYOUT_SETTINGS);
    expect(parseLayoutSettings("{}")).toEqual(DEFAULT_LAYOUT_SETTINGS);
    expect(parseLayoutSettings("null")).toEqual(DEFAULT_LAYOUT_SETTINGS);
  });
});

describe("serializeLayoutSettings", () => {
  it("writes the zustand persist format back", () => {
    expect(JSON.parse(serializeLayoutSettings(DEFAULT_LAYOUT_SETTINGS))).toEqual({
      state: { settings: DEFAULT_LAYOUT_SETTINGS }, version: 0,
    });
  });
});

describe("applySmallScreenRule", () => {
  it("forces large padding below 1280px", () => {
    const s = { ...DEFAULT_LAYOUT_SETTINGS, compact: "small" as const };
    expect(applySmallScreenRule(s, 1279).compact).toBe("large");
    expect(applySmallScreenRule(s, 1280)).toBe(s);
  });
});

describe("createLayoutSettingsStore", () => {
  it("loads lazily from storage, saves on set and notifies subscribers", () => {
    const storage = memoryStorage({ [LAYOUT_SETTINGS_KEY]: serializeLayoutSettings({ ...DEFAULT_LAYOUT_SETTINGS, layout: "stacked" }) });
    const store = createLayoutSettingsStore(() => storage);
    expect(store.get().layout).toBe("stacked");

    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set({ ...store.get(), layout: "expanded" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(parseLayoutSettings(storage.data[LAYOUT_SETTINGS_KEY]).layout).toBe("expanded");

    unsubscribe();
    store.set({ ...store.get(), layout: "compact" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("returns the same object until it changes (stable snapshot)", () => {
    const store = createLayoutSettingsStore(() => memoryStorage());
    expect(store.get()).toBe(store.get());
  });

  it("works without storage (server, private mode)", () => {
    const store = createLayoutSettingsStore(() => undefined);
    expect(store.get()).toEqual(DEFAULT_LAYOUT_SETTINGS);
    store.set({ ...DEFAULT_LAYOUT_SETTINGS, layout: "expanded" });
    expect(store.get().layout).toBe("expanded");
  });

  it("survives a storage that throws", () => {
    const store = createLayoutSettingsStore(() => ({
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    }));
    expect(store.get()).toEqual(DEFAULT_LAYOUT_SETTINGS);
    expect(() => store.set({ ...DEFAULT_LAYOUT_SETTINGS, layout: "expanded" })).not.toThrow();
    expect(store.get().layout).toBe("expanded");
  });
});
