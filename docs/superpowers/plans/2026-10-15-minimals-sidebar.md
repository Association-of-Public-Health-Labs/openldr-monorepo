# Minimals-Style Sidebar and Restored Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring back the old settings drawer with all seven settings, and give the left sidebar (layouts `expanded`/`compact`) the Minimals look, including its round collapse button; `stacked` shows the old MUI top layout unchanged.

**Architecture:** A shared settings store (`useSyncExternalStore`, same `localStorage["layout-settings"]` format as the old zustand store) feeds `DashboardShell`. For `expanded`/`compact` the shell renders a new `ShellSidebar` (custom `<aside>` with Minimals styles from pure helpers in `sidebar-styles.ts`), still inside shadcn's `SidebarProvider` so the unchanged switcher keeps its context; for `stacked` it renders the old `DashboardLayout`. The header swaps the "Modo" menu for the old `SettingsDrawer`.

**Tech Stack:** Next.js 15, React 18 (`useSyncExternalStore`), Tailwind CSS 4, shadcn/Radix (`sidebar`, `sheet`, `tooltip`), MUI 6 (old drawer and stacked layout only), next-themes, Vitest 3.

**Spec:** `docs/superpowers/specs/2026-10-15-minimals-sidebar-design.md` (amends `docs/superpowers/specs/2026-10-14-platform-foundation-shell-design.md`)

## Global Constraints

- Governing rule (platform spec): only the shell changes. Cards, card menus, filters, exports, nav items, routes and behaviour stay exactly as they are.
- The `SettingsDrawer` and `DashboardLayout` code in `design_system_mui` is **not edited**; use them through `@repo/design_system` re-exports (inside the package: `../app/molecules/headers/SettingsDrawer`, `../app/templates/DashboardLayout`).
- Storage key `layout-settings`, format `{"state":{"settings":{…}},"version":0}`.
- Defaults: `mode: "light"`, `contrast: "positive"`, `layout: "compact"`, `compact: "large"`, `color: "apparent"`, `rightPanelWidth: 25`, `leftPanelWidth: 75`.
- Small-screen rule: below 1280px wide, `compact` is forced to `"large"`.
- Measured Minimals values (spec §4) are copied verbatim into `sidebar-styles.ts`; do not round or "improve" them.
- Expanded sidebar 300px, compact 88px. Collapse button 26px, centre on the sidebar's right edge, 36px from the top.
- No new dependencies; never run plain `pnpm install` (ruling R-d). No zustand in the package.
- New package code uses relative imports only.
- Portuguese UI text: button labels "Recolher menu" / "Expandir menu", mobile button "Menu".
- Work on `feat/platform-shell` in the worktree; never push, PR, merge or touch Coolify without asking.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Corrupt or old-format storage** (`layout-settings` holding `"oops"`, `{}`, an unknown `layout: "wide"`, or a pre-existing value from the old zustand store): the app must load with defaults for the bad fields and keep the good ones. Pinned in Task 1.
2. **Drawer and round button disagree**: after clicking the round button, opening the drawer must show the new layout selected. Pinned by the `key` in Task 4 (the drawer test asserts it receives the current `layout`) and checked by hand in Task 5 Step 4.
3. **Stacked layout loses the switcher path back**: in `stacked`, the drawer must still be reachable (it is inside the old layout's header) and switching to `expanded` must render the new sidebar. Pinned in Task 4 (stacked render test passes `settings` and `handleSetAppSettings` to the old layout).
4. **Mode toggled in the drawer leaves next-themes behind** (Tailwind stays light while MUI goes dark): `handleSetAppSettings` must call `setTheme` when `mode` changes. Pinned in Task 4.
5. **Keyboard shortcut Ctrl/Cmd+B** (shadcn's sidebar toggle) must change the `layout` setting, not a hidden cookie state, so the drawer, button and sidebar stay in sync. Built in Task 4 (`SidebarProvider` controlled by `layout`), checked by hand in Task 5 Step 4.

---

## File structure

| File | Responsibility |
|------|----------------|
| `packages/design_system/src/layout/layoutSettings.ts` | Settings type re-export, defaults, parse/serialize, small-screen rule, the shared store and `useLayoutSettings()` hook |
| `packages/design_system/src/layout/layoutSettings.test.ts` | Store tests |
| `packages/design_system/src/layout/sidebar-styles.ts` | Pure: Minimals class names/colours for container, items, button, per `color` and mode |
| `packages/design_system/src/layout/sidebar-styles.test.ts` | Style helper tests |
| `packages/design_system/src/layout/CollapseButton.tsx` | Round collapse/expand button |
| `packages/design_system/src/layout/ShellSidebar.tsx` | Desktop sidebar (expanded/compact) and the mobile sheet content |
| `packages/design_system/src/layout/ShellHeader.tsx` | Modify: old `SettingsDrawer` instead of "Modo"; mobile menu button |
| `packages/design_system/src/layout/DashboardShell.tsx` | Modify: owns settings; left layouts vs old stacked layout; contrast/padding; small-screen rule |
| `packages/design_system/src/layout/DashboardShell.test.tsx` | Modify: mocks the MUI drawer/layout; new layout tests |
| `packages/design_system/src/layout/shell-utils.ts` | Modify: drop `readSidebarOpen`, `SIDEBAR_WIDTH*` (no longer used) |
| `apps/tb/app/(dashboard)/layout.tsx` | Modify: panel widths from settings |

---

### Task 1: Shared layout settings store

**Files:**
- Create: `packages/design_system/src/layout/layoutSettings.ts`, `packages/design_system/src/layout/layoutSettings.test.ts`

**Interfaces:**
- Consumes: type `SettingsProps` from `../app/molecules/headers/SettingsDrawer` (type-only import; fields `mode`, `contrast`, `layout`, `compact`, `color`, `rightPanelWidth`, `leftPanelWidth`).
- Produces:
  - `type LayoutSettings = SettingsProps`
  - `const DEFAULT_LAYOUT_SETTINGS: LayoutSettings`
  - `const LAYOUT_SETTINGS_KEY = "layout-settings"`
  - `function parseLayoutSettings(raw: string | null): LayoutSettings`
  - `function serializeLayoutSettings(s: LayoutSettings): string`
  - `function applySmallScreenRule(s: LayoutSettings, viewportWidth: number): LayoutSettings`
  - `interface StorageLike { getItem(k: string): string | null; setItem(k: string, v: string): void }`
  - `function createLayoutSettingsStore(storage: () => StorageLike | undefined): { get(): LayoutSettings; set(s: LayoutSettings): void; subscribe(cb: () => void): () => void }`
  - `const layoutSettingsStore` (uses `window.localStorage` when available)
  - `function useLayoutSettings(): { settings: LayoutSettings; setSettings: (s: LayoutSettings) => void }`

- [ ] **Step 1: Write the failing tests**

`packages/design_system/src/layout/layoutSettings.test.ts`:
```ts
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
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout/layoutSettings`
Expected: FAIL, cannot find module `./layoutSettings`.

- [ ] **Step 3: Implement the store**

`packages/design_system/src/layout/layoutSettings.ts`:
```ts
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

const SMALL_SCREEN_BREAKPOINT = 1280;

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

/** Below 1280px the content always gets the large padding, as the old layouts did. */
export function applySmallScreenRule(settings: LayoutSettings, viewportWidth: number): LayoutSettings {
  return viewportWidth < SMALL_SCREEN_BREAKPOINT && settings.compact !== "large"
    ? { ...settings, compact: "large" }
    : settings;
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
```
(`getServerSnapshot` is `get` too: on the server there is no storage, so it returns the defaults; the shell only renders after mount anyway, behind `PlatformThemeProvider`.)

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS (all previous tests plus the new ones). If the type-only import of `SettingsProps` pulls in the MUI barrel at runtime, change it to `import type` (it already is) and confirm the test does not import MUI: `grep -c design_system_mui` on the vitest output must show no load error.

- [ ] **Step 5: Commit**

```bash
git add packages/design_system/src/layout/layoutSettings.ts packages/design_system/src/layout/layoutSettings.test.ts
git commit -m "feat(design-system): shared layout settings store

Same localStorage key and format as the old per-app zustand stores, so
users keep their saved settings.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Minimals sidebar styles

**Files:**
- Create: `packages/design_system/src/layout/sidebar-styles.ts`, `packages/design_system/src/layout/sidebar-styles.test.ts`

**Interfaces:**
- Consumes: `LayoutSettings` (Task 1).
- Produces:
  - `type SidebarVariant = "expanded" | "compact"`
  - `const SIDEBAR_WIDTHS: Record<SidebarVariant, number>` = `{ expanded: 300, compact: 88 }`
  - `function sidebarContainerClass(color: LayoutSettings["color"]): string`
  - `function navItemClass(opts: { variant: SidebarVariant; color: LayoutSettings["color"]; active: boolean }): string`
  - `function navLabelClass(opts: { variant: SidebarVariant; active: boolean }): string`
  - `function navIconClass(variant: SidebarVariant): string`
  - `const COLLAPSE_BUTTON_CLASS: string`

Measured values (spec §4), used verbatim:
- container `integrate`: page paper background (`bg-white dark:bg-[#1d232a]`, the MUI `background.paper` the old sidebar used), right border `1px rgba(145,158,171,0.12)`; `apparent`: `#141A21`, no border.
- item expanded: `min-h-[44px] rounded-[8px] pt-1 pr-2 pb-1 pl-3`, row; icon `size-6 mr-3`; label `text-[14px] leading-[22px]`, 500 / 600 active.
- item compact: `w-[79px] min-h-[56px] rounded-[8px] pt-2 px-1 pb-1.5`, column, centred; icon `size-[22px] mb-1.5`; label `text-[10px] leading-4 font-bold`.
- inactive colour: `integrate` light `#637381`, `integrate` dark and `apparent` `#919EAB`; hover background `rgba(145,158,171,0.08)`.
- active: background primary at 8% (`bg-primary/8`); colour primary (`integrate`) or a lighter tint (`apparent`: `color-mix(in srgb, var(--primary) 60%, white)`).
- button: `size-[26px] rounded-full border border-[rgba(145,158,171,0.12)] bg-white p-1 text-[#637381]`.

- [ ] **Step 1: Write the failing tests**

`packages/design_system/src/layout/sidebar-styles.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  COLLAPSE_BUTTON_CLASS,
  SIDEBAR_WIDTHS,
  navIconClass,
  navItemClass,
  navLabelClass,
  sidebarContainerClass,
} from "./sidebar-styles";

describe("sidebar-styles", () => {
  it("uses the Minimals widths", () => {
    expect(SIDEBAR_WIDTHS).toEqual({ expanded: 300, compact: 88 });
  });

  it("integrate: paper background with a hairline border; apparent: dark, no border", () => {
    expect(sidebarContainerClass("integrate")).toContain("bg-white");
    expect(sidebarContainerClass("integrate")).toContain("border-[rgba(145,158,171,0.12)]");
    expect(sidebarContainerClass("apparent")).toContain("bg-[#141A21]");
    expect(sidebarContainerClass("apparent")).not.toContain("border-r");
  });

  it("expanded items are 44px rows with the measured padding and radius", () => {
    const c = navItemClass({ variant: "expanded", color: "integrate", active: false });
    for (const token of ["min-h-[44px]", "rounded-[8px]", "pt-1", "pr-2", "pb-1", "pl-3", "flex-row"]) expect(c).toContain(token);
  });

  it("compact items are 79px tiles with icon above label", () => {
    const c = navItemClass({ variant: "compact", color: "integrate", active: false });
    for (const token of ["w-[79px]", "min-h-[56px]", "flex-col", "items-center"]) expect(c).toContain(token);
    expect(navIconClass("compact")).toContain("size-[22px]");
    expect(navLabelClass({ variant: "compact", active: false })).toContain("text-[10px]");
  });

  it("inactive colours follow integrate/apparent and dark mode", () => {
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("text-[#637381]");
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("dark:text-[#919EAB]");
    expect(navItemClass({ variant: "expanded", color: "apparent", active: false })).toContain("text-[#919EAB]");
  });

  it("active items use the dashboard colour on an 8% tint", () => {
    const integrate = navItemClass({ variant: "expanded", color: "integrate", active: true });
    expect(integrate).toContain("bg-primary/8");
    expect(integrate).toContain("text-primary");
    const apparent = navItemClass({ variant: "expanded", color: "apparent", active: true });
    expect(apparent).toContain("text-[color-mix(in_srgb,var(--primary)_60%,white)]");
    expect(navLabelClass({ variant: "expanded", active: true })).toContain("font-semibold");
    expect(navLabelClass({ variant: "expanded", active: false })).toContain("font-medium");
  });

  it("inactive items get the grey hover background", () => {
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("hover:bg-[rgba(145,158,171,0.08)]");
  });

  it("the collapse button is a 26px white circle with a hairline border", () => {
    for (const token of ["size-[26px]", "rounded-full", "bg-white", "border-[rgba(145,158,171,0.12)]", "text-[#637381]"]) {
      expect(COLLAPSE_BUTTON_CLASS).toContain(token);
    }
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout/sidebar-styles`
Expected: FAIL, cannot find module `./sidebar-styles`.

- [ ] **Step 3: Implement**

`packages/design_system/src/layout/sidebar-styles.ts`:
```ts
import type { LayoutSettings } from "./layoutSettings";

// Values measured on minimals.cc (2026-10-15); see the sidebar spec §4.
export type SidebarVariant = "expanded" | "compact";
type NavColor = LayoutSettings["color"];

export const SIDEBAR_WIDTHS: Record<SidebarVariant, number> = { expanded: 300, compact: 88 };

const HAIRLINE = "border-[rgba(145,158,171,0.12)]";

export function sidebarContainerClass(color: NavColor): string {
  return color === "apparent"
    ? "bg-[#141A21]"
    : `bg-white dark:bg-[#1d232a] border-r ${HAIRLINE}`;
}

export function navItemClass({ variant, color, active }: { variant: SidebarVariant; color: NavColor; active: boolean }): string {
  const shape =
    variant === "expanded"
      ? "flex flex-row items-center w-full min-h-[44px] rounded-[8px] pt-1 pr-2 pb-1 pl-3"
      : "flex flex-col items-center justify-center w-[79px] min-h-[56px] rounded-[8px] pt-2 px-1 pb-1.5 text-center";

  const tone = active
    ? color === "apparent"
      ? "bg-primary/8 text-[color-mix(in_srgb,var(--primary)_60%,white)]"
      : "bg-primary/8 text-primary"
    : color === "apparent"
      ? "text-[#919EAB] hover:bg-[rgba(145,158,171,0.08)]"
      : "text-[#637381] dark:text-[#919EAB] hover:bg-[rgba(145,158,171,0.08)]";

  return `${shape} ${tone} transition-colors`;
}

export function navIconClass(variant: SidebarVariant): string {
  return variant === "expanded"
    ? "flex size-6 shrink-0 items-center justify-center mr-3"
    : "flex size-[22px] shrink-0 items-center justify-center mb-1.5";
}

export function navLabelClass({ variant, active }: { variant: SidebarVariant; active: boolean }): string {
  return variant === "expanded"
    ? `min-w-0 flex-1 truncate text-[14px] leading-[22px] ${active ? "font-semibold" : "font-medium"}`
    : "w-full truncate text-[10px] leading-4 font-bold";
}

export const COLLAPSE_BUTTON_CLASS =
  `flex size-[26px] items-center justify-center rounded-full border ${HAIRLINE} bg-white p-1 text-[#637381] hover:bg-[#F4F6F8]`;
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/design_system/src/layout/sidebar-styles.ts packages/design_system/src/layout/sidebar-styles.test.ts
git commit -m "feat(design-system): Minimals sidebar style values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Collapse button and ShellSidebar

**Files:**
- Create: `packages/design_system/src/layout/CollapseButton.tsx`, `packages/design_system/src/layout/ShellSidebar.tsx`
- Test: `packages/design_system/src/layout/ShellSidebar.test.tsx`

**Interfaces:**
- Consumes: `sidebar-styles` (Task 2); `DashboardSwitcher` (existing, unchanged; needs shadcn `SidebarProvider` context, provided by the shell in Task 4 and by the test wrapper here); `ShellNavItem` type from `./DashboardShell`; `LayoutSettings["color"]`; `DashboardId`.
- Produces:
  - `function CollapseButton(props: { expanded: boolean; onToggle: () => void }): JSX.Element` — `aria-label` "Recolher menu" when expanded, "Expandir menu" when compact; `data-slot="shell-collapse-button"`.
  - `function ShellSidebar(props: { dashboard: DashboardId; nav: ShellNavItem[]; variant: SidebarVariant; color: LayoutSettings["color"]; onToggle: () => void }): JSX.Element` — desktop `<aside data-slot="shell-sidebar" data-variant={variant}>`, hidden below `md`, with the collapse button.
  - `function ShellNavList(props: { nav: ShellNavItem[]; variant: SidebarVariant; color: LayoutSettings["color"] }): JSX.Element` — the item list (reused by the mobile sheet in Task 4).

- [ ] **Step 1: Write the failing tests**

`packages/design_system/src/layout/ShellSidebar.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "../components/ui/sidebar";
import { ShellSidebar } from "./ShellSidebar";

const nav = [
  { label: "Sumário", href: "/", active: true },
  { label: "Laboratório", href: "/lab", active: false },
];

function render(variant: "expanded" | "compact", color: "integrate" | "apparent" = "integrate") {
  return renderToStaticMarkup(
    <SidebarProvider open={variant === "expanded"} onOpenChange={() => {}}>
      <ShellSidebar dashboard="vl" nav={nav} variant={variant} color={color} onToggle={() => {}} />
    </SidebarProvider>,
  );
}

describe("ShellSidebar", () => {
  it("expanded: 300px wide, items as rows, button says collapse", () => {
    const html = render("expanded");
    expect(html).toContain('data-variant="expanded"');
    expect(html).toContain("width:300px");
    expect(html).toContain("min-h-[44px]");
    expect(html).toContain('aria-label="Recolher menu"');
    expect(html).toContain("Carga Viral"); // switcher kept
  });

  it("compact: 88px wide, items as tiles, button says expand", () => {
    const html = render("compact");
    expect(html).toContain("width:88px");
    expect(html).toContain("w-[79px]");
    expect(html).toContain('aria-label="Expandir menu"');
  });

  it("marks the active item and keeps every nav link", () => {
    const html = render("expanded");
    expect(html).toMatch(/aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/);
    expect(html).toContain('href="/lab"');
    expect(html).toContain("bg-primary/8");
  });

  it("apparent colour gives the dark sidebar", () => {
    expect(render("expanded", "apparent")).toContain("bg-[#141A21]");
  });

  it("renders with no nav items", () => {
    const html = renderToStaticMarkup(
      <SidebarProvider open onOpenChange={() => {}}>
        <ShellSidebar dashboard="tb" nav={[]} variant="expanded" color="integrate" onToggle={() => {}} />
      </SidebarProvider>,
    );
    expect(html).toContain("Tuberculose");
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout/ShellSidebar`
Expected: FAIL, cannot find module `./ShellSidebar`.

- [ ] **Step 3: Implement the button**

`packages/design_system/src/layout/CollapseButton.tsx`:
```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLAPSE_BUTTON_CLASS } from "./sidebar-styles";

export function CollapseButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const Icon = expanded ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      data-slot="shell-collapse-button"
      aria-label={expanded ? "Recolher menu" : "Expandir menu"}
      onClick={onToggle}
      className={COLLAPSE_BUTTON_CLASS}
    >
      <Icon className="size-4" />
    </button>
  );
}
```

- [ ] **Step 4: Implement the sidebar**

`packages/design_system/src/layout/ShellSidebar.tsx`:
```tsx
"use client";

import type { DashboardId } from "../dashboards";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { CollapseButton } from "./CollapseButton";
import { DashboardSwitcher } from "./DashboardSwitcher";
import type { ShellNavItem } from "./DashboardShell";
import type { LayoutSettings } from "./layoutSettings";
import {
  SIDEBAR_WIDTHS,
  navIconClass,
  navItemClass,
  navLabelClass,
  sidebarContainerClass,
  type SidebarVariant,
} from "./sidebar-styles";

type NavColor = LayoutSettings["color"];

export function ShellNavList({ nav, variant, color }: { nav: ShellNavItem[]; variant: SidebarVariant; color: NavColor }) {
  return (
    <ul className={`flex flex-col gap-1 ${variant === "expanded" ? "px-4" : "items-center px-1"}`}>
      {nav.map((item) => {
        const link = (
          <a
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            data-active={item.active}
            className={navItemClass({ variant, color, active: item.active })}
          >
            {item.icon ? <span className={navIconClass(variant)}>{item.icon}</span> : null}
            <span className={navLabelClass({ variant, active: item.active })}>{item.label}</span>
          </a>
        );
        return (
          <li key={item.href}>
            {variant === "compact" ? (
              <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop sidebar, fixed at the left (layouts "expanded" and "compact"). */
export function ShellSidebar({
  dashboard,
  nav,
  variant,
  color,
  onToggle,
}: {
  dashboard: DashboardId;
  nav: ShellNavItem[];
  variant: SidebarVariant;
  color: NavColor;
  onToggle: () => void;
}) {
  const width = SIDEBAR_WIDTHS[variant];
  return (
    <aside
      data-slot="shell-sidebar"
      data-variant={variant}
      // The switcher's shadcn classes read these, as they did inside <Sidebar collapsible="icon">.
      data-state={variant === "expanded" ? "expanded" : "collapsed"}
      data-collapsible={variant === "compact" ? "icon" : ""}
      style={{ width }}
      className={`group peer relative hidden h-svh shrink-0 md:block ${color === "apparent" ? "dark text-white" : ""}`}
    >
      <div className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto ${sidebarContainerClass(color)}`} style={{ width }}>
        <div className={`pt-5 pb-2 ${variant === "expanded" ? "px-4" : "flex justify-center px-1"}`}>
          <DashboardSwitcher dashboard={dashboard} />
        </div>
        <nav className="pb-8">
          <ShellNavList nav={nav} variant={variant} color={color} />
        </nav>
      </div>
      <div className="fixed top-[23px] z-[45] -translate-x-1/2" style={{ left: width }}>
        <CollapseButton expanded={variant === "expanded"} onToggle={onToggle} />
      </div>
    </aside>
  );
}
```
Notes:
- `z-[45]` puts the button above the header (z-40) and below Radix popups (z-50), as the spec asks. `top-[23px]` + 26px height puts its centre 36px from the top.
- The `dark text-white` on the `apparent` aside makes the switcher (which uses `--sidebar-*` tokens and `dark:` variants) render on the dark background as it does today. Verify in Task 5 and report what you see.
- Check the existing `DashboardSwitcher` renders inside this `<aside>` without `<Sidebar>`: it only needs `useSidebar()` context, which the shell's `SidebarProvider` supplies.

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS. If the `aria-current` regex fails only because React orders attributes differently, keep the regex (it accepts both orders) and inspect the HTML before changing anything else.

- [ ] **Step 6: Commit**

```bash
git add packages/design_system/src/layout/CollapseButton.tsx packages/design_system/src/layout/ShellSidebar.tsx packages/design_system/src/layout/ShellSidebar.test.tsx
git commit -m "feat(design-system): Minimals-style sidebar with round collapse button

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Shell wiring — settings drawer, layouts, contrast, padding

**Files:**
- Modify: `packages/design_system/src/layout/DashboardShell.tsx` (rewrite body), `packages/design_system/src/layout/ShellHeader.tsx`, `packages/design_system/src/layout/shell-utils.ts`, `packages/design_system/src/layout/shell-utils.test.ts`, `packages/design_system/src/layout/DashboardShell.test.tsx`, `packages/design_system/src/layout/DashboardShell.stories.tsx`
- Modify: `apps/tb/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `useLayoutSettings`, `layoutSettingsStore`, `applySmallScreenRule`, `LayoutSettings` (Task 1); `ShellSidebar`, `ShellNavList` (Task 3); `SIDEBAR_WIDTHS` (Task 2); existing `SettingsDrawer` and `DashboardLayout` re-exports; `useTheme` from next-themes; shadcn `SidebarProvider`, `Sheet`, `SheetContent`, `SheetTitle`; `useIsMobile` (not needed: CSS `md:` breakpoints handle desktop vs mobile).
- Produces: `DashboardShellProps` unchanged (`dashboard`, `nav`, `user`, `onSignOut`, `pageTitle?`, `rightPanel?`, `children`). `ShellHeader` props become `{ title: string; user: ShellUser; onSignOut: () => void; settings: LayoutSettings; onSettingsChange: (s: LayoutSettings) => void; onOpenMenu: () => void }`.

- [ ] **Step 1: Update the shell tests first**

Replace `packages/design_system/src/layout/DashboardShell.test.tsx` with:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme }) }));

// The old MUI drawer and layout load the design_system_mui barrel, which touches `window`.
// They are used unchanged; here we only check the shell hands them the right props.
const drawerProps: any[] = [];
const layoutProps: any[] = [];
vi.mock("../app/molecules/headers/SettingsDrawer", () => ({
  SettingsDrawer: (props: any) => {
    drawerProps.push(props);
    return <span data-slot="settings-drawer">drawer:{props.settings.layout}</span>;
  },
}));
vi.mock("../app/templates/DashboardLayout", () => ({
  DashboardLayout: (props: any) => {
    layoutProps.push(props);
    return <div data-slot="old-stacked-layout">{props.children}</div>;
  },
}));

import { DashboardShell } from "./DashboardShell";
import { DEFAULT_LAYOUT_SETTINGS, layoutSettingsStore } from "./layoutSettings";

const base = {
  dashboard: "vl" as const,
  user: { name: "Vagner Pene", email: "v@example.org" },
  onSignOut: () => {},
  pageTitle: "Sumário",
  nav: [
    { label: "Sumário", href: "/", active: true },
    { label: "Laboratório", href: "/lab", active: false },
  ],
};

function withLayout(layout: "expanded" | "compact" | "stacked", extra = {}) {
  layoutSettingsStore.set({ ...DEFAULT_LAYOUT_SETTINGS, layout, ...extra });
}

beforeEach(() => {
  drawerProps.length = 0;
  layoutProps.length = 0;
  setTheme.mockClear();
  withLayout("compact");
});

describe("DashboardShell", () => {
  it("renders the switcher, the nav and the header title", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain("Carga Viral");
    expect(html).toContain("Portal de Carga Viral - Sumário");
    expect(html).toContain('href="/lab"');
    expect(html).toContain("conteúdo");
  });

  it("uses the TB registry entry for TB", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} dashboard="tb" pageTitle="Província"><p /></DashboardShell>);
    expect(html).toContain("Tuberculose");
    expect(html).toContain("Portal de Testagem Laboratorial de TB - Província");
  });

  it("expanded and compact render the new sidebar at 300px and 88px", () => {
    withLayout("expanded");
    expect(renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>)).toContain('data-variant="expanded"');
    withLayout("compact");
    expect(renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>)).toContain('data-variant="compact"');
  });

  it("puts the old settings drawer in the header with the current settings", () => {
    withLayout("expanded");
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(html).toContain("drawer:expanded");
    expect(drawerProps.at(-1).settings.layout).toBe("expanded");
  });

  it("stacked renders the old top layout with the old props and no new sidebar", () => {
    withLayout("stacked");
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain('data-slot="old-stacked-layout"');
    expect(html).not.toContain('data-slot="shell-sidebar"');
    expect(html).toContain("conteúdo");
    const props = layoutProps.at(-1);
    expect(props.portalTitle).toBe("Portal de Carga Viral");
    expect(props.pagename).toBe("Sumário");
    expect(props.aiChatIsOpen).toBe(false);
    expect(props.options).toEqual(base.nav);
    expect(props.settings.layout).toBe("stacked");
    expect(props.user).toMatchObject({ name: "Vagner Pene", email: "v@example.org" });
    expect(typeof props.handleSetAppSettings).toBe("function");
  });

  it("changing settings from the drawer saves them and syncs next-themes on mode change", () => {
    renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const { handleSetAppSettings, settings } = drawerProps.at(-1);
    handleSetAppSettings({ ...settings, layout: "expanded" });
    expect(layoutSettingsStore.get().layout).toBe("expanded");
    expect(setTheme).not.toHaveBeenCalled();
    handleSetAppSettings({ ...layoutSettingsStore.get(), mode: "dark" });
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("applies contrast and padding settings to the content", () => {
    withLayout("expanded", { contrast: "negative", compact: "small" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(html).toMatch(/data-slot="shell-content"[^>]*class="[^"]*bg-white/);
    expect(html).toMatch(/data-slot="shell-content-inner"[^>]*class="[^"]*px-1/);
  });

  it("keeps the header below Radix popups (z-50) so menus, tooltips and the mobile sheet stay on top", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const header = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    const z = header.match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
    expect(z, "header needs a z-index class").not.toBeNull();
    expect(Number(z![1] ?? z![2])).toBeLessThan(50);
  });

  it("renders the right panel only when given", () => {
    const without = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(without).not.toContain('data-slot="shell-right-panel"');
    const withPanel = renderToStaticMarkup(<DashboardShell {...base} rightPanel={<span>chat</span>}><p /></DashboardShell>);
    expect(withPanel).toContain('data-slot="shell-right-panel"');
  });

  it("renders with an empty nav", () => {
    expect(renderToStaticMarkup(<DashboardShell {...base} nav={[]}><p>ok</p></DashboardShell>)).toContain("ok");
  });
});
```
In `packages/design_system/src/layout/shell-utils.test.ts`, delete the `readSidebarOpen` `describe` block and remove `readSidebarOpen` from the import.

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout/DashboardShell`
Expected: FAIL (no `data-variant`, no drawer, no stacked layout).

- [ ] **Step 3: Header: old settings drawer and mobile menu button**

Replace `packages/design_system/src/layout/ShellHeader.tsx` with:
```tsx
"use client";

import { Menu } from "lucide-react";
import { SettingsDrawer } from "../app/molecules/headers/SettingsDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { LayoutSettings } from "./layoutSettings";
import { initials } from "./shell-utils";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

function UserMenu({ user, onSignOut }: { user: ShellUser; onSignOut: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Conta" className="rounded-full">
        <Avatar className="size-[30px]">
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
          <AvatarFallback className="bg-purple-700 text-white">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="px-3 py-2">
          <p className="font-bold">{user.name}</p>
          <p className="text-sm">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Conta de Perfil</DropdownMenuItem>
        <DropdownMenuItem>Configurações</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSignOut()}>Sair da conta</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShellHeader({
  title,
  user,
  onSignOut,
  settings,
  onSettingsChange,
  onOpenMenu,
}: {
  title: string;
  user: ShellUser;
  onSignOut: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
  onOpenMenu: () => void;
}) {
  // z-40: above page content, below Radix popups (z-50) and MUI dialogs (z-1300).
  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between gap-2 bg-background/40 px-4 backdrop-blur-[8px]">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Menu" onClick={onOpenMenu} className="rounded-md p-2 hover:bg-accent md:hidden">
          <Menu className="size-5" />
        </button>
        <h1 className="truncate text-base font-bold sm:text-lg md:text-xl lg:text-[1.375rem] xl:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        {/* key: the old drawer copies `layout` into local state on mount; remount it when the round button changes it. */}
        <SettingsDrawer key={settings.layout} settings={settings} handleSetAppSettings={onSettingsChange} />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Shell**

Replace `packages/design_system/src/layout/DashboardShell.tsx` with:
```tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { getDashboard, type DashboardId } from "../dashboards";
import { DashboardLayout } from "../app/templates/DashboardLayout";
import { SidebarProvider } from "../components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "../components/ui/sheet";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { ShellHeader, type ShellUser } from "./ShellHeader";
import { ShellNavList, ShellSidebar } from "./ShellSidebar";
import { applySmallScreenRule, useLayoutSettings, type LayoutSettings } from "./layoutSettings";
import { sidebarContainerClass } from "./sidebar-styles";
import { headerTitle } from "./shell-utils";

export type { ShellUser } from "./ShellHeader";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active: boolean;
}

export interface DashboardShellProps {
  dashboard: DashboardId;
  nav: ShellNavItem[];
  user: ShellUser;
  onSignOut: () => void;
  pageTitle?: string;
  /** Reserved for the future AI chat; nothing is rendered when undefined. */
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
}

// Content background as the old layout: positive = MUI background.default, negative = background.paper.
const CONTENT_BG: Record<LayoutSettings["contrast"], string> = {
  positive: "bg-[#f4f4f4] dark:bg-[#141a21]",
  negative: "bg-white dark:bg-[#1d232a]",
};
// Content side padding as the old layout: large = 16px, small = 4px.
const CONTENT_PX: Record<LayoutSettings["compact"], string> = { large: "px-4", small: "px-1" };

export function DashboardShell({ dashboard, nav, user, onSignOut, pageTitle, rightPanel, children }: DashboardShellProps) {
  const info = getDashboard(dashboard);
  const { settings, setSettings } = useLayoutSettings();
  const { setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSettingsChange = React.useCallback(
    (next: LayoutSettings) => {
      if (next.mode !== settings.mode) setTheme(next.mode);
      setSettings(next);
    },
    [settings.mode, setSettings, setTheme],
  );

  // Old rule: below 1280px the content always gets the large padding.
  React.useEffect(() => {
    const onResize = () => {
      const adjusted = applySmallScreenRule(settings, window.innerWidth);
      if (adjusted !== settings) setSettings(adjusted);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [settings, setSettings]);

  if (settings.layout === "stacked") {
    // Today's MUI top layout, unchanged; redesigned later.
    return (
      <DashboardLayout
        portalTitle={info.portalTitle}
        pagename={pageTitle}
        options={nav}
        aiChatIsOpen={false}
        user={{ name: user.name, email: user.email, avatar: user.imageUrl, signOut: onSignOut }}
        settings={settings}
        handleSetAppSettings={handleSettingsChange}
      >
        {children}
      </DashboardLayout>
    );
  }

  const variant = settings.layout === "expanded" ? "expanded" : "compact";
  const toggle = () => handleSettingsChange({ ...settings, layout: variant === "expanded" ? "compact" : "expanded" });

  return (
    // Controlled by the layout setting, so Ctrl/Cmd+B, the round button and the drawer agree.
    <SidebarProvider
      open={variant === "expanded"}
      onOpenChange={(open) => handleSettingsChange({ ...settings, layout: open ? "expanded" : "compact" })}
      className="min-h-svh"
    >
      <ShellSidebar dashboard={dashboard} nav={nav} variant={variant} color={settings.color} onToggle={toggle} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className={`w-[300px] p-0 ${sidebarContainerClass(settings.color)}`}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="px-4 pt-5 pb-2">
            <DashboardSwitcher dashboard={dashboard} />
          </div>
          <nav className="pb-8">
            <ShellNavList nav={nav} variant="expanded" color={settings.color} />
          </nav>
        </SheetContent>
      </Sheet>
      <main
        data-slot="shell-content"
        className={`h-svh min-w-0 flex-1 overflow-y-auto overflow-x-hidden [container-type:inline-size] ${CONTENT_BG[settings.contrast]}`}
      >
        <ShellHeader
          title={headerTitle(info.portalTitle, pageTitle)}
          user={user}
          onSignOut={onSignOut}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onOpenMenu={() => setMobileOpen(true)}
        />
        <div data-slot="shell-content-inner" className={`pb-8 ${CONTENT_PX[settings.compact]}`}>
          {children}
        </div>
      </main>
      {rightPanel !== undefined && (
        <aside data-slot="shell-right-panel" className="h-svh shrink-0 border-l">
          {rightPanel}
        </aside>
      )}
    </SidebarProvider>
  );
}
```
Then in `packages/design_system/src/layout/shell-utils.ts` delete `SIDEBAR_WIDTH`, `SIDEBAR_WIDTH_ICON` and `readSidebarOpen` (no longer used; the sidebar state is the `layout` setting). Run `grep -rn "readSidebarOpen\|SIDEBAR_WIDTH" packages/design_system/src apps` and expect no hits outside `sidebar-styles.ts` (`SIDEBAR_WIDTHS`).

Check `DashboardLayout`'s prop types (`packages/design_system_mui/src/templates/DashboardLayout.tsx`): `options: OptionsProps[]` (`icon?`, `label?`, `active?`, `href?`) accepts `ShellNavItem[]`; `user?: UserNavigationProps` (`name`, `email`, `avatar?`, `signOut?`). If a type mismatch appears, map the fields explicitly; do not edit the MUI file.

- [ ] **Step 5: TB passes the panel widths from the settings again**

In `apps/tb/app/(dashboard)/layout.tsx`:
- add `import { useLayoutSettings } from "@repo/design_system/layout/layoutSettings"`;
- delete the `AI_CHAT_PANEL_SIZES` constant and its comment;
- inside `Layout`, add `const { settings, setSettings } = useLayoutSettings();`;
- replace the `AIChatProvider` opening tag with:
```tsx
    <AIChatProvider
      dashboard="tb"
      panelSizes={{ left: settings.leftPanelWidth, right: settings.rightPanelWidth }}
      onPanelResize={(sizes) => setSettings({ ...settings, leftPanelWidth: sizes.left, rightPanelWidth: sizes.right })}
    >
```
This is the same wiring TB had before the platform branch.

- [ ] **Step 6: Update the stories**

In `packages/design_system/src/layout/DashboardShell.stories.tsx`, add stories that set the layout before rendering:
```tsx
import { DEFAULT_LAYOUT_SETTINGS, layoutSettingsStore } from "./layoutSettings";

const withSettings = (patch: Partial<typeof DEFAULT_LAYOUT_SETTINGS>) => () => {
  layoutSettingsStore.set({ ...DEFAULT_LAYOUT_SETTINGS, ...patch });
};

export const Expanded: Story = { beforeEach: withSettings({ layout: "expanded", color: "integrate" }) };
export const ExpandedApparent: Story = { beforeEach: withSettings({ layout: "expanded", color: "apparent" }) };
export const Compact: Story = { beforeEach: withSettings({ layout: "compact", color: "integrate" }) };
```
Remove the existing `ViralLoad` story's reliance on the cookie (it now uses whatever is in the store; set `beforeEach: withSettings({ layout: "expanded" })` on it).

- [ ] **Step 7: Run all checks**

```bash
W=.superpowers/sdd/2026-10-15-minimals-sidebar; mkdir -p $W
pnpm --filter @repo/design_system test > $W/t4-ds.log 2>&1; echo ds=$?; grep -E "Tests |×" $W/t4-ds.log
pnpm --filter=vl test > $W/t4-vl.log 2>&1; echo vl=$?; grep "Tests " $W/t4-vl.log
pnpm --filter=vl exec tsc --noEmit > $W/t4-vltsc.log 2>&1; echo vltsc=$?
pnpm --filter=tb exec tsc --noEmit > $W/t4-tbtsc.log 2>&1; echo tbtsc=$?
pnpm --filter=vl lint > $W/t4-vllint.log 2>&1; echo vllint=$?
pnpm --filter=tb lint > $W/t4-tblint.log 2>&1; echo tblint=$?
```
Expected: all exit 0; VL 124 tests; no lint errors (TB `@mui` warnings expected).

- [ ] **Step 8: Commit**

```bash
git add packages/design_system/src/layout apps/tb/app/\(dashboard\)/layout.tsx
git commit -m "feat(design-system): restore the settings drawer; Minimals sidebar in the shell

expanded/compact render the new sidebar, stacked renders the old MUI top
layout unchanged. Contrast, padding, colour and panel widths work again.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Builds and visual verification

**Files:** none (verification only; fixes found here go back to the owning file with a test where one can express it).

- [ ] **Step 1: Production builds**

```bash
W=.superpowers/sdd/2026-10-15-minimals-sidebar
pnpm --filter=vl build > $W/t5-vl.log 2>&1; echo vl=$?
pnpm --filter=tb build > $W/t5-tb.log 2>&1; echo tb=$?
```
Expected: both 0. A `window is not defined` prerender error means something pulled the `design_system_mui` barrel into the root layout; fix the import path (as was done for `AppProvider`), do not add guards.

- [ ] **Step 2: Run the apps**

Start VL on 3002 and TB on 3003 from the worktree with `NEXT_PUBLIC_DASHBOARD_URL_VL=http://localhost:3002 NEXT_PUBLIC_DASHBOARD_URL_TB=http://localhost:3003`, and the original checkout's VL/TB on 3000/3001 for "before". The user signs in on each port.

- [ ] **Step 3: Compare the sidebar with minimals.cc**

In Chrome, at 1316×917, for VL on 3002: set the drawer to expanded + integrate, then compact, then apparent. For each, take a screenshot, and with `javascript_tool` read the computed styles of the sidebar container, the active item, an inactive item (also on hover), and the round button. Compare with spec §4 (widths 300/88, item 44px / 79×58, radius 8, paddings, font sizes and weights, colours, button 26px at x = sidebar width, centre y = 36). Record a table in the ledger: property, Minimals, ours, match yes/no. Fix mismatches.

- [ ] **Step 4: Behaviour checks**

- Round button toggles expanded/compact; open the drawer afterwards: it shows the new layout selected.
- Ctrl+B toggles the same way.
- Drawer: each of the seven settings changes what it should (§3.1); mode switches both cards and shell; reload keeps the choices.
- `stacked` shows the old top layout; switching back from its drawer restores the new sidebar.
- Below 768px: no sidebar, header menu button opens the slide-in panel with the switcher and nav.
- Settings, user and switcher menus open fully above the header.
- TB: the `mtb-xpert-ultra-facilities` card's AI chat option still opens the chat.

- [ ] **Step 5: Before/after inside the cards**

For every TB and VL page, light and dark, compare 3000/3001 against 3002/3003 with the same drawer settings on both. Allowed differences: the sidebar and header, the shadcn primary colour, TB's MUI primary. Anything else inside a card is a regression: fix it if it is a style mistake; if a fix would change structure, stop and ask the user.

- [ ] **Step 6: Record and hand over**

Write the comparison tables and results in the ledger, then report to the user.
