# Platform Foundation and Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give TB and VL one shared token stylesheet, one theme provider and one Tailwind sidebar shell with a dashboard switcher, all from `@repo/design_system`, without changing the structure of any existing component.

**Architecture:** New code lives in `packages/design_system/src/{styles,theme,charts,layout}` plus `dashboards.ts`. Apps import it through the existing tsconfig `paths` (`@repo/design_system/*` → `packages/design_system/src/*`; Next compiles the package source as app source). MUI keeps working through the existing `AppProvider` from `design_system_mui`, fed by a new `muiThemeOptions()`; this keeps the single `@mui/material` instance that the MUI components use.

**Tech Stack:** Next.js 15 (Turbopack), React 18, Tailwind CSS 4 (`@tailwindcss/postcss`), shadcn/ui on Radix, next-themes 0.2.1, MUI 6 (bridge only), Vitest 3, Storybook 9, pnpm workspaces + Turbo.

**Spec:** `docs/superpowers/specs/2026-10-14-platform-foundation-shell-design.md`

## Global Constraints

- **Governing rule (spec, top):** do not change the structure of existing components: props and public APIs, card layout and contents, menus and options, tabs, filters, behaviour (drill-downs, dialogs, Excel/PNG exports, permissions, loading/error states), data flow, routes, page names, navigation items. Only visual properties may change. The page layout component (`DashboardLayout` → `DashboardShell`) is the one approved exception.
- Existing tests must pass **unchanged**. Editing an existing test to make it pass is a structure change: stop and ask the user.
- Any change that would touch the frozen list stops the work and goes to the user first.
- Dashboard ids and colours: `vl` = `#00B000` (foreground `#FFFFFF`), `tb` = `#F8A200` (foreground `#1A1A1A`).
- Default URLs: `https://vl.openldr.org.mz`, `https://tb.openldr.org.mz`; overrides `NEXT_PUBLIC_DASHBOARD_URL_VL`, `NEXT_PUBLIC_DASHBOARD_URL_TB`, read as literal `process.env.NEXT_PUBLIC_…` expressions.
- Names: VL `name: "Carga Viral"`, `portalTitle: "Portal de Carga Viral"`; TB `name: "Tuberculose"`, `portalTitle: "Portal de Testagem Laboratorial de TB"`.
- User-facing text is Portuguese.
- **No new dependencies.** Never run plain `pnpm install`; only `pnpm install --frozen-lockfile` (ruling R-d: a plain install re-resolves `csstype` and breaks TB's type-check).
- Apps must not import `@repo/design_system_mui` (error) and should not import `@mui/*` (warning).
- New package code uses **relative imports only** (never `@/`): inside a Next app `@/` means the app root.
- Work only in the worktree on branch `feat/platform-shell`. Never push, open a PR, merge or touch Coolify without asking the user.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Do not stage: `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md`, `apps/monitoring/`, `apps/tb/public/cobertura-laboratorios.html`, `design-system-screenshots/`, `tools/`.

## Review Focus

1. **MUI theme not applied** (cards render with MUI default blue, Roboto): happens if the MUI `ThemeProvider` comes from a different `@mui/material` copy than the components. Expect cards to look exactly as today. Pinned by Task 4's rule (use `AppProvider` from `@repo/design_system_mui`) and by Task 9's screenshot comparison.
2. **Dark mode toggled from the new settings menu leaves MUI cards light**, or the reverse. Expect both to switch together. Pinned in Task 4 (one mode source) and Task 9 Step 4 (dark screenshots).
3. **Malformed URL override** (`NEXT_PUBLIC_DASHBOARD_URL_TB=localhost:3001` without scheme): the switcher must fall back to the default URL, not produce a broken link. Pinned by a Task 1 test.
4. **CSS and registry disagree** on a dashboard colour after someone edits one of them. Pinned by a Task 2 test that parses `theme.css`.
5. **The AI chat option in TB's `mtb-xpert-ultra-facilities` card menu crashes** because `AIChatProvider` was removed. Expect it to behave as today. Pinned by Task 8 Step 2, which keeps the provider, and by the Task 9 smoke check.

---

## File structure

**Create (package `packages/design_system/`):**

| File | Responsibility |
|------|----------------|
| `vitest.config.ts` | Unit-test config for the package (node, automatic JSX) |
| `src/dashboards.ts` | Registry: ids, names, titles, URLs (with overrides), primaries |
| `src/dashboards.test.ts` | Registry tests |
| `src/styles/theme.css` | Shared tokens, `[data-dashboard]` primaries, base layer, chart overrides |
| `src/styles/theme.test.ts` | CSS ↔ registry agreement |
| `src/theme/muiThemeOptions.ts` | MUI theme options per dashboard and mode (today's app theme values) |
| `src/theme/muiThemeOptions.test.ts` | Theme tests |
| `src/charts/chartColors.ts` | 8-colour palette starting at the dashboard primary |
| `src/charts/chartColors.test.ts` | Palette tests |
| `src/theme/PlatformThemeProvider.tsx` | next-themes + MUI bridge, renders after mount |
| `src/layout/shell-utils.ts` | Pure helpers: cookie read, switcher items, header title, initials, emblem URL |
| `src/layout/shell-utils.test.ts` | Helper tests |
| `src/layout/DashboardSwitcher.tsx` | Switcher at the top of the sidebar |
| `src/layout/ShellHeader.tsx` | Sticky header: title, settings menu, user menu |
| `src/layout/DashboardShell.tsx` | Composition: sidebar + header + content + optional right panel |
| `src/layout/DashboardShell.test.tsx` | Static render tests |
| `src/layout/DashboardShell.stories.tsx` | Storybook stories |

**Modify:** `packages/design_system/package.json` (test script), `packages/design_system/src/components/ui/*.tsx` (relative imports; 9 files take the app version), `packages/design_system/src/index.css`, `packages/design_system/.storybook/preview.tsx`, `apps/{vl,tb}/app/globals.css`, `apps/{vl,tb}/app/layout.tsx`, `apps/{vl,tb}/app/(dashboard)/layout.tsx`, `apps/{vl,tb}/eslint.config.mjs`, every app file importing `components/ui/*`, TB `mtb-piechart-card/{constants.ts,index.tsx}`, TB `clinic/reports/shared/PatientDialog.tsx`, `CLAUDE.md`.

**Delete:** `apps/{vl,tb}/components/ui/` (16 files each), `apps/{vl,tb}/themes/` (5 files each), `apps/{vl,tb}/context/theme-provider.tsx`, `apps/{vl,tb}/hooks/useLayoutSettings.ts`, `packages/design_system/src/themes/{light,dark}.ts`.

---

### Task 0: Worktree, spec commit and "before" baseline

**Files:**
- Create: `docs/superpowers/specs/2026-10-14-platform-foundation-shell-design.md` (copied from the original folder), `docs/superpowers/plans/2026-10-14-platform-foundation-shell.md` (this file)

**Interfaces:**
- Produces: worktree at `<repo>/.worktrees/platform-shell` on `feat/platform-shell`; baseline numbers in the ledger; screenshots in `~/openldr-screenshots/platform-shell/before/`.

- [ ] **Step 1: Confirm PR #15 is merged**

Run: `gh api repos/Association-of-Public-Health-Labs/openldr-monorepo/pulls/15 --jq '.merged'`
Expected: `true`. If `false`, stop and tell the user: this plan starts from `main` with VL included.

- [ ] **Step 2: Create the worktree** (use superpowers:using-git-worktrees)

```bash
cd /home/vagner/Documents/Projects/APHL/openldr/openldr-monorepo
git fetch origin main
grep -qxF '.worktrees/' .git/info/exclude || echo '.worktrees/' >> .git/info/exclude
grep -qxF '.superpowers/' .git/info/exclude || echo '.superpowers/' >> .git/info/exclude
git worktree add .worktrees/platform-shell -b feat/platform-shell origin/main
cd .worktrees/platform-shell
pnpm install --frozen-lockfile
```
Expected: install succeeds with no lockfile change (`git status --short pnpm-lock.yaml` prints nothing).

- [ ] **Step 3: Copy in the spec and this plan, and commit them**

```bash
cp ../../docs/superpowers/specs/2026-10-14-platform-foundation-shell-design.md docs/superpowers/specs/
cp ../../docs/superpowers/plans/2026-10-14-platform-foundation-shell.md docs/superpowers/plans/
git add docs/superpowers/specs/2026-10-14-platform-foundation-shell-design.md docs/superpowers/plans/2026-10-14-platform-foundation-shell.md
git commit -m "docs: platform foundation and shell spec and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Record the baseline checks**

```bash
pnpm --filter=vl test 2>&1 | tail -5
pnpm --filter=vl exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=tb exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=vl lint 2>&1 | tail -5
pnpm --filter=tb lint 2>&1 | tail -5
pnpm --filter @repo/design_system build-storybook 2>&1 | tail -5
```
Write each result (test count, error counts, pass/fail) into the ledger as "baseline". Later tasks compare against it: no new failures allowed.

- [ ] **Step 5: Capture "before" screenshots**

Copy the local env files from the original folder (they are git-ignored; never print them):
```bash
cp ../../apps/vl/.env.local apps/vl/.env.local
cp ../../apps/tb/.env.local apps/tb/.env.local
```
Start both apps from the worktree:
```bash
NEXT_PUBLIC_OPENLDR_API=https://api.openldr.org.mz pnpm --filter=vl exec next dev --turbopack -p 3000
NEXT_PUBLIC_OPENLDR_API=https://api.openldr.org.mz pnpm --filter=tb exec next dev --turbopack -p 3001
```
Ask the user to sign in in Chrome on both ports. Then capture, at 1440×900, in **light and dark**, each page after its cards finish loading:
- VL: `/`, `/lab`, `/clinic`, `/patients` (Admin user), `/sign-in` (signed out)
- TB: `/`, `/clinic`, `/patients`, `/sign-in` (signed out)
- Mobile 390×844, light: VL `/`, TB `/`

Save as `~/openldr-screenshots/platform-shell/before/<app>-<page>-<mode>.png` (`index` for `/`). Use the claude-in-chrome tools if available; otherwise ask the user to capture them. Stop both dev servers.

---

### Task 1: Package test harness and dashboard registry

**Files:**
- Create: `packages/design_system/vitest.config.ts`, `packages/design_system/src/dashboards.ts`, `packages/design_system/src/dashboards.test.ts`
- Modify: `packages/design_system/package.json` (scripts)

**Interfaces:**
- Produces:
  - `type DashboardId = "vl" | "tb"`
  - `interface DashboardInfo { id: DashboardId; name: string; portalTitle: string; url: string; primary: string; primaryForeground: string }`
  - `const DASHBOARDS: readonly DashboardInfo[]` (defaults, VL first)
  - `type UrlOverrides = Partial<Record<DashboardId, string | undefined>>`
  - `function resolveUrl(defaultUrl: string, override?: string): string`
  - `function getDashboards(overrides?: UrlOverrides): DashboardInfo[]`
  - `function getDashboard(id: DashboardId, overrides?: UrlOverrides): DashboardInfo` (throws `Error("Unknown dashboard: <id>")`)
  - Package script `test` = `vitest run`

- [ ] **Step 1: Add the test config and script**

`packages/design_system/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**"],
  },
});
```
In `packages/design_system/package.json` `scripts`, add after `"lint"`:
```json
    "test": "vitest run",
```

- [ ] **Step 2: Write the failing tests**

`packages/design_system/src/dashboards.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import { DASHBOARDS, getDashboard, getDashboards, resolveUrl } from "./dashboards";

describe("dashboard registry", () => {
  it("lists VL then TB with their colours and titles", () => {
    expect(DASHBOARDS.map((d) => [d.id, d.primary, d.primaryForeground])).toEqual([
      ["vl", "#00B000", "#FFFFFF"],
      ["tb", "#F8A200", "#1A1A1A"],
    ]);
    expect(getDashboard("vl", {}).portalTitle).toBe("Portal de Carga Viral");
    expect(getDashboard("tb", {}).portalTitle).toBe("Portal de Testagem Laboratorial de TB");
    expect(getDashboard("vl", {}).name).toBe("Carga Viral");
    expect(getDashboard("tb", {}).name).toBe("Tuberculose");
  });

  it("uses the production URLs by default", () => {
    expect(getDashboards({}).map((d) => d.url)).toEqual([
      "https://vl.openldr.org.mz",
      "https://tb.openldr.org.mz",
    ]);
  });

  it("applies a valid override and drops a trailing slash", () => {
    expect(getDashboard("tb", { tb: "http://localhost:3001/" }).url).toBe("http://localhost:3001");
    expect(getDashboard("vl", { tb: "http://localhost:3001" }).url).toBe("https://vl.openldr.org.mz");
  });

  it("ignores a malformed override with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveUrl("https://tb.openldr.org.mz", "localhost:3001")).toBe("https://tb.openldr.org.mz");
    expect(resolveUrl("https://tb.openldr.org.mz", "ftp://x.org")).toBe("https://tb.openldr.org.mz");
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("treats an empty override as unset", () => {
    expect(resolveUrl("https://vl.openldr.org.mz", "")).toBe("https://vl.openldr.org.mz");
  });

  it("throws on an unknown id", () => {
    expect(() => getDashboard("eid" as never, {})).toThrow("Unknown dashboard: eid");
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter @repo/design_system test`
Expected: FAIL, cannot resolve `./dashboards`.

- [ ] **Step 4: Implement the registry**

`packages/design_system/src/dashboards.ts`:
```ts
export type DashboardId = "vl" | "tb";

export interface DashboardInfo {
  id: DashboardId;
  name: string;
  portalTitle: string;
  url: string;
  primary: string;
  primaryForeground: string;
}

export type UrlOverrides = Partial<Record<DashboardId, string | undefined>>;

export const DASHBOARDS: readonly DashboardInfo[] = [
  {
    id: "vl",
    name: "Carga Viral",
    portalTitle: "Portal de Carga Viral",
    url: "https://vl.openldr.org.mz",
    primary: "#00B000",
    primaryForeground: "#FFFFFF",
  },
  {
    id: "tb",
    name: "Tuberculose",
    portalTitle: "Portal de Testagem Laboratorial de TB",
    url: "https://tb.openldr.org.mz",
    primary: "#F8A200",
    primaryForeground: "#1A1A1A",
  },
];

// Literal process.env reads so Next.js inlines them at build time.
const ENV_OVERRIDES: UrlOverrides = {
  vl: process.env.NEXT_PUBLIC_DASHBOARD_URL_VL,
  tb: process.env.NEXT_PUBLIC_DASHBOARD_URL_TB,
};

export function resolveUrl(defaultUrl: string, override?: string): string {
  if (!override) return defaultUrl;
  try {
    const parsed = new URL(override);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return override.replace(/\/+$/, "");
    }
  } catch {
    // fall through to the warning
  }
  console.warn(`Ignoring invalid dashboard URL override "${override}"; using ${defaultUrl}`);
  return defaultUrl;
}

export function getDashboards(overrides: UrlOverrides = ENV_OVERRIDES): DashboardInfo[] {
  return DASHBOARDS.map((d) => ({ ...d, url: resolveUrl(d.url, overrides[d.id]) }));
}

export function getDashboard(id: DashboardId, overrides: UrlOverrides = ENV_OVERRIDES): DashboardInfo {
  const found = getDashboards(overrides).find((d) => d.id === id);
  if (!found) throw new Error(`Unknown dashboard: ${id}`);
  return found;
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/design_system/vitest.config.ts packages/design_system/package.json packages/design_system/src/dashboards.ts packages/design_system/src/dashboards.test.ts
git commit -m "feat(design-system): dashboard registry with URL overrides

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared token stylesheet

**Files:**
- Create: `packages/design_system/src/styles/theme.css`, `packages/design_system/src/styles/theme.test.ts`
- Modify: `packages/design_system/src/index.css` (Storybook only)

**Interfaces:**
- Consumes: `DASHBOARDS` (Task 1).
- Produces: `theme.css` defining every token the apps use today plus `--warning`, `--success`, `--info`, `--chart-6..8`, the `[data-dashboard="vl"|"tb"]` primaries, and dark sidebar tokens. Apps import it in Task 7/8.

- [ ] **Step 1: Write the failing test**

`packages/design_system/src/styles/theme.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DASHBOARDS } from "../dashboards";

const css = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing block ${selector}`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
}

describe("theme.css", () => {
  it.each(DASHBOARDS.map((d) => [d.id, d]))("matches the registry for %s", (id, d) => {
    const body = block(`[data-dashboard="${id}"]`);
    expect(body).toContain(`--primary: ${d.primary};`);
    expect(body).toContain(`--primary-foreground: ${d.primaryForeground};`);
  });

  it("has a primary block for every registry entry and no other", () => {
    const ids = [...css.matchAll(/\[data-dashboard="([a-z]+)"\]/g)].map((m) => m[1]);
    expect(new Set(ids)).toEqual(new Set(DASHBOARDS.map((d) => d.id)));
  });

  it("points the sans font at Open Sans and drops Geist", () => {
    expect(css).toContain('--font-sans: var(--font-open-sans), "Open Sans", system-ui, sans-serif;');
    expect(css).not.toContain("geist");
  });

  it("does not import Tailwind itself (apps do)", () => {
    expect(css).not.toMatch(/@import\s+"tailwindcss"/);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm --filter @repo/design_system test -- src/styles`
Expected: FAIL, `ENOENT ... theme.css`.

- [ ] **Step 3: Create `theme.css` from the live app stylesheet**

`apps/vl/app/globals.css` and `apps/tb/app/globals.css` are identical; take everything from the `@custom-variant` line to the end:
```bash
mkdir -p packages/design_system/src/styles
{ printf '/* Shared OpenLDR design tokens. Imported by every app'"'"'s globals.css after Tailwind. */\n\n'; sed -n '/^@custom-variant/,$p' apps/vl/app/globals.css; } > packages/design_system/src/styles/theme.css
```
Then apply these exact edits to `packages/design_system/src/styles/theme.css`:

1. Replace the two font lines in `@theme inline`:
```css
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
```
with:
```css
  --font-sans: var(--font-open-sans), "Open Sans", system-ui, sans-serif;
```
2. In `@theme inline`, after `--color-chart-1: var(--chart-1);` add:
```css
  --color-chart-6: var(--chart-6);
  --color-chart-7: var(--chart-7);
  --color-chart-8: var(--chart-8);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-info: var(--info);
```
3. In `:root`, replace `--destructive: oklch(0.577 0.245 27.325);` with:
```css
  --destructive: #EF5350;
  --warning: #F8A200;
  --success: #00B000;
  --info: #6B52DC;
```
and after `--chart-5: oklch(0.769 0.188 70.08);` add:
```css
  --chart-6: #00E396;
  --chart-7: #FEB019;
  --chart-8: #FF4560;
```
4. In `.dark`, replace `--destructive: oklch(0.704 0.191 22.216);` with `--destructive: #EF5350;`.
5. Delete the eight `--sidebar…` lines from **both** `:root` and `.dark`.
6. Directly after the closing `}` of `.dark`, insert:
```css

/* Sidebar keeps today's dark ("apparent") look in both modes. */
:root {
  --sidebar: #141a21;
  --sidebar-foreground: #ffffff;
  --sidebar-accent: #1d232a;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #32323c;
}

/* One primary colour per dashboard, set by data-dashboard on <html>.
   Values must match packages/design_system/src/dashboards.ts (tested). */
[data-dashboard="vl"] {
  --primary: #00B000;
  --primary-foreground: #FFFFFF;
}

[data-dashboard="tb"] {
  --primary: #F8A200;
  --primary-foreground: #1A1A1A;
}

[data-dashboard] {
  --ring: var(--primary);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-ring: var(--primary);
}
```
Leave everything else (base layer, ApexCharts/tippy overrides, `box-sizing`, `--icon-size` block) byte-for-byte as it was. `--chart-1` … `--chart-5` keep their values (TB report docs use them as legends).

- [ ] **Step 4: Point Storybook's stylesheet at it**

Replace the whole of `packages/design_system/src/index.css` (244 lines: two duplicated copies of shadcn tokens, one with a `))7;` typo) with:
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./styles/theme.css";
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS (Task 1 tests + 5 new).

- [ ] **Step 6: Commit**

```bash
git add packages/design_system/src/styles packages/design_system/src/index.css
git commit -m "feat(design-system): shared token stylesheet with per-dashboard primary

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: MUI theme options and chart colours

**Files:**
- Create: `packages/design_system/src/theme/muiThemeOptions.ts`, `packages/design_system/src/theme/muiThemeOptions.test.ts`, `packages/design_system/src/charts/chartColors.ts`, `packages/design_system/src/charts/chartColors.test.ts`

**Interfaces:**
- Consumes: `DashboardId`, `getDashboard`, `DASHBOARDS` (Task 1).
- Produces:
  - `type ThemeMode = "light" | "dark"`
  - `function muiThemeOptions(dashboard: DashboardId, mode: ThemeMode): Record<string, any>` — a plain MUI `ThemeOptions` object (not a created theme), the same shape `AppProvider` accepts today.
  - `function chartColors(dashboard: DashboardId): string[]` — 8 colours, first = primary.

- [ ] **Step 1: Write the failing tests**

`packages/design_system/src/theme/muiThemeOptions.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { muiThemeOptions } from "./muiThemeOptions";

function withoutPrimary(options: Record<string, any>) {
  const { primary, ...palette } = options.palette;
  return { ...options, palette };
}

describe("muiThemeOptions", () => {
  it("uses the dashboard primary", () => {
    expect(muiThemeOptions("vl", "light").palette.primary.main).toBe("#00B000");
    expect(muiThemeOptions("tb", "light").palette.primary.main).toBe("#F8A200");
    expect(muiThemeOptions("tb", "dark").palette.primary.main).toBe("#F8A200");
  });

  it("differs between dashboards only in the primary", () => {
    for (const mode of ["light", "dark"] as const) {
      expect(withoutPrimary(muiThemeOptions("vl", mode))).toEqual(withoutPrimary(muiThemeOptions("tb", mode)));
    }
  });

  it("keeps today's light theme values", () => {
    const t = muiThemeOptions("vl", "light");
    expect(t.palette.mode).toBe("light");
    expect(t.palette.secondary.main).toBe("#F8A200");
    expect(t.palette.error.main).toBe("#EF5350");
    expect(t.palette.success.main).toBe("#00B000");
    expect(t.palette.warning.main).toBe("#F8A200");
    expect(t.palette.info.main).toBe("#6B52DC");
    expect(t.palette.background).toEqual({ paper: "#fff", default: "#f4f4f4" });
    expect(t.palette.text.primary).toBe("#333333");
    expect(t.palette.divider).toBe("#e5e5e5");
    expect(t.components.MuiCard.styleOverrides.root.borderRadius).toBe("16px");
    expect(t.shadows).toHaveLength(25);
    expect(t.typography.fontFamily).toBe('"Open Sans", "Nunito Sans", sans-serif');
    expect(t.shape.borderRadius).toBe(4);
  });

  it("keeps today's dark theme values", () => {
    const t = muiThemeOptions("vl", "dark");
    expect(t.palette.mode).toBe("dark");
    expect(t.palette.background).toEqual({ paper: "#1d232a", default: "#141a21" });
    expect(t.palette.text.primary).toBe("#fff");
    expect(t.palette.divider).toBe("rgba(145, 158, 171, 0.24)");
    expect(t.components).toBeUndefined();
    expect(t.shadows).toBeUndefined();
  });

  it("returns a fresh object each call", () => {
    const a = muiThemeOptions("vl", "light");
    a.palette.primary.main = "#000";
    expect(muiThemeOptions("vl", "light").palette.primary.main).toBe("#00B000");
  });
});
```

`packages/design_system/src/charts/chartColors.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { DASHBOARDS } from "../dashboards";
import { chartColors } from "./chartColors";

describe("chartColors", () => {
  it.each(DASHBOARDS.map((d) => [d.id, d.primary]))("starts %s with its primary", (id, primary) => {
    const colors = chartColors(id);
    expect(colors).toHaveLength(8);
    expect(colors[0]).toBe(primary);
  });

  it("returns valid hex colours without duplicates", () => {
    for (const d of DASHBOARDS) {
      const colors = chartColors(d.id);
      colors.forEach((c) => expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/));
      expect(new Set(colors.map((c) => c.toLowerCase())).size).toBe(8);
    }
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/theme src/charts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `muiThemeOptions`**

Values copied from `apps/vl/themes/light.ts` and `apps/vl/themes/dark.ts` (identical to TB's), which the apps use today.

`packages/design_system/src/theme/muiThemeOptions.ts`:
```ts
import { getDashboard, type DashboardId } from "../dashboards";

export type ThemeMode = "light" | "dark";

const FONT_FAMILY = '"Open Sans", "Nunito Sans", sans-serif';

function light(primary: string) {
  return {
    palette: {
      mode: "light",
      primary: { main: primary },
      secondary: { main: "#F8A200" },
      error: { main: "#EF5350" },
      success: { main: "#00B000" },
      warning: { main: "#F8A200" },
      info: { main: "#6B52DC" },
      background: { paper: "#fff", default: "#f4f4f4" },
      common: { black: "#000", white: "#fff" },
      text: {
        primary: "#333333",
        secondary: "#8996a0",
        disabled: "rgba(51, 51, 51, 0.4)",
      },
      contrastThreshold: 3,
      divider: "#e5e5e5",
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid",
            borderColor: "hsl(240 4.8% 95.9%)",
            borderRadius: "16px",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "hsl(240 4.8% 95.9%)",
            borderWidth: "1px",
          },
        },
      },
    },
    shadows: [
      "none",
      "rgb(145 158 171 / 20%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px",
      "rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px",
      ...Array(23).fill("none"),
    ],
    typography: { fontFamily: FONT_FAMILY, button: { textTransform: "none" } },
    shape: { borderRadius: 4 },
  };
}

function dark(primary: string) {
  return {
    palette: {
      mode: "dark",
      primary: { main: primary },
      secondary: { main: "#F8A200" },
      error: { main: "#EF5350" },
      success: { main: "#00B000" },
      warning: { main: "#F8A200" },
      info: { main: "#6B52DC" },
      background: { paper: "#1d232a", default: "#141a21" },
      text: {
        primary: "#fff",
        secondary: "#8996a0",
        disabled: "rgba(255, 255, 255, 0.6)",
      },
      common: { black: "#000", white: "#fff" },
      contrastThreshold: 3,
      divider: "rgba(145, 158, 171, 0.24)",
    },
    typography: { fontFamily: FONT_FAMILY, button: { textTransform: "none" } },
    shape: { borderRadius: 4 },
  };
}

/** MUI ThemeOptions for a dashboard, as plain data. Pass to AppProvider, which calls createTheme. */
export function muiThemeOptions(dashboard: DashboardId, mode: ThemeMode): Record<string, any> {
  const { primary } = getDashboard(dashboard, {});
  return mode === "dark" ? dark(primary) : light(primary);
}
```
(The `{}` overrides argument avoids reading env vars for a colour lookup.)

- [ ] **Step 4: Implement `chartColors`**

`packages/design_system/src/charts/chartColors.ts`:
```ts
import { getDashboard, type DashboardId } from "../dashboards";

// Shared series palette (from design_system_mui themes/charts.ts theme1), minus the dashboard primaries.
const PALETTE = ["#009689", "#104e64", "#6B52DC", "#008FFB", "#FF4560", "#775DD0", "#2E294E", "#E2C044", "#00E396"];

/** 8 series colours for a dashboard, starting with its primary. Wired into charts in wave 2c. */
export function chartColors(dashboard: DashboardId): string[] {
  const { primary } = getDashboard(dashboard, {});
  const rest = PALETTE.filter((c) => c.toLowerCase() !== primary.toLowerCase());
  return [primary, ...rest].slice(0, 8);
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS, all tests.

- [ ] **Step 6: Commit**

```bash
git add packages/design_system/src/theme/muiThemeOptions.ts packages/design_system/src/theme/muiThemeOptions.test.ts packages/design_system/src/charts
git commit -m "feat(design-system): MUI theme options and chart colours per dashboard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: PlatformThemeProvider and Storybook theming

**Files:**
- Create: `packages/design_system/src/theme/PlatformThemeProvider.tsx`
- Modify: `packages/design_system/.storybook/preview.tsx`
- Delete: `packages/design_system/src/themes/light.ts`, `packages/design_system/src/themes/dark.ts`

**Interfaces:**
- Consumes: `muiThemeOptions`, `ThemeMode` (Task 3); `DashboardId` (Task 1); `AppProvider` from `@repo/design_system_mui` (existing: props `lightTheme`, `darkTheme`, `themeMode`).
- Produces: `function PlatformThemeProvider(props: { dashboard: DashboardId; children: React.ReactNode }): JSX.Element | null`. Renders nothing until mounted (as the apps' `context/theme-provider.tsx` did). Mode lives in next-themes (`localStorage` key `theme`, `attribute="class"`, `defaultTheme="light"`, `enableSystem`, `disableTransitionOnChange`).

**Why `AppProvider` and not `@mui/material` directly:** `packages/design_system_mui` resolves `@mui/material` to its own copy (a different `.pnpm` path from `packages/design_system`'s). A `ThemeProvider` imported here would set a context the MUI components never read. `AppProvider` lives next to the components and is what the apps use today.

- [ ] **Step 1: Implement the provider**

`packages/design_system/src/theme/PlatformThemeProvider.tsx`:
```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { AppProvider } from "@repo/design_system_mui";
import type { DashboardId } from "../dashboards";
import { muiThemeOptions } from "./muiThemeOptions";

function MuiBridge({ dashboard, children }: { dashboard: DashboardId; children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const lightTheme = React.useMemo(() => muiThemeOptions(dashboard, "light"), [dashboard]);
  const darkTheme = React.useMemo(() => muiThemeOptions(dashboard, "dark"), [dashboard]);

  return (
    <AppProvider lightTheme={lightTheme} darkTheme={darkTheme} themeMode={mode}>
      {children}
    </AppProvider>
  );
}

/** Theme for a whole app: next-themes owns light/dark, MUI follows it. */
export function PlatformThemeProvider({ dashboard, children }: { dashboard: DashboardId; children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Avoids a hydration mismatch, as the apps' previous ThemeProvider did.
  if (!mounted) return null;

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <MuiBridge dashboard={dashboard}>{children}</MuiBridge>
    </NextThemesProvider>
  );
}
```

- [ ] **Step 2: Switch Storybook to the shared theme and add a dashboard toolbar**

In `packages/design_system/.storybook/preview.tsx`:
- Replace
```tsx
import { light as muiLight } from '../src/themes/light';
import { dark as muiDark } from '../src/themes/dark';
```
with
```tsx
import { createTheme } from "@mui/material/styles";
import { muiThemeOptions } from '../src/theme/muiThemeOptions';
```
- In `globalTypes`, after the `theme` entry, add:
```tsx
  dashboard: {
    name: "Dashboard",
    description: "Dashboard primary colour",
    defaultValue: "vl",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "vl", title: "VL" },
        { value: "tb", title: "TB" },
      ],
    },
  },
```
- In the second decorator, replace
```tsx
      const muiTheme = isDark ? muiDark : muiLight;
```
with
```tsx
      const dashboard = context.globals.dashboard === "tb" ? "tb" : "vl";
      document.documentElement.dataset.dashboard = dashboard;
      const muiTheme = createTheme(muiThemeOptions(dashboard, isDark ? "dark" : "light"));
```

- [ ] **Step 3: Delete the old package theme copies and confirm nothing imports them**

```bash
git rm packages/design_system/src/themes/light.ts packages/design_system/src/themes/dark.ts
grep -rn "themes/light\|themes/dark" packages/design_system/src packages/design_system/.storybook
```
Expected: no output.

- [ ] **Step 4: Check Storybook still builds**

Run: `pnpm --filter @repo/design_system build-storybook 2>&1 | tail -5`
Expected: the same outcome as the Task 0 baseline. No new errors mentioning `themes/light`, `themes/dark`, `muiThemeOptions` or `theme.css`.

- [ ] **Step 5: Add a token page to Storybook**

`packages/design_system/src/styles/Tokens.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

const TOKENS = [
  "primary", "primary-foreground", "background", "foreground", "card", "muted", "muted-foreground",
  "border", "accent", "destructive", "warning", "success", "info", "ring", "sidebar", "sidebar-primary",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7", "chart-8",
];

function TokenPage() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TOKENS.map((token) => (
        <div key={token} className="rounded-lg border p-2 text-xs">
          <div className="mb-2 h-12 rounded-md border" style={{ background: `var(--${token})` }} />
          <code>--{token}</code>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof TokenPage> = { title: "Foundations/Tokens", component: TokenPage };
export default meta;

/** Switch VL/TB and light/dark from the toolbar. */
export const Tokens: StoryObj<typeof TokenPage> = {};
```

- [ ] **Step 6: Commit**

```bash
git add packages/design_system/src/styles/Tokens.stories.tsx packages/design_system/src/theme/PlatformThemeProvider.tsx packages/design_system/.storybook/preview.tsx
git commit -m "feat(design-system): PlatformThemeProvider; Storybook uses shared theme

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: One copy of the shadcn components

**Files:**
- Modify: all 30 files in `packages/design_system/src/components/ui/` (imports); replace 9 with the app version
- Modify: every file under `apps/vl` and `apps/tb` (outside `components/ui/`) that imports `components/ui/*`
- Delete: `apps/vl/components/ui/`, `apps/tb/components/ui/`

**Interfaces:**
- Produces: apps import shadcn components as `@repo/design_system/components/ui/<name>`. Package `components/ui/*` files import each other relatively (`./button`, `../../lib/utils`, `../../hooks/use-mobile`).

- [ ] **Step 1: Confirm TB and VL copies are identical**

Run: `diff -r apps/vl/components/ui apps/tb/components/ui && echo IDENTICAL`
Expected: `IDENTICAL`. If not, stop and report the difference.

- [ ] **Step 2: Take the live app version for the 9 files that differ**

The app versions are what users see today (e.g. `tabs` has no `data-[state=active]:bg-background`, `separator` uses `data-slot="separator-root"`):
```bash
for f in card chart dialog scroll-area separator skeleton tabs toggle-group toggle; do
  cp apps/vl/components/ui/$f.tsx packages/design_system/src/components/ui/$f.tsx
done
```
`resizable.tsx` is **not** copied: no app file imports it (`@repo/ai` has its own copy).

- [ ] **Step 3: Make every package ui file use relative imports**

```bash
cd packages/design_system/src/components/ui
sed -i -E \
  -e 's#from "@/lib/utils"#from "../../lib/utils"#' \
  -e 's#from "@/hooks/use-mobile"#from "../../hooks/use-mobile"#' \
  -e 's#from "@/components/ui/([a-z-]+)"#from "./\1"#' \
  *.tsx
grep -n '"@/' *.tsx
cd -
```
Expected: the final `grep` prints nothing.

- [ ] **Step 4: Point app imports at the package**

```bash
for app in apps/vl apps/tb; do
  grep -rlE 'components/ui/' $app --include=*.ts --include=*.tsx \
    | grep -v node_modules | grep -v "^$app/components/ui/" \
    | xargs -r sed -i -E \
      -e 's#from "@/components/ui/([a-z-]+)"#from "@repo/design_system/components/ui/\1"#' \
      -e 's#from "(\.\./)+components/ui/([a-z-]+)"#from "@repo/design_system/components/ui/\2"#' \
      -e "s#from '@/components/ui/([a-z-]+)'#from '@repo/design_system/components/ui/\1'#" \
      -e "s#from '(\.\./)+components/ui/([a-z-]+)'#from '@repo/design_system/components/ui/\2'#"
done
grep -rnE 'components/ui/' apps/vl apps/tb --include=*.ts --include=*.tsx | grep -v node_modules | grep -v '@repo/design_system/components/ui/' | grep -v '^apps/[a-z]*/components/ui/'
```
Expected: the final `grep` prints nothing.

- [ ] **Step 5: Delete the app copies**

```bash
git rm -r apps/vl/components/ui apps/tb/components/ui
```

- [ ] **Step 6: Type-check, test and lint both apps**

```bash
pnpm --filter=vl exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=tb exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=vl test 2>&1 | tail -3
pnpm --filter=vl lint 2>&1 | tail -3
pnpm --filter=tb lint 2>&1 | tail -3
pnpm --filter @repo/design_system test 2>&1 | tail -3
```
Expected: the same results as the Task 0 baseline (no new errors, same VL test count, all passing).

- [ ] **Step 7: Commit**

```bash
git add -A packages/design_system/src/components/ui apps/vl apps/tb
git diff --cached --name-only | grep -vE '^(packages/design_system/src/components/ui/|apps/(vl|tb)/)'   # must print nothing
git commit -m "refactor: apps use the design system's shadcn components

One copy in packages/design_system; the live app versions of card, chart,
dialog, scroll-area, separator, skeleton, tabs, toggle-group and toggle
replace the package versions so nothing renders differently. Package files
import relatively so they work when compiled inside an app.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
If the `grep` prints anything, or a staged path is in the "do not stage" list (e.g. `apps/tb/public/cobertura-laboratorios.html`), unstage it with `git restore --staged <path>` before committing.

---

### Task 6: DashboardShell with the dashboard switcher

**Files:**
- Create: `packages/design_system/src/layout/shell-utils.ts`, `shell-utils.test.ts`, `DashboardSwitcher.tsx`, `ShellHeader.tsx`, `DashboardShell.tsx`, `DashboardShell.test.tsx`, `DashboardShell.stories.tsx` (all in `packages/design_system/src/layout/`)

**Interfaces:**
- Consumes: `getDashboard`, `getDashboards`, `DashboardId`, `DashboardInfo` (Task 1); package `components/ui/{sidebar,dropdown-menu,avatar,tooltip}` (Task 5 made them relative).
- Produces:
  - `interface ShellNavItem { label: string; href: string; icon?: React.ReactNode; active: boolean }`
  - `interface ShellUser { name: string; email: string; imageUrl?: string }`
  - `interface DashboardShellProps { dashboard: DashboardId; nav: ShellNavItem[]; user: ShellUser; onSignOut: () => void; pageTitle?: string; rightPanel?: React.ReactNode; children: React.ReactNode }`
  - `function DashboardShell(props: DashboardShellProps): JSX.Element`
  - helpers: `readSidebarOpen(cookie: string): boolean`, `switcherItems(current: DashboardId, dashboards: DashboardInfo[]): SwitcherItem[]`, `headerTitle(portalTitle: string, pageTitle?: string): string`, `initials(name: string): string`, `EMBLEM_URL`, `SIDEBAR_WIDTH = "300px"`, `SIDEBAR_WIDTH_ICON = "88px"`.

Layout rules (spec §4.2, governing rule): sidebar left with the switcher where the emblem is today, nav items below with the app's icons, labels and `active` flag; collapsed (88px, icons only) by default, 300px expanded; sticky 80px header with `{portalTitle} - {pageTitle}` on the left and settings + user menus on the right; below 768px the sidebar is a sheet opened from a header button. The user menu keeps today's items and order: name, email, "Conta de Perfil", "Configurações", "Sair da conta".

- [ ] **Step 1: Write the failing helper tests**

`packages/design_system/src/layout/shell-utils.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getDashboards } from "../dashboards";
import { headerTitle, initials, readSidebarOpen, switcherItems } from "./shell-utils";

describe("readSidebarOpen", () => {
  it("is collapsed by default", () => {
    expect(readSidebarOpen("")).toBe(false);
    expect(readSidebarOpen("other=1")).toBe(false);
  });
  it("reads the shadcn sidebar cookie", () => {
    expect(readSidebarOpen("a=1; sidebar_state=true; b=2")).toBe(true);
    expect(readSidebarOpen("sidebar_state=false")).toBe(false);
  });
});

describe("switcherItems", () => {
  const dashboards = getDashboards({ tb: "http://localhost:3001" });

  it("lists every dashboard and marks the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.map((i) => [i.id, i.current])).toEqual([["vl", true], ["tb", false]]);
  });
  it("links to the other dashboards with registry URLs and not to the current one", () => {
    const items = switcherItems("vl", dashboards);
    expect(items.find((i) => i.id === "tb")?.href).toBe("http://localhost:3001");
    expect(items.find((i) => i.id === "vl")?.href).toBeUndefined();
  });
});

describe("headerTitle", () => {
  it("joins portal and page like today's header", () => {
    expect(headerTitle("Portal de Carga Viral", "Sumário")).toBe("Portal de Carga Viral - Sumário");
  });
  it("shows only the portal when the page is unknown", () => {
    expect(headerTitle("Portal de Carga Viral", undefined)).toBe("Portal de Carga Viral");
  });
});

describe("initials", () => {
  it("uses the first letter, like today's avatar", () => {
    expect(initials("vagner pene")).toBe("V");
    expect(initials("")).toBe("?");
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout`
Expected: FAIL, `./shell-utils` not found.

- [ ] **Step 3: Implement the helpers**

`packages/design_system/src/layout/shell-utils.ts`:
```ts
import type { DashboardId, DashboardInfo } from "../dashboards";

export const EMBLEM_URL = "https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png";
export const SIDEBAR_WIDTH = "300px";
export const SIDEBAR_WIDTH_ICON = "88px";

export interface SwitcherItem {
  id: DashboardId;
  name: string;
  primary: string;
  current: boolean;
  href?: string;
}

/** shadcn's SidebarProvider writes `sidebar_state`; collapsed unless it says true. */
export function readSidebarOpen(cookie: string): boolean {
  return cookie.split(";").some((part) => part.trim() === "sidebar_state=true");
}

export function switcherItems(current: DashboardId, dashboards: DashboardInfo[]): SwitcherItem[] {
  return dashboards.map((d) => ({
    id: d.id,
    name: d.name,
    primary: d.primary,
    current: d.id === current,
    href: d.id === current ? undefined : d.url,
  }));
}

export function headerTitle(portalTitle: string, pageTitle?: string): string {
  return pageTitle ? `${portalTitle} - ${pageTitle}` : portalTitle;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
```

- [ ] **Step 4: Run the helper tests to see them pass**

Run: `pnpm --filter @repo/design_system test -- src/layout`
Expected: PASS.

- [ ] **Step 5: Write the failing render tests**

`packages/design_system/src/layout/DashboardShell.test.tsx`:
```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: () => {} }) }));

import { DashboardShell } from "./DashboardShell";

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

describe("DashboardShell", () => {
  it("renders the switcher with the current dashboard, the nav and the header title", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain("Carga Viral");
    expect(html).toContain("Portal de Carga Viral - Sumário");
    expect(html).toContain('href="/lab"');
    expect(html).toContain("conteúdo");
    expect(html).toMatch(/data-active="true"[^>]*>[\s\S]*?Sumário/);
  });

  it("uses the TB registry entry for TB", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} dashboard="tb" pageTitle="Província"><p /></DashboardShell>);
    expect(html).toContain("Tuberculose");
    expect(html).toContain("Portal de Testagem Laboratorial de TB - Província");
  });

  it("renders the right panel only when given", () => {
    const without = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(without).not.toContain('data-slot="shell-right-panel"');
    const withPanel = renderToStaticMarkup(
      <DashboardShell {...base} rightPanel={<span>chat</span>}><p /></DashboardShell>,
    );
    expect(withPanel).toContain('data-slot="shell-right-panel"');
    expect(withPanel).toContain("chat");
  });

  it("renders with an empty nav", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} nav={[]}><p>ok</p></DashboardShell>);
    expect(html).toContain("ok");
  });
});
```

- [ ] **Step 6: Run them to see them fail**

Run: `pnpm --filter @repo/design_system test -- src/layout/DashboardShell`
Expected: FAIL, `./DashboardShell` not found.

- [ ] **Step 7: Implement the switcher**

`packages/design_system/src/layout/DashboardSwitcher.tsx`:
```tsx
"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { getDashboard, getDashboards, type DashboardId } from "../dashboards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../components/ui/sidebar";
import { EMBLEM_URL, switcherItems } from "./shell-utils";

function ColorMark({ color, className = "size-2.5" }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} shrink-0 rounded-full`} style={{ backgroundColor: color }} />;
}

export function DashboardSwitcher({ dashboard }: { dashboard: DashboardId }) {
  const current = getDashboard(dashboard);
  const items = switcherItems(dashboard, getDashboards());

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip={current.name} className="data-[state=open]:bg-sidebar-accent">
              <span className="relative flex size-10 shrink-0 items-center justify-center">
                <img src={EMBLEM_URL} alt="" className="size-10 object-contain" />
                <ColorMark color={current.primary} className="absolute -right-0.5 -bottom-0.5 size-3 ring-2 ring-sidebar" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                <span className="truncate text-xs text-sidebar-foreground/70">OpenLDR</span>
                <span className="truncate font-semibold">{current.name}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={8} className="min-w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Painéis</DropdownMenuLabel>
            {items.map((item) =>
              item.current ? (
                <DropdownMenuItem key={item.id} disabled className="gap-2 opacity-100">
                  <ColorMark color={item.primary} />
                  <span className="flex-1 font-semibold">{item.name}</span>
                  <Check className="size-4" aria-label="Painel atual" />
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={item.id} asChild className="gap-2">
                  <a href={item.href}>
                    <ColorMark color={item.primary} />
                    <span className="flex-1">{item.name}</span>
                  </a>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

- [ ] **Step 8: Implement the header**

`packages/design_system/src/layout/ShellHeader.tsx`:
```tsx
"use client";

import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { SidebarTrigger } from "../components/ui/sidebar";
import { initials } from "./shell-utils";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

function SettingsMenu() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Definições" className="rounded-full p-2 hover:bg-accent">
        <Settings className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Modo</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? "light"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Escuro</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">Sistema</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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

export function ShellHeader({ title, user, onSignOut }: { title: string; user: ShellUser; onSignOut: () => void }) {
  return (
    <header className="sticky top-0 z-[1100] flex h-20 w-full items-center justify-between gap-2 bg-background/40 px-4 backdrop-blur-[8px]">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger aria-label="Menu" />
        <h1 className="truncate text-base font-bold sm:text-lg md:text-xl lg:text-[1.375rem] xl:text-2xl">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <SettingsMenu />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
```
Before writing, check the exact export names in `packages/design_system/src/components/ui/avatar.tsx` and `dropdown-menu.tsx` (`AvatarFallback`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`) and use what is there.

- [ ] **Step 9: Implement the shell**

`packages/design_system/src/layout/DashboardShell.tsx`:
```tsx
"use client";

import * as React from "react";
import { getDashboard, type DashboardId } from "../dashboards";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../components/ui/sidebar";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { ShellHeader, type ShellUser } from "./ShellHeader";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, headerTitle, readSidebarOpen } from "./shell-utils";

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

export function DashboardShell({ dashboard, nav, user, onSignOut, pageTitle, rightPanel, children }: DashboardShellProps) {
  const info = getDashboard(dashboard);
  const [defaultOpen] = React.useState(() =>
    typeof document === "undefined" ? false : readSidebarOpen(document.cookie),
  );

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="py-8">
          <DashboardSwitcher dashboard={dashboard} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.label}
                    className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="h-svh overflow-y-auto overflow-x-hidden bg-transparent [container-type:inline-size]">
        <ShellHeader title={headerTitle(info.portalTitle, pageTitle)} user={user} onSignOut={onSignOut} />
        <div className="px-4 pb-8">{children}</div>
      </SidebarInset>
      {rightPanel !== undefined && (
        <aside data-slot="shell-right-panel" className="h-svh shrink-0 border-l">
          {rightPanel}
        </aside>
      )}
    </SidebarProvider>
  );
}
```
Notes for the implementer:
- Nav links are plain `<a>` because the package has no `next` dependency; today's `MainOptions` also renders plain links (`href`). If the old nav used client-side navigation, check `packages/design_system_mui/src/molecules/sidebar/MainOptions.tsx` and match it; report what you found.
- `container-type: inline-size` on the content keeps the `@container` queries the MUI layout provided.

- [ ] **Step 10: Run all package tests**

Run: `pnpm --filter @repo/design_system test`
Expected: PASS. If `renderToStaticMarkup` fails inside Radix because of `window`, wrap only the failing assertion's subject differently; do not mock `components/ui`.

- [ ] **Step 11: Add Storybook stories**

`packages/design_system/src/layout/DashboardShell.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid, FlaskConical, MapPin, Users } from "lucide-react";
import { DashboardShell } from "./DashboardShell";

const nav = [
  { label: "Sumário", href: "#", icon: <LayoutGrid />, active: true },
  { label: "Laboratório", href: "#lab", icon: <FlaskConical />, active: false },
  { label: "Província/Distrito/US", href: "#clinic", icon: <MapPin />, active: false },
  { label: "Pacientes", href: "#patients", icon: <Users />, active: false },
];

const meta: Meta<typeof DashboardShell> = {
  title: "Layout/DashboardShell",
  component: DashboardShell,
  parameters: { layout: "fullscreen" },
  args: {
    dashboard: "vl",
    nav,
    pageTitle: "Sumário",
    user: { name: "Utilizador Exemplo", email: "utilizador@openldr.org.mz" },
    onSignOut: () => {},
    children: <div className="h-[120vh] rounded-2xl border bg-card p-6">Conteúdo da página</div>,
  },
};
export default meta;

type Story = StoryObj<typeof DashboardShell>;

export const ViralLoad: Story = {};
export const Tuberculosis: Story = { args: { dashboard: "tb", pageTitle: "Província" } };
export const WithRightPanel: Story = { args: { rightPanel: <div className="w-80 p-4">Painel lateral</div> } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
```
Storybook stories have no next-themes provider; if `useTheme` errors, add a decorator in this file that wraps the story in `<ThemeProvider attribute="class">` from `next-themes`.

- [ ] **Step 12: Commit**

```bash
git add packages/design_system/src/layout
git commit -m "feat(design-system): DashboardShell with dashboard switcher

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Move VL onto the shared theme and shell

**Files:**
- Modify: `apps/vl/app/globals.css`, `apps/vl/app/layout.tsx`, `apps/vl/app/(dashboard)/layout.tsx`
- Delete: `apps/vl/themes/`, `apps/vl/context/theme-provider.tsx`, `apps/vl/hooks/useLayoutSettings.ts`

**Interfaces:**
- Consumes: `theme.css` (Task 2), `PlatformThemeProvider` (Task 4), `DashboardShell`, `ShellNavItem` (Task 6). VL's existing `buildNavItems(pathname, isAdmin)`, `PAGE_LABELS`, `AdminProvider`, `useIsAdmin` (unchanged).

- [ ] **Step 1: Shrink `globals.css`**

Replace the whole of `apps/vl/app/globals.css` with:
```css
@import "tailwindcss";
@import "tw-animate-css";
/* Shared OpenLDR tokens, dark variant, base layer and chart overrides. */
@import "../../../packages/design_system/src/styles/theme.css";

/* Tailwind v4 ignores tailwind.config content globs, so we declare sources here for the app and shared packages. */
@source "./**/*.{ts,tsx,js,jsx,mdx}";
@source "../components/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/design_system/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/ai/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/auth/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "!../../../packages/**/node_modules/**/*";
@source "!../../../packages/design_system/dist/**/*";
```

- [ ] **Step 2: Root layout: dashboard attribute and shared provider**

In `apps/vl/app/layout.tsx`:
- Replace `import { ThemeProvider } from "../context/theme-provider"` with `import { PlatformThemeProvider } from "@repo/design_system/theme/PlatformThemeProvider";`
- Replace `<html lang="pt" suppressHydrationWarning>` with `<html lang="pt" data-dashboard="vl" suppressHydrationWarning>`
- Replace the opening
```tsx
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
```
with `        <PlatformThemeProvider dashboard="vl">`, and the matching `</ThemeProvider>` with `</PlatformThemeProvider>`. Leave `ClerkProvider`, the font, metadata and the commented `AuthProvider` block as they are.

- [ ] **Step 3: Dashboard layout: use the shell**

Replace the whole of `apps/vl/app/(dashboard)/layout.tsx` with:
```tsx
"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLab } from "@repo/design_system/app/atoms/icons/Lab"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { useUser, useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { AdminProvider, useIsAdmin } from "@/lib/vl/admin"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/vl/nav"

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  lab: <IconlyLab style="two-tone" size={19} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const nav: ShellNavItem[] = buildNavItems(pathname, isAdmin).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  return (
    <DashboardShell
      dashboard="vl"
      pageTitle={PAGE_LABELS[pathname]}
      nav={nav}
      user={{
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        imageUrl: user?.imageUrl || undefined,
      }}
      onSignOut={() => signOut()}
    >
      {children}
    </DashboardShell>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
```
Removed on purpose (spec §4.3): the settings store, the small-screen `compact` switch, `AppProvider` (now inside `PlatformThemeProvider`), the mount gate (now inside `PlatformThemeProvider`).

- [ ] **Step 4: Delete what VL no longer uses**

```bash
git rm -r apps/vl/themes apps/vl/context/theme-provider.tsx apps/vl/hooks/useLayoutSettings.ts
grep -rnE "themes/|theme-provider|useLayoutSettings|design_system/contexts" apps/vl --include=*.ts --include=*.tsx | grep -v node_modules
```
Expected: the `grep` prints nothing. If `apps/vl/context/` or `apps/vl/hooks/` is now empty, git drops it automatically.

- [ ] **Step 5: Type-check, test, lint and build VL**

```bash
pnpm --filter=vl exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=vl test 2>&1 | tail -3
pnpm --filter=vl lint 2>&1 | tail -3
pnpm --filter=vl build 2>&1 | tail -15
```
Expected: no new type or lint errors versus the baseline; same VL test count, all passing; build succeeds. The build needs `NEXT_PUBLIC_*` values; the copied `.env.local` provides them.

- [ ] **Step 6: Run VL and look at it**

`NEXT_PUBLIC_OPENLDR_API=https://api.openldr.org.mz pnpm --filter=vl exec next dev --turbopack -p 3000`, sign in (ask the user if needed) and check, in light and dark:
- sidebar collapsed by default with the switcher at the top, green colour mark, VL nav icons in today's order, the active item green; the toggle expands it and the state survives a reload;
- header reads "Portal de Carga Viral - Sumário" (and the right page name on each page), settings and user menus at the top right; switching mode turns both the page and the MUI cards dark/light;
- the switcher lists Carga Viral (checked) and Tuberculose; with `NEXT_PUBLIC_DASHBOARD_URL_TB=http://localhost:3001` set, "Tuberculose" links there;
- cards look and behave as in the "before" screenshots (open a drill-down, a dialog and an export).
Report anything else that changed.

- [ ] **Step 7: Commit**

```bash
git add -A apps/vl
git commit -m "feat(vl): shared theme and DashboardShell

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Move TB onto the shared theme and shell

**Files:**
- Modify: `apps/tb/app/globals.css`, `apps/tb/app/layout.tsx`, `apps/tb/app/(dashboard)/layout.tsx`
- Delete: `apps/tb/themes/`, `apps/tb/context/theme-provider.tsx`, `apps/tb/hooks/useLayoutSettings.ts`

**Interfaces:**
- Consumes: same as Task 7; TB's `AIChatProvider` from `@repo/ai/src/context/ai-chat-provider` (props `dashboard`, `panelSizes`, `onPanelResize`; unchanged).

- [ ] **Step 1: Shrink `globals.css`**

Replace the whole of `apps/tb/app/globals.css` with exactly the content given in Task 7 Step 1 (the two files were identical and stay identical):
```css
@import "tailwindcss";
@import "tw-animate-css";
/* Shared OpenLDR tokens, dark variant, base layer and chart overrides. */
@import "../../../packages/design_system/src/styles/theme.css";

/* Tailwind v4 ignores tailwind.config content globs, so we declare sources here for the app and shared packages. */
@source "./**/*.{ts,tsx,js,jsx,mdx}";
@source "../components/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/design_system/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/ai/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "../../../packages/auth/src/**/*.{ts,tsx,js,jsx,mdx}";
@source "!../../../packages/**/node_modules/**/*";
@source "!../../../packages/design_system/dist/**/*";
```

- [ ] **Step 2: Root layout**

In `apps/tb/app/layout.tsx`, make the same three edits as Task 7 Step 2 with `tb`:
- `import { PlatformThemeProvider } from "@repo/design_system/theme/PlatformThemeProvider";` instead of the `ThemeProvider` import;
- `<html lang="en" data-dashboard="tb" suppressHydrationWarning>` (keep `lang="en"` as today);
- `<PlatformThemeProvider dashboard="tb">` … `</PlatformThemeProvider>` instead of the `ThemeProvider` block.

- [ ] **Step 3: Dashboard layout: shell inside the AI chat provider**

`AIChatProvider` stays, wrapping the shell as it wraps `DashboardLayout` today: a TB card menu option calls `openChat`, and `useAIChat` throws without the provider (spec §4.2). It used to get panel sizes from the settings store; it now gets today's default values directly.

Replace the whole of `apps/tb/app/(dashboard)/layout.tsx` with:
```tsx
"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider"
import { useUser, useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

// Same defaults the removed layout-settings store used.
const AI_CHAT_PANEL_SIZES = { left: 75, right: 25 };

const pathToLabel: Record<string, string> = {
  "/": "Sumário",
  "/clinic": "Província",
  "/patients": "Resultados de Pacientes",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();

  const nav: ShellNavItem[] = [
    { label: "Sumário", icon: <IconlyGrid style="two-tone" size={18} />, href: "/" },
    { label: "Província", icon: <IconlyLocation style="two-tone" size={19} />, href: "/clinic" },
    { label: "Pacientes", icon: <IconlyPatients style="two-tone" size={19} />, href: "/patients" },
  ].map((option) => ({ ...option, active: option.href === pathname }));

  return (
    <AIChatProvider dashboard="tb" panelSizes={AI_CHAT_PANEL_SIZES} onPanelResize={() => {}}>
      <DashboardShell
        dashboard="tb"
        pageTitle={pathToLabel[pathname]}
        nav={nav}
        user={{
          name: user?.fullName || "",
          email: user?.emailAddresses[0]?.emailAddress || "",
          imageUrl: user?.imageUrl || undefined,
        }}
        onSignOut={() => signOut()}
      >
        {children}
      </DashboardShell>
    </AIChatProvider>
  );
}
```
Check `AIChatProvider`'s prop types in `packages/ai/src/context/ai-chat-provider.tsx` (line ~51) and match them exactly (e.g. if `onPanelResize` is optional, keep passing the no-op anyway for clarity).

- [ ] **Step 4: Delete what TB no longer uses**

```bash
git rm -r apps/tb/themes apps/tb/context/theme-provider.tsx apps/tb/hooks/useLayoutSettings.ts
grep -rnE "themes/|theme-provider|useLayoutSettings|design_system/contexts" apps/tb --include=*.ts --include=*.tsx | grep -v node_modules
```
Expected: one hit only, `mtb-piechart-card/constants.ts` (fixed in Task 9). Anything else: fix the import to the package equivalent, or stop and report.

- [ ] **Step 5: Type-check, lint and build TB**

```bash
pnpm --filter=tb exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=tb lint 2>&1 | tail -3
pnpm --filter=tb build 2>&1 | tail -15
```
Expected: no new errors versus the baseline; build succeeds.

- [ ] **Step 6: Run TB and look at it**

`NEXT_PUBLIC_OPENLDR_API=https://api.openldr.org.mz pnpm --filter=tb exec next dev --turbopack -p 3001`, then check the same list as Task 7 Step 6 with TB values: orange colour mark and active item, "Portal de Testagem Laboratorial de TB - Província" on `/clinic`. Also open the menu of the `mtb-xpert-ultra-facilities` card and use its AI chat option: it must behave as it does on `main`.

- [ ] **Step 7: Commit**

```bash
git add -A apps/tb
git commit -m "feat(tb): shared theme and DashboardShell

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Import rule, remaining direct MUI-package imports, docs and final verification

**Files:**
- Modify: `apps/vl/eslint.config.mjs`, `apps/tb/eslint.config.mjs`, `apps/tb/app/(dashboard)/(index)/reports/mtb-piechart-card/constants.ts`, `apps/tb/app/(dashboard)/(index)/reports/mtb-piechart-card/index.tsx`, `apps/tb/app/(dashboard)/clinic/reports/shared/PatientDialog.tsx`, `CLAUDE.md`

**Interfaces:**
- Consumes: existing re-exports `@repo/design_system/app/atoms/modals/Dialog` (`Dialog`), `@repo/design_system/app/atoms/charts/chartjs/Pie` (`ChartjsPie`), `packages/design_system/src/themes/charts.ts`.

- [ ] **Step 1: Point TB's three direct `design_system_mui` imports at the design system**

```bash
diff packages/design_system/src/themes/charts.ts packages/design_system_mui/src/themes/charts.ts && echo SAME
```
Expected: `SAME` (or a whitespace-only difference). Then:
- `mtb-piechart-card/constants.ts`: `import chartTheme from "../../../../../../../packages/design_system_mui/src/themes/charts";` → `import chartTheme from "@repo/design_system/themes/charts";`
- `mtb-piechart-card/index.tsx`: `import { ChartjsPie } from "@repo/design_system_mui";` → `import { ChartjsPie } from "@repo/design_system/app/atoms/charts/chartjs/Pie";`
- `clinic/reports/shared/PatientDialog.tsx`: `import { Dialog } from '@repo/design_system_mui';` → `import { Dialog } from '@repo/design_system/app/atoms/modals/Dialog';` (leave the commented-out block above it as is).

These re-exports point at the same components, so nothing changes at runtime.

- [ ] **Step 2: Add the import rule to both apps**

In `apps/vl/eslint.config.mjs` and `apps/tb/eslint.config.mjs`, add this entry to the `eslintConfig` array after the existing overrides block:
```js
  // Apps import shared UI only from @repo/design_system (platform spec §5.4).
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@repo/design_system_mui", "@repo/design_system_mui/*", "**/design_system_mui/**"],
          message: "Import from @repo/design_system instead.",
        }],
      }],
      // Warning until wave 2f removes MUI from the apps.
      "@typescript-eslint/no-restricted-imports": ["warn", {
        patterns: [{ group: ["@mui/*"], message: "MUI is being removed; use @repo/design_system." }],
      }],
    },
  },
```

- [ ] **Step 3: Lint, and prove the rule fires**

```bash
pnpm --filter=vl lint 2>&1 | tail -5
pnpm --filter=tb lint 2>&1 | tail -5
printf 'import { Dialog } from "@repo/design_system_mui";\nexport const x = Dialog;\n' > apps/vl/lib/__rule_check.ts
pnpm --filter=vl exec eslint lib/__rule_check.ts; echo "exit=$?"
rm apps/vl/lib/__rule_check.ts
```
Expected: both lints have no errors (new `@mui/*` warnings are expected, about 18 files); the check file fails with "Import from @repo/design_system instead." and `exit=1`.

- [ ] **Step 4: Update `CLAUDE.md`**

```bash
sed -i 's#"@/components/ui/#"@repo/design_system/components/ui/#g' CLAUDE.md
grep -n '@/components/ui' CLAUDE.md
```
Expected: no output. Then add under `## Design System`, before `### Atomic Design Pattern`:
```markdown
### Platform shell and theme

- Shared tokens: `packages/design_system/src/styles/theme.css`, imported by each app's `globals.css`. The dashboard colour comes from `data-dashboard="<id>"` on `<html>`.
- Dashboards (names, URLs, colours): `packages/design_system/src/dashboards.ts`. Adding one means a registry entry, a `[data-dashboard]` block in `theme.css` and a `NEXT_PUBLIC_DASHBOARD_URL_<ID>` override name.
- Root layout: `<PlatformThemeProvider dashboard="<id>">` (next-themes + MUI). Dashboard layout: `<DashboardShell>`.
- shadcn components: `@repo/design_system/components/ui/<name>`; apps have no copies.
- Apps must not import `@repo/design_system_mui` (lint error).
- Governing rule for the redesign: visual changes only; never change component structure, props or behaviour.
```

- [ ] **Step 5: Full check run**

```bash
pnpm --filter @repo/design_system test 2>&1 | tail -3
pnpm --filter=vl test 2>&1 | tail -3
pnpm --filter=vl exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=tb exec tsc --noEmit 2>&1 | tail -3
pnpm --filter=vl build 2>&1 | tail -5
pnpm --filter=tb build 2>&1 | tail -5
git diff --stat origin/main -- pnpm-lock.yaml
```
Expected: all pass; VL test count equals the baseline; no lockfile change. Also confirm success criterion 3:
```bash
ls apps/vl/components/ui apps/tb/components/ui apps/vl/themes apps/tb/themes apps/vl/context/theme-provider.tsx apps/tb/context/theme-provider.tsx 2>&1 | grep -c "No such file"
```
Expected: `6`.

- [ ] **Step 6: "After" screenshots and comparison**

Repeat Task 0 Step 5 against the worktree, saving to `~/openldr-screenshots/platform-shell/after/` with the same names. Compare each pair. Allowed differences (spec §6): the sidebar and header; shadcn `--primary` elements (buttons, focus rings, Clerk sign-in button) now in the dashboard colour; TB's MUI primary green → `#F8A200`. Write a table in the ledger: page, mode, "only allowed differences" yes/no, notes. Any other difference inside a card is a regression: fix it if it is a token or class mistake; if fixing it needs a structural change, stop and ask the user.

- [ ] **Step 7: Commit**

```bash
git add apps/vl/eslint.config.mjs apps/tb/eslint.config.mjs "apps/tb/app/(dashboard)/(index)/reports/mtb-piechart-card/constants.ts" "apps/tb/app/(dashboard)/(index)/reports/mtb-piechart-card/index.tsx" "apps/tb/app/(dashboard)/clinic/reports/shared/PatientDialog.tsx" CLAUDE.md
git commit -m "chore: apps import shared UI only from @repo/design_system

Lint rule (error for design_system_mui, warning for @mui/*), TB's three
direct design_system_mui imports moved to design_system re-exports, and
CLAUDE.md updated for the platform shell.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Hand over**

Report to the user: checks, the screenshot table, anything that differs from the spec, and the next decisions (push the branch and open a PR; staging Coolify apps; merge). Do not push or create anything outside the worktree without asking.
