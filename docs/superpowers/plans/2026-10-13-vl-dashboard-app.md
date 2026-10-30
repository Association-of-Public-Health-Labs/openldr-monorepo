# VL Dashboard App (`apps/vl`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `apps/vl`, a Next.js dashboard that replaces the legacy cargaviral.openldr.org.mz Viral Load dashboard. It has the same 26 cards plus an Admin-only Pacientes page, and reads all data from `api_openldr_python`.

**Architecture:** `apps/vl` copies the `apps/tb` shell (Clerk, theme, `DashboardLayout`, Dockerfile). Unlike TB, which repeats about 450 lines per report, the shared logic lives in one place:
- `lib/vl/`: pure TypeScript for API calls, dates, series, drill-down state, patients and export, all unit-tested with Vitest.
- `components/`: one `ReportCard` wrapper around `MainCard`, plus small app-local charts and dialogs.

Each card keeps the TB folder layout (`index.tsx`, `actions.ts`, `constants.ts`, `docs.tsx`, plus `actions.test.ts`). Its `actions.ts` holds only that card's endpoint, params and data transforms.

**Tech Stack:** Next 15.5.25, React 18, TypeScript (strict off, as in TB), Clerk 6, MUI-based `@repo/design_system`, ApexCharts 5 via `react-apexcharts` 1.7, axios, xlsx, html2canvas, Vitest 3.2.4 (node environment), pnpm 9 + turbo.

**Spec:** `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md`, §5 (piece 2). Read §5 before starting. §4 describes the API this app calls.

**API reference used to write this plan:** `api_openldr_python` branch `feat/vl-api-parity` (PR #6). Every path, param and response key below comes from that branch.

## Global Constraints

- Package name `vl`, directory `apps/vl`, Next `15.5.25`, title "Portal de Carga Viral". All user-facing text is in Portuguese.
- Nav: Sumário `/`, Laboratório `/lab`, Província/Distrito/US `/clinic`, Pacientes `/patients` (Pacientes only for Admins).
- No AI chat: do not use `AIChatProvider` or `@repo/ai`.
- Shared packages: **one** additive change only (Ruling P1). It adds an optional `portalTitle` prop to `DashboardLayout`, and its default keeps TB's text byte-for-byte. Nothing else under `packages/` changes.
- Requests:
  - `interval_dates="YYYY-MM-DD,YYYY-MM-DD"`, `paramsSerializer: { indexes: null }`, Bearer token from Clerk `getToken()`, base `process.env.NEXT_PUBLIC_OPENLDR_API`.
  - Every VL path starts with `/hiv/vl/` and ends with `/`.
- Default windows:
  - Most cards: one year ago → today, the legacy "Últimos 12 meses".
  - Relatório Semanal (por lab): the legacy week, Sunday → Saturday of the week containing today − 6 days.
  - Relatório Semanal: today − 84 days → today, the legacy "Últimas 12 Semanas".
- Suppression % = `round(suppressed / total × 100)`, and 0 when `total` is 0.
- Month labels: 3-letter Portuguese abbreviation plus a 2-digit year, e.g. `Out/25` (Ruling P6).
- Every card has:
  - Excel export (xlsx) and PNG export;
  - `MainCardSkeleton` on first load;
  - inline error text with a "Tentar novamente" button (the page never crashes);
  - an empty-state message.
- Admin status comes from the API (Ruling P3), never from Clerk metadata.
- Importing rules:
  - `lib/vl/**/*.ts` and every card `actions.ts` / `constants.ts` must not import React, Next, MUI or `@repo/*`, so Vitest can run them in node.
  - React hooks live in `apps/vl/hooks/`. `.tsx` files may import anything.
  - `lib/vl/export/image.ts` loads `apexcharts` and `html2canvas` lazily, and no test imports it.
- Dockerfile: same as TB's, but with `--filter=vl`.
- Gates: `pnpm --filter=vl test`, `pnpm --filter=vl exec tsc --noEmit`, `pnpm --filter=vl lint`, `pnpm turbo run build --filter=vl` and `pnpm turbo run build --filter=tb` must all pass.

## Rulings (decided while writing this plan; spec deviations marked ⚠)

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| P1 ⚠ | Add an optional `portalTitle?: string` prop to `packages/design_system_mui/src/templates/DashboardLayout.tsx`. It defaults to `"Portal de Testagem Laboratorial de TB"`, and VL passes `"Portal de Carga Viral"`. | The header text is hard-coded to the TB portal name in two places, so without this VL would say "TB". The change is additive, and TB renders identically. The spec said "no shared package changes" to protect TB; the TB build gate still protects it. | If refused, VL must copy the 300-line layout into the app. |
| P2 ⚠ | Lab cards use `reportType="national"` (date range) plus an app-local "Seleccionar laboratórios" option, which opens a dialog with the legacy 16 lab groups. Selected groups → `lab_code` list. | The shared `LabDialog` hides its lab picker and returns districts, never lab codes. The spec allows an app-local mapping. The 16 groups are exactly what the legacy menu offered. | The lab picker looks different from TB's. |
| P3 ⚠ | Admin = probe `GET /hiv/vl/patients/by_facility/?per_page=1`. A 403 means not Admin. A 400 or 200 means Admin (the API checks the role before validating params). Anything else means not Admin. The result is cached for the session in `AdminProvider`. | No API endpoint returns the role for a Clerk token, and VL rows carry no `Role`. The probe uses the verified identity, as the spec requires, with no API change. | If the API ever validates before the role check, everyone looks like an Admin in the UI. The API still returns 403 on real patient data, so no data leaks. |
| P4 | App-local `ComboChart` (react-apexcharts) is used for the line, sparkline, mixed bar+line, dual-axis and grouped-stack charts. App-local `PieChart` replaces the design-system `Pie`. The design-system `Stacked` is used for every other bar chart. | `MixedLineBar` takes exactly two series and has no id. `StackedWithLine`'s line is a constant annotation. `Line` has a fixed id. `Pie` appends "K" to counts. `BarGroup` has no colours. | Visual differences from TB charts. |
| P5 | The Sumário map uses `InteractiveSvgMap`, not `MapCard`. The indicators table uses the app's `components/ui/table`, not `TableCard`. | `MapCard` is a Google Maps routes card. `TableCard` has a fixed TB title and columns. | None. |
| P6 | Month labels include the year (`Out/25`). | A 12-month window from today's date spans 13 calendar months, so the legacy `Oct` would appear twice. | Labels differ slightly from legacy. |
| P7 | Excel and PNG export code is shared (`lib/vl/export/*`). Each card's `actions.ts` exports a `toExcel()` sheet builder instead of separate `excel-export-utils.ts` / `chart-export-utils.ts` files. | The 26 copies TB keeps would be the same code. | None. |
| P8 | Drill-down follows the legacy rules (§ "Drill-down" in Task 2). FacilitiesPopup results are mapped as follows: province → `value`; district → `label` (DistrictName); clinic → `label` (FacilityName), with `facility_type=health_facility` and only the first clinic sent. | The API filters by names and `health_facility` is a single value. | Selecting several US filters on the first one only; the subtitle shows which one. |
| P9 | Patient drill-down sends `by_facility` with `health_facility`, the parent `district` when known, and the card's filters: tested cards `date_basis=analysis` + `result_type=suppressed&result_type=not_suppressed`; registered cards `date_basis=registration`; `rejected=true`; `pregnant=true`; `breastfeeding=true`; `age_range`. It loads up to 500 rows; above that the dialog says "A mostrar 500 de N". | This mirrors each legacy patient query using bound parameters. `per_page` is capped at 500 by the API. | Facilities with more than 500 patients need the Pacientes page for the full list. |
| P10 | The facility "Tempo de Resposta por Província/mês" card sends `facility_type`, which the legacy card forgot to send. | Fixes a frontend bug. Numbers are identical for province filters. | None. |
| P11 | The "Registo à Análise" colour is `#6B53C6`, the legacy theme tertiary. | The legacy `#00000` is invalid hex. | Colour only. |
| P12 | The Pacientes "Por US" tab takes the exact facility name as free text. Province and district are optional. | The API filters `RequestingFacilityName =`. A facility picker is a follow-up. | Typos return no rows. |
| P13 | Status cards show a sparkline and the period, with no trend arrow, as the legacy cards did. The values reproduce the legacy maths: total = sum; suppression = mean of the rounded monthly %; TAT = mean of the monthly sum of the 4 segments. | Parity with the numbers users know. | None. |

## Review Focus

These failure modes are not covered by the spec's happy path. Each has a test in the task that owns the code.

1. **Filters changed quickly** (two submits in a row; drilling while a request is in flight). The older response must never overwrite the newer one. → `lib/vl/request-gate.test.ts` (Task 2) and its use in `useReport` (Task 3).
2. **Zero or null data:** `total = 0`, null TAT segments, rows with a null `province`, an empty array. → `format.test.ts`, `series.test.ts` (Task 2), plus each card's `actions.test.ts` (Tasks 4–7).
3. **Non-admin at US level:** clicking a facility bar must not call the patients API, and choosing "Unidade Sanitária" in the filter shows the restricted-access message inline. → `drill.test.ts` and `api.test.ts` (Task 2).
4. **Expired or missing token, network down, 5xx:** show a Portuguese message and the retry button; never crash or show raw server text. → `api.test.ts` (Task 2).
5. **Name mismatches:** accented or variant province names (`Zambézia`, `Maputo Província`, extra spaces) must still find their map region, and a date window spanning more than 12 months must not repeat labels. → `geo.test.ts` and `dates.test.ts` (Task 2).

## File Structure

```
apps/vl/
  package.json  next.config.ts  tsconfig.json  middleware.ts  Dockerfile  vitest.config.ts
  eslint.config.mjs  postcss.config.mjs  tailwind.config.ts  theme.config.ts  components.json
  .gitignore  .env.example  README.md
  app/
    layout.tsx  globals.css  favicon.ico  types/mdx.d.ts
    (auth)/layout.tsx  (auth)/sign-in/{page,client}.tsx  (auth)/sign-up/{page,client}.tsx
    api/send-suggestion/route.ts
    (dashboard)/layout.tsx  (dashboard)/loading.tsx
    (dashboard)/(index)/page.tsx  (dashboard)/(index)/reports/<6 cards>/
    (dashboard)/lab/page.tsx      (dashboard)/lab/reports/<8 cards>/
    (dashboard)/clinic/page.tsx   (dashboard)/clinic/reports/<12 cards>/
    (dashboard)/patients/page.tsx (dashboard)/patients/reports/vl-patients-search/
  components/
    ui/*                      (copied from apps/tb)
    report-card.tsx           MainCard wrapper: options, skeleton, error, empty, export
    card-message.tsx          inline error / empty message with retry
    card-docs.tsx             standard documentation layout
    charts/combo-chart.tsx    bars + lines, dual axis, stack groups, sparkline
    charts/pie-chart.tsx
    lab-groups-dialog.tsx     16 legacy lab groups → lab_code
    age-range-dialog.tsx
    patients-table.tsx        VL patient columns
    patients-dialog.tsx       drill-down patient list + Excel
  config/api.ts  context/theme-provider.tsx  lib/utils.ts  themes/*  (copied)
  lib/vl/
    types.ts         API row types
    api.ts           vlGet + Portuguese error mapping
    request-gate.ts  latest-request-wins helper
    dates.ts         windows, interval param, PT month labels, PT long dates
    format.ts        pct, sum, mean, num
    age.ts           age-range parsing
    geo.ts           province name → map key
    labs.ts          16 legacy lab groups
    series.ts        CV / TAT / gender series + chart → sheet
    drill.ts         facility drill-down state machine
    patients.ts      patient params, fetch, row formatting
    admin-probe.ts   probe status → role
    nav.ts           nav items
    combo-options.ts ApexOptions builder for ComboChart
    export/chart-id.ts  export/excel.ts  export/image.ts
    admin.tsx        AdminProvider / useAdminStatus / useIsAdmin
  hooks/
    useLayoutSettings.ts     (copied)
    use-report.ts            useReport / useRangeReport / useLabReport (client)
    use-facility-report.ts   useFacilityReport: range + drill-down + patient dialog (client)
packages/design_system_mui/src/templates/DashboardLayout.tsx   (P1: optional portalTitle)
pnpm-lock.yaml                                                 (new workspace package)
```

Card folders (slug = folder name):
- **Sumário:**
  - `overview-status-cards`
  - `vl-suppression-trend`
  - `vl-suppression-map`
  - `vl-tat-national`
  - `vl-tat-vs-disalinks`
  - `vl-indicators-summary`
- **Lab:**
  - `vl-weekly-report-by-lab`
  - `vl-weekly-report-national`
  - `vl-tested-by-lab`
  - `vl-tested-by-month`
  - `vl-tat-by-lab`
  - `vl-tat-by-month`
  - `vl-rejected-by-lab`
  - `vl-rejected-by-month`
- **Clinic:**
  - `vl-registered-by-facility`
  - `vl-tested-by-facility`
  - `vl-tested-by-gender-by-facility`
  - `vl-tested-by-gender-by-month`
  - `vl-tat-by-facility-month`
  - `vl-tat-by-facility`
  - `vl-tested-by-age`
  - `vl-tested-pregnant`
  - `vl-tested-breastfeeding`
  - `vl-test-reasons`
  - `vl-rejected-by-facility-month`
  - `vl-rejected-by-facility`

## Before you start

- Work in `openldr-monorepo`.
- The API must have piece 1 deployed. Point `NEXT_PUBLIC_OPENLDR_API` at `https://dev.openldr.org.mz` once PR #6 is merged, or at a local `api_openldr_python` on `feat/vl-api-parity`. Unit tests do not need the API.
- Local env: `cp apps/tb/.env.local apps/vl/.env.local`. The file is gitignored. Never print or commit it.

---
### Task 1: App shell, test runner, admin probe and nav

**Files:**
- Create: everything under `apps/vl/` listed in the shell part of File Structure (copied from `apps/tb`, then edited as below), plus `apps/vl/vitest.config.ts`, `apps/vl/.env.example`, `apps/vl/README.md`, `apps/vl/lib/vl/admin-probe.ts`, `apps/vl/lib/vl/nav.ts`, `apps/vl/lib/vl/admin.tsx`, and placeholder pages `apps/vl/app/(dashboard)/{(index),lab,clinic,patients}/page.tsx`.
- Modify: `packages/design_system_mui/src/templates/DashboardLayout.tsx` (P1), `pnpm-lock.yaml`.
- Test: `apps/vl/lib/vl/admin-probe.test.ts`, `apps/vl/lib/vl/nav.test.ts`.

**Interfaces:**
- Produces:
  - `interpretProbe(status: number | null): "admin" | "user"`
  - `PAGE_LABELS: Record<string, string>`
  - `buildNavItems(pathname: string, isAdmin: boolean): NavItem[]`, where `NavItem = { label: string; href: string; icon: "grid" | "lab" | "location" | "patients"; active: boolean }`
  - `AdminProvider`, `useAdminStatus(): "unknown" | "admin" | "user"` and `useIsAdmin(): boolean` from `@/lib/vl/admin`
  - the `@/*` → `apps/vl/*` path alias (tsconfig and Vitest)

- [ ] **Step 1: Create the feature branch**

```bash
cd openldr-monorepo
git fetch origin
git switch -c feat/vl-dashboard docs/vl-dashboard-migration-spec
git log --oneline origin/main..HEAD   # expect only the spec/plan doc commits
git log --oneline HEAD..origin/main   # expect nothing; if main moved, run: git merge origin/main
```

The spec branch is `main` (`b8585c1`) plus doc commits, so this carries the spec and this plan alongside the code.

- [ ] **Step 2: Copy the TB shell (tracked files only, without TB reports or TB-only components)**

```bash
cd apps/tb
git ls-files \
  | grep -v -E '^app/\(dashboard\)/(\(index\)|lab|clinic|patients)/' \
  | grep -v -E '^(CLAUDE\.md|README\.md|app/client\.tsx)$' \
  | grep -v -E '^components/(patients-|settings-wrapper|sign-in-form|sign-up-form)' \
  | while read -r f; do mkdir -p "../vl/$(dirname "$f")"; cp "$f" "../vl/$f"; done
cd ../vl && git status --short . | head -50
```

Expected: `app/(dashboard)/layout.tsx`, `app/(dashboard)/loading.tsx`, `(auth)/*`, `api/send-suggestion/route.ts`, `components/ui/*`, `config/api.ts`, `context/`, `hooks/`, `lib/utils.ts`, `themes/*`, `public/*` and the config files are present. No report folders.

- [ ] **Step 3: Edit `apps/vl/package.json`**

- Set `"name": "vl"`.
- Add `"test": "vitest run"` to `scripts`.
- Add `"react-apexcharts": "^1.7.0"` to `dependencies`.
- Add `"vitest": "^3.2.4"` to `devDependencies`.
- Remove `"@repo/ai": "workspace:*"` (no AI chat).
- Leave everything else as copied.

- [ ] **Step 4: Edit `apps/vl/tsconfig.json`**

Change `"@/*": ["./src/*"]` to `"@/*": ["./*"]`. Remove the two `@repo/ai` path entries. Keep everything else.

- [ ] **Step 5: Create `apps/vl/vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
```

- [ ] **Step 6: Replace TB strings in the copied shell**

| File | Change |
|---|---|
| `app/layout.tsx` | `title: "Portal de Carga Viral"`, `description: "Portal de Carga Viral (HIV)"`, `lang="pt"` |
| `app/(auth)/sign-in/client.tsx` and `app/(auth)/sign-up/client.tsx` | In the `dashboards` array, move the `"Portal de Carga Viral"` entry first and set its `active: true`; set the TB entry to `active: false`. |
| `app/api/send-suggestion/route.ts` | `Dashboard de TB` → `Dashboard de Carga Viral` (both `from` and `subject`) |
| `Dockerfile` | `--filter=tb` → `--filter=vl` (the build and `CMD` lines) |

Then run:

```bash
grep -rn -i "tuberculose\|Portal de TB\|Dashboard de TB\|filter=tb\|@repo/ai" apps/vl --include=*.ts --include=*.tsx --include=Dockerfile --include=*.json
```

Expected: no output.

- [ ] **Step 7: Make `portalTitle` configurable in the shared layout (P1)**

In `packages/design_system_mui/src/templates/DashboardLayout.tsx`:
- Add `portalTitle?: string` to `DashboardLayoutProps` (after `aiChatIsOpen?: boolean`).
- Add `portalTitle = "Portal de Testagem Laboratorial de TB"` to the destructured parameters.
- Replace the literal text `Portal de Testagem Laboratorial de TB` with `{portalTitle}` on the stacked-layout line (around line 175).
- Replace `Portal de Testagem Laboratorial de TB - {pagename}` with `{portalTitle} - {pagename}` (around line 240).

```bash
git diff --stat packages/
```

Expected: 1 file changed. TB passes no `portalTitle`, so it renders exactly the same text.

- [ ] **Step 8: Write the failing tests for probe and nav**

`apps/vl/lib/vl/admin-probe.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { interpretProbe } from "./admin-probe";

describe("interpretProbe", () => {
  it("treats 403 as a regular user", () => {
    expect(interpretProbe(403)).toBe("user");
  });
  it("treats 400 and 200 as admin (role checked before validation)", () => {
    expect(interpretProbe(400)).toBe("admin");
    expect(interpretProbe(200)).toBe("admin");
  });
  it("treats 401, 500 and network failure as a regular user", () => {
    expect(interpretProbe(401)).toBe("user");
    expect(interpretProbe(500)).toBe("user");
    expect(interpretProbe(null)).toBe("user");
  });
});
```

`apps/vl/lib/vl/nav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS } from "./nav";

describe("buildNavItems", () => {
  it("hides Pacientes for non-admins", () => {
    expect(buildNavItems("/", false).map((i) => i.href)).toEqual(["/", "/lab", "/clinic"]);
  });
  it("shows Pacientes for admins", () => {
    expect(buildNavItems("/", true).map((i) => i.href)).toEqual(["/", "/lab", "/clinic", "/patients"]);
  });
  it("marks only the current page active", () => {
    const items = buildNavItems("/lab", true);
    expect(items.filter((i) => i.active).map((i) => i.href)).toEqual(["/lab"]);
  });
  it("labels every page in Portuguese", () => {
    expect(PAGE_LABELS["/clinic"]).toBe("Província/Distrito/US");
    expect(PAGE_LABELS["/patients"]).toBe("Pacientes");
  });
});
```

- [ ] **Step 9: Install and run the tests to see them fail**

```bash
pnpm install
pnpm --filter=vl test
```

Expected: FAIL. The cause is `Failed to resolve import "./admin-probe"` (and `"./nav"`).

- [ ] **Step 10: Implement `admin-probe.ts` and `nav.ts`**

`apps/vl/lib/vl/admin-probe.ts`:

```ts
export type AdminStatus = "unknown" | "admin" | "user";

/** Path probed to learn the role: Admin-only, and the API checks the role before validating params. */
export const ADMIN_PROBE_PATH = "/hiv/vl/patients/by_facility/";

export function interpretProbe(status: number | null): "admin" | "user" {
  if (status === 200 || status === 400) return "admin";
  return "user";
}
```

`apps/vl/lib/vl/nav.ts`:

```ts
export type NavItem = {
  label: string;
  href: string;
  icon: "grid" | "lab" | "location" | "patients";
  active: boolean;
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Sumário",
  "/lab": "Laboratório",
  "/clinic": "Província/Distrito/US",
  "/patients": "Pacientes",
};

const ITEMS: Omit<NavItem, "active">[] = [
  { label: "Sumário", href: "/", icon: "grid" },
  { label: "Laboratório", href: "/lab", icon: "lab" },
  { label: "Província/Distrito/US", href: "/clinic", icon: "location" },
  { label: "Pacientes", href: "/patients", icon: "patients" },
];

export function buildNavItems(pathname: string, isAdmin: boolean): NavItem[] {
  return ITEMS.filter((item) => isAdmin || item.href !== "/patients").map((item) => ({
    ...item,
    active: item.href === pathname,
  }));
}
```

- [ ] **Step 11: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS, 2 files, 7 tests.

- [ ] **Step 12: Create `apps/vl/lib/vl/admin.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/config/api";
import { ADMIN_PROBE_PATH, interpretProbe, type AdminStatus } from "./admin-probe";

const AdminContext = createContext<AdminStatus>("unknown");

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<AdminStatus>("unknown");

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await api(token ?? "").get(ADMIN_PROBE_PATH, {
          params: { per_page: 1 },
          validateStatus: () => true,
        });
        if (!cancelled) setStatus(interpretProbe(res.status));
      } catch {
        if (!cancelled) setStatus(interpretProbe(null));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  return <AdminContext.Provider value={status}>{children}</AdminContext.Provider>;
}

export const useAdminStatus = (): AdminStatus => useContext(AdminContext);
export const useIsAdmin = (): boolean => useContext(AdminContext) === "admin";
```

- [ ] **Step 13: Rewrite `apps/vl/app/(dashboard)/layout.tsx`**

Start from the copied TB file:
- Remove `AIChatProvider`.
- Wrap the page in `AdminProvider`.
- Build the nav from `buildNavItems`.
- Pass `portalTitle` and `aiChatIsOpen={false}`.

```tsx
"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@repo/design_system/app/templates/DashboardLayout"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLab } from "@repo/design_system/app/atoms/icons/Lab"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { SettingsProps } from "@repo/design_system/app/molecules/headers/SettingsDrawer"
import { AppProvider } from "@repo/design_system/contexts"
import { useUser, useAuth } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useLayoutSettings } from "../../hooks/useLayoutSettings"
import { darkMode } from "../../themes/dark"
import { lightMode } from "../../themes/light"
import { AdminProvider, useIsAdmin } from "@/lib/vl/admin"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/vl/nav"

const SMALL_SCREEN_BREAKPOINT = 1280;

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  lab: <IconlyLab style="two-tone" size={19} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { settings, setSettings } = useLayoutSettings();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < SMALL_SCREEN_BREAKPOINT && settings.compact !== "large") {
        setSettings({ ...settings, compact: "large" });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [settings, setSettings]);

  const options = buildNavItems(pathname, isAdmin).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  const handleSetAppSettings = (next: SettingsProps) => {
    setTheme(next.mode);
    setSettings(next);
  };

  if (!mounted) return null;

  return (
    <AppProvider lightTheme={lightMode} darkTheme={darkMode} themeMode={settings?.mode}>
      <DashboardLayout
        portalTitle="Portal de Carga Viral"
        aiChatIsOpen={false}
        pagename={PAGE_LABELS[pathname]}
        options={options}
        user={{
          name: user?.fullName || "",
          avatar: user?.imageUrl || "",
          email: user?.emailAddresses[0]?.emailAddress || "",
          signOut: () => signOut(),
        }}
        settings={settings}
        handleSetAppSettings={handleSetAppSettings}
      >
        {children}
      </DashboardLayout>
    </AppProvider>
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

- [ ] **Step 14: Add placeholder pages so the routes build**

Create these four files. Later tasks replace them.

`apps/vl/app/(dashboard)/(index)/page.tsx`:

```tsx
"use client";
export default function SummaryPage() {
  return <div className="w-full" />;
}
```

`apps/vl/app/(dashboard)/lab/page.tsx`:

```tsx
"use client";
export default function LabPage() {
  return <div className="w-full" />;
}
```

`apps/vl/app/(dashboard)/clinic/page.tsx`:

```tsx
"use client";
export default function ClinicPage() {
  return <div className="w-full" />;
}
```

`apps/vl/app/(dashboard)/patients/page.tsx`:

```tsx
"use client";
export default function PatientsPage() {
  return <div className="w-full" />;
}
```

- [ ] **Step 15: Add `apps/vl/.env.example` and `apps/vl/README.md`**

`.env.example` (keys only, no values):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_OPENLDR_API=
RESEND_API_KEY=
SUGGESTION_EMAILS=
DASHBOARD_EMAIL=
```

`README.md`:

````markdown
# Portal de Carga Viral (`apps/vl`)

HIV Viral Load dashboard, replacing cargaviral.openldr.org.mz. All data comes from
`api_openldr_python` (`/hiv/vl/*`). Spec: `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md`.

```bash
cp .env.example .env.local   # fill in values; NEXT_PUBLIC_OPENLDR_API must serve the piece-1 VL endpoints
pnpm --filter=vl dev
pnpm --filter=vl test        # Vitest, node environment: lib/vl and card actions only
```

Pages: Sumário `/`, Laboratório `/lab`, Província/Distrito/US `/clinic`, Pacientes `/patients` (Admin).
Admin status is probed from the API (`lib/vl/admin.tsx`), never taken from Clerk metadata.
Each card lives in `app/(dashboard)/<page>/reports/<slug>/` with `index.tsx`, `actions.ts`,
`constants.ts`, `docs.tsx` and `actions.test.ts`. Shared logic is in `lib/vl/`.
````

- [ ] **Step 16: Verify the shell builds and TB is unaffected**

```bash
pnpm --filter=vl test
pnpm --filter=vl exec tsc --noEmit
pnpm --filter=vl lint
pnpm turbo run build --filter=vl
pnpm turbo run build --filter=tb
```

Expected: all pass.

Then run `pnpm --filter=vl dev` and open http://localhost:3000. Check:
- You are redirected to `/sign-in`, which shows "Portal de Carga Viral" first.
- After signing in, the header reads "Portal de Carga Viral - Sumário".
- The nav shows Sumário, Laboratório and Província/Distrito/US, plus Pacientes for an Admin user.

- [ ] **Step 17: Commit**

```bash
git add apps/vl packages/design_system_mui/src/templates/DashboardLayout.tsx pnpm-lock.yaml
git commit -m "feat(vl): add apps/vl shell copied from apps/tb with admin probe and VL nav"
```

---

### Task 2: `lib/vl` core (types, API client, dates, series, drill-down, patients, Excel)

All files in this task are plain TypeScript with no React, so Vitest runs them in node.

**Files:**
- Create in `apps/vl/lib/vl/`:
  - `types.ts`, `api.ts`, `request-gate.ts`, `dates.ts`, `format.ts`, `age.ts`, `geo.ts`, `labs.ts`, `series.ts`, `drill.ts`, `patients.ts`
  - `export/chart-id.ts`, `export/excel.ts`
- Test in `apps/vl/lib/vl/`: `api.test.ts`, `request-gate.test.ts`, `dates.test.ts`, `format.test.ts`, `age.test.ts`, `geo.test.ts`, `labs.test.ts`, `series.test.ts`, `drill.test.ts`, `patients.test.ts`, `export/excel.test.ts`

**Interfaces:**
- Consumes: `api(token: string)` from `@/config/api` (axios instance with `baseURL = NEXT_PUBLIC_OPENLDR_API`).
- Produces: every exported name in the code below. Later tasks import them exactly as written. The key ones:

| Area | Exports |
|---|---|
| API | `vlGet<T>(path, params, token)`, `ApiError`, `errorMessage(status, serverMessage?)`, `cleanParams`, `type Params` |
| Requests | `createRequestGate()` |
| Dates | `type DateRange`, `lastYear`, `lastTwelveWeeks`, `legacyWeek`, `intervalParam`, `monthLabel`, `formatDatePt`, `formatRangePt`, `toIsoDate` |
| Numbers | `num`, `sum`, `mean`, `pct` |
| Age | `type AgeRange`, `DEFAULT_AGE_RANGE`, `parseAgeRange`, `ageRangeParam` |
| Geography and labs | `provinceKey`, `normalizeName`, `type ProvinceKey`, `LAB_GROUPS`, `labCodes` |
| Series | `type Series`, `type ChartModel`, `TAT_SEGMENTS`, `tatSeries`, `cvSeries`, `genderSeries`, `singleSeries`, `chartToSheet` |
| Drill-down | `type FacilityLevel`, `type DrillState`, `INITIAL_DRILL`, `rowLevel`, `drillClick`, `drillParams`, `fromFilter`, `drillSubtitle`, `LEVEL_LABEL` |
| Patients | `type PatientFilters`, `type PatientRow`, `type PatientsPage`, `type PatientEndpoint`, `type ResultType`, `type TestReason`, `MAX_PER_PAGE`, `patientFilterParams`, `fetchPatients`, `PATIENT_HEADERS`, `patientToRow`, `formatDateTimePt`, `RESULT_TYPE_LABEL`, `TEST_REASON_LABEL` |
| Export | `chartDomId`, `type Cell`, `type ExcelSheet`, `safeFileName`, `sheetName`, `sheetToAoa`, `exportSheet` |

- [ ] **Step 1: Write the failing tests**

`apps/vl/lib/vl/api.test.ts`:

```ts
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/config/api", () => ({ api: () => ({ get }) }));

import { ApiError, cleanParams, errorMessage, vlGet } from "./api";

const axiosError = (status: number | null, data?: unknown) =>
  new AxiosError("boom", "ERR", undefined, undefined, status === null ? undefined : ({ status, data } as any));

describe("errorMessage", () => {
  it("maps statuses to Portuguese messages and never echoes 5xx text", () => {
    expect(errorMessage(401)).toMatch(/sessão expirou/);
    expect(errorMessage(403)).toMatch(/Acesso restrito/);
    expect(errorMessage(400, "start date after end date")).toBe("start date after end date");
    expect(errorMessage(400)).toBe("Parâmetros inválidos.");
    expect(errorMessage(null)).toMatch(/Não foi possível contactar o servidor/);
    expect(errorMessage(500, "SQL boom")).toBe("Ocorreu um erro no servidor. Tente novamente.");
  });
});

describe("cleanParams", () => {
  it("drops undefined, empty strings and empty arrays", () => {
    expect(cleanParams({ a: undefined, b: "", c: [], d: "x", e: ["p"], f: 0 })).toEqual({ d: "x", e: ["p"], f: 0 });
  });
});

describe("vlGet", () => {
  beforeEach(() => get.mockReset());

  it("prefixes /hiv/vl, cleans params and serialises arrays without indexes", async () => {
    get.mockResolvedValue({ data: [{ total: 1 }] });
    const data = await vlGet("/summary/tat_by_month/", { interval_dates: "2025-01-01,2025-12-31", lab_code: [] }, "tok");
    expect(data).toEqual([{ total: 1 }]);
    expect(get).toHaveBeenCalledWith("/hiv/vl/summary/tat_by_month/", {
      params: { interval_dates: "2025-01-01,2025-12-31" },
      paramsSerializer: { indexes: null },
    });
  });

  it("turns a 403 into ApiError with the restricted-access message", async () => {
    get.mockRejectedValue(axiosError(403, { status: "error", code: 403, message: "Forbidden - User ..." }));
    await expect(vlGet("/facilities/registered_samples/", {}, "tok")).rejects.toMatchObject({
      status: 403,
      message: expect.stringMatching(/Acesso restrito/),
    });
  });

  it("turns an expired token (401) and a network failure into Portuguese messages", async () => {
    get.mockRejectedValueOnce(axiosError(401, { message: "Invalid or missing token" }));
    await expect(vlGet("/x/", {}, null)).rejects.toMatchObject({ status: 401, message: expect.stringMatching(/sessão expirou/) });
    get.mockRejectedValueOnce(axiosError(null));
    await expect(vlGet("/x/", {}, null)).rejects.toMatchObject({ status: null });
  });

  it("wraps non-axios errors as a generic server error", async () => {
    get.mockRejectedValue(new TypeError("x is undefined"));
    const err = await vlGet("/x/", {}, "t").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Ocorreu um erro no servidor. Tente novamente.");
  });
});
```

`apps/vl/lib/vl/request-gate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRequestGate } from "./request-gate";

describe("createRequestGate", () => {
  it("only the most recent request is current", () => {
    const gate = createRequestGate();
    const first = gate.next();
    const second = gate.next();
    expect(gate.isCurrent(first)).toBe(false);
    expect(gate.isCurrent(second)).toBe(true);
  });
});
```

`apps/vl/lib/vl/dates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatDatePt, formatRangePt, intervalParam, lastTwelveWeeks, lastYear, legacyWeek, monthLabel } from "./dates";

const d = (s: string) => {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
};

describe("windows", () => {
  it("lastYear is the same day one year earlier", () => {
    expect(lastYear(d("2026-10-13"))).toEqual({ start: "2025-10-13", end: "2026-10-13" });
  });
  it("lastYear on 29 February falls back to 28 February", () => {
    expect(lastYear(d("2028-02-29"))).toEqual({ start: "2027-02-28", end: "2028-02-29" });
  });
  it("lastTwelveWeeks is 84 days", () => {
    expect(lastTwelveWeeks(d("2026-10-13"))).toEqual({ start: "2026-07-21", end: "2026-10-13" });
  });
  it("legacyWeek is Sunday→Saturday of the week containing today − 6 days", () => {
    // Tuesday 13 Oct 2026 → 7 Oct (Wed) → week of Sun 4 Oct to Sat 10 Oct
    expect(legacyWeek(d("2026-10-13"))).toEqual({ start: "2026-10-04", end: "2026-10-10" });
    // Saturday 17 Oct 2026 → 11 Oct (Sun) → that same week
    expect(legacyWeek(d("2026-10-17"))).toEqual({ start: "2026-10-11", end: "2026-10-17" });
  });
  it("intervalParam joins with a comma", () => {
    expect(intervalParam({ start: "2025-01-01", end: "2025-12-31" })).toBe("2025-01-01,2025-12-31");
  });
});

describe("labels", () => {
  it("monthLabel uses Portuguese abbreviations and a 2-digit year so 13-month windows never repeat", () => {
    expect(monthLabel(2025, 10)).toBe("Out/25");
    expect(monthLabel(2026, 10)).toBe("Out/26");
    expect(monthLabel(2026, 2)).toBe("Fev/26");
  });
  it("formatDatePt and formatRangePt avoid timezone shifts", () => {
    expect(formatDatePt("2026-01-01")).toBe("01 de janeiro de 2026");
    expect(formatRangePt({ start: "2025-10-13", end: "2026-10-13" })).toBe("13 de outubro de 2025 à 13 de outubro de 2026");
  });
});
```

`apps/vl/lib/vl/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mean, num, pct, sum } from "./format";

describe("format", () => {
  it("pct rounds and guards zero or missing totals", () => {
    expect(pct(2, 3)).toBe(67);
    expect(pct(5, 0)).toBe(0);
    expect(pct(null, null)).toBe(0);
  });
  it("num, sum and mean treat null as 0 and empty lists as 0", () => {
    expect(num(null)).toBe(0);
    expect(num(Number.NaN)).toBe(0);
    expect(sum([1, null, 2])).toBe(3);
    expect(mean([])).toBe(0);
    expect(mean([1, 2])).toBe(1.5);
  });
});
```

`apps/vl/lib/vl/age.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ageRangeParam, DEFAULT_AGE_RANGE, parseAgeRange } from "./age";

describe("age range", () => {
  it("defaults to 15-49", () => {
    expect(DEFAULT_AGE_RANGE).toEqual([15, 49]);
    expect(ageRangeParam(DEFAULT_AGE_RANGE)).toBe("15,49");
  });
  it("accepts valid integer ranges", () => {
    expect(parseAgeRange(" 0 ", "14")).toEqual([0, 14]);
  });
  it("rejects blanks, decimals, negatives, inverted ranges and >120", () => {
    expect(parseAgeRange("", "49")).toBe("Indique idades inteiras.");
    expect(parseAgeRange("1.5", "49")).toBe("Indique idades inteiras.");
    expect(parseAgeRange("-1", "49")).toBe("As idades devem estar entre 0 e 120.");
    expect(parseAgeRange("10", "130")).toBe("As idades devem estar entre 0 e 120.");
    expect(parseAgeRange("50", "49")).toBe("A idade inicial não pode ser maior que a final.");
  });
});
```

`apps/vl/lib/vl/geo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { provinceKey } from "./geo";

describe("provinceKey", () => {
  it("maps API province names to InteractiveSvgMap keys", () => {
    expect(provinceKey("Maputo Cidade")).toBe("mc");
    expect(provinceKey("Maputo Provincia")).toBe("mp");
    expect(provinceKey("Cabo Delgado")).toBe("cd");
  });
  it("ignores accents, case and extra spaces", () => {
    expect(provinceKey("Zambézia")).toBe("zb");
    expect(provinceKey("  maputo   província ")).toBe("mp");
  });
  it("returns undefined for null and unknown names", () => {
    expect(provinceKey(null)).toBeUndefined();
    expect(provinceKey("null")).toBeUndefined();
    expect(provinceKey("Lisboa")).toBeUndefined();
  });
});
```

`apps/vl/lib/vl/labs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LAB_GROUPS, labCodes } from "./labs";

describe("lab groups", () => {
  it("has the 16 legacy groups", () => {
    expect(LAB_GROUPS).toHaveLength(16);
  });
  it("flattens selected group names into lab codes", () => {
    expect(labCodes(["Jose Macamo", "INS"])).toEqual(["PJC", "PJV", "PMB"]);
  });
  it("ignores unknown names and returns [] for no selection", () => {
    expect(labCodes(["Nope"])).toEqual([]);
    expect(labCodes([])).toEqual([]);
  });
});
```

`apps/vl/lib/vl/series.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { chartToSheet, cvSeries, genderSeries, singleSeries, tatSeries } from "./series";

describe("series", () => {
  it("tatSeries keeps the 4 segments in legacy order and turns null into 0", () => {
    const s = tatSeries([
      { collection_reception: 3, reception_registration: null, registration_analysis: 5, analysis_validation: 1 },
    ]);
    expect(s.map((x) => x.name)).toEqual([
      "Colheita à Recepção",
      "Recepção ao Registo",
      "Registo à Análise",
      "Análise à Validação",
    ]);
    expect(s.map((x) => x.data[0])).toEqual([3, 0, 5, 1]);
  });
  it("cvSeries puts CV > 1000 first, CV < 1000 second", () => {
    const s = cvSeries([{ suppressed: 8, not_suppressed: 2 }]);
    expect(s.map((x) => [x.name, x.data[0], x.color])).toEqual([
      ["CV > 1000", 2, "#fb8c00"],
      ["CV < 1000", 8, "#ef5350"],
    ]);
  });
  it("genderSeries stacks men and women separately", () => {
    const s = genderSeries([{ male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 }]);
    expect(s.map((x) => [x.name, x.group, x.data[0]])).toEqual([
      ["Homens (CV < 1000)", "Homens", 1],
      ["Homens (CV > 1000)", "Homens", 2],
      ["Mulheres (CV < 1000)", "Mulheres", 3],
      ["Mulheres (CV > 1000)", "Mulheres", 4],
    ]);
  });
  it("chartToSheet writes one row per series under a label header", () => {
    const sheet = chartToSheet({ labels: ["A", "B"], series: singleSeries("Total", "#000", [1, 2]) }, "Província");
    expect(sheet).toEqual({ header: ["Província", "A", "B"], rows: [["Total", 1, 2]] });
  });
});
```

`apps/vl/lib/vl/drill.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { drillClick, drillParams, drillSubtitle, fromFilter, INITIAL_DRILL, rowLevel } from "./drill";

describe("drill-down", () => {
  it("starts at province rows with no filter", () => {
    expect(rowLevel(INITIAL_DRILL)).toBe("province");
    expect(drillParams(INITIAL_DRILL)).toEqual({ facility_type: "province", disaggregation: "false" });
  });

  it("province click → district rows; district click → facility rows", () => {
    const a = drillClick(INITIAL_DRILL, "Gaza", false);
    expect(a.kind).toBe("drill");
    if (a.kind !== "drill") return;
    expect(drillParams(a.next)).toEqual({ facility_type: "province", disaggregation: "true", province: ["Gaza"] });
    expect(rowLevel(a.next)).toBe("district");

    const b = drillClick(a.next, "Chokwe", false);
    if (b.kind !== "drill") throw new Error("expected drill");
    expect(drillParams(b.next)).toEqual({ facility_type: "district", disaggregation: "true", district: ["Chokwe"] });
    expect(rowLevel(b.next)).toBe("health_facility");
    expect(b.next.trail).toEqual(["Gaza", "Chokwe"]);
  });

  it("facility click opens patients for admins, with the parent district", () => {
    const atFacilities = { filterType: "district" as const, names: ["Chokwe"], disaggregation: true, trail: ["Gaza", "Chokwe"] };
    expect(drillClick(atFacilities, "CS Chokwe", true)).toEqual({ kind: "patients", facility: "CS Chokwe", district: "Chokwe" });
  });

  it("facility click does nothing for non-admins (no patient request)", () => {
    const atFacilities = { filterType: "district" as const, names: ["Chokwe"], disaggregation: true, trail: [] };
    expect(drillClick(atFacilities, "CS Chokwe", false)).toEqual({ kind: "none" });
  });

  it("empty label does nothing", () => {
    expect(drillClick(INITIAL_DRILL, "", true)).toEqual({ kind: "none" });
  });

  it("maps FacilitiesPopup selections: province by value, district and clinic by label, clinic → health_facility", () => {
    expect(fromFilter([{ value: "Gaza", label: "Gaza" }], "province").names).toEqual(["Gaza"]);
    expect(fromFilter([{ value: "D12", label: "Chokwe" }], "district").names).toEqual(["Chokwe"]);
    const clinic = fromFilter([{ value: "1100", label: "CS Chokwe" }, { value: "1101", label: "CS B" }], "clinic");
    expect(clinic.filterType).toBe("health_facility");
    expect(drillParams(clinic)).toEqual({ facility_type: "health_facility", disaggregation: "false", health_facility: "CS Chokwe" });
  });

  it("subtitle shows the range, then the filter or the breadcrumb", () => {
    const range = { start: "2025-10-13", end: "2026-10-13" };
    expect(drillSubtitle(range, INITIAL_DRILL)).toBe("13 de outubro de 2025 à 13 de outubro de 2026");
    expect(drillSubtitle(range, fromFilter([{ value: "Gaza", label: "Gaza" }], "province"))).toBe(
      "13 de outubro de 2025 à 13 de outubro de 2026 | Província: Gaza",
    );
    expect(drillSubtitle(range, { filterType: "district", names: ["Chokwe"], disaggregation: true, trail: ["Gaza", "Chokwe"] })).toBe(
      "13 de outubro de 2025 à 13 de outubro de 2026 | Gaza → Chokwe",
    );
  });
});
```

`apps/vl/lib/vl/patients.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/config/api", () => ({ api: () => ({ get }) }));

import { fetchPatients, formatDateTimePt, PATIENT_HEADERS, patientFilterParams, patientToRow, type PatientRow } from "./patients";

describe("patientFilterParams", () => {
  it("serialises every drill-down filter with bound-parameter values", () => {
    expect(
      patientFilterParams({
        date_basis: "analysis",
        result_type: ["suppressed", "not_suppressed"],
        pregnant: true,
        breastfeeding: false,
        rejected: true,
        age_range: [15, 49],
        test_reason: ["Routine"],
      }),
    ).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
      pregnant: "true",
      rejected: "true",
      age_range: "15,49",
      test_reason: ["Routine"],
    });
  });
  it("returns {} for no filters", () => {
    expect(patientFilterParams({})).toEqual({});
  });
});

describe("fetchPatients", () => {
  beforeEach(() => get.mockReset());
  it("calls /hiv/vl/patients/<endpoint>/ and caps per_page at 500", async () => {
    get.mockResolvedValue({ data: { status: "success", page: 1, per_page: 500, total_count: 0, total_pages: 0, data: [] } });
    await fetchPatients("by_facility", { health_facility: "CS X" }, 1, 9999, "tok");
    expect(get).toHaveBeenCalledWith("/hiv/vl/patients/by_facility/", {
      params: { health_facility: "CS X", page: 1, per_page: 500 },
      paramsSerializer: { indexes: null },
    });
  });
});

describe("patient rows", () => {
  const row: PatientRow = {
    request_id: "MZ1",
    first_name: "Ana",
    last_name: "Silva",
    nid: "0101/123",
    age_in_years: 34,
    sex_code: "F",
    phone: "841234567",
    province: "Gaza",
    district: "Chokwe",
    health_facility: "CS Chokwe",
    specimen_datetime: "2026-03-04T10:22:00",
    registered_datetime: "2026-03-05T08:00:00",
    analysis_datetime: null,
    authorised_datetime: null,
    final_result: "<20",
    viral_load_result_category: "Suppressed",
    reason_for_test: "Suspected treatment failure",
  };

  it("formats a patient in the legacy Excel column order", () => {
    expect(PATIENT_HEADERS).toHaveLength(16);
    expect(patientToRow(row)).toEqual([
      "Ana", "Silva", "0101/123", 34, "F", "841234567", "Gaza", "Chokwe", "CS Chokwe",
      "04/03/2026", "05/03/2026", "", "", "<20", "CV Suprimida", "Suspeita de falha terapêutica",
    ]);
  });
  it("handles null and missing values", () => {
    expect(formatDateTimePt(null)).toBe("");
    const blank = patientToRow({ request_id: "MZ2" } as PatientRow);
    expect(blank).toHaveLength(16);
    expect(blank.every((c) => c === "" || c === null)).toBe(true);
  });
});
```

`apps/vl/lib/vl/export/excel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { safeFileName, sheetName, sheetToAoa } from "./excel";

describe("excel helpers", () => {
  it("builds title, subtitle, blank line, header and rows", () => {
    expect(sheetToAoa("Título", "Período", { header: ["", "Jan/26"], rows: [["Total", 3]] })).toEqual([
      ["Título"],
      ["Período"],
      [],
      ["", "Jan/26"],
      ["Total", 3],
    ]);
  });
  it("makes safe file and sheet names", () => {
    expect(safeFileName("Tempo de Resposta médio Nacional")).toBe("Tempo_de_Resposta_medio_Nacional");
    expect(sheetName("Amostras Testadas por Província/sexo [teste]: muito longo")).toBe("Amostras Testadas por Província");
    expect(sheetName("A/B")).toBe("AB");
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL with `Failed to resolve import` for each new module.

- [ ] **Step 3: Implement the modules**

`apps/vl/lib/vl/types.ts`:

```ts
/** Row shapes returned by api_openldr_python /hiv/vl/* (branch feat/vl-api-parity). */

export type MonthKey = { year: number; month: number; month_name: string };
export type CvCounts = { suppressed: number; not_suppressed: number };
export type GenderCounts = {
  male_suppressed: number;
  male_not_suppressed: number;
  female_suppressed: number;
  female_not_suppressed: number;
};
export type TatValues = {
  collection_reception: number | null;
  reception_registration: number | null;
  registration_analysis: number | null;
  analysis_validation: number | null;
};

// summary
export type SamplesByMonth = MonthKey & { total: number };
export type SuppressionByMonth = MonthKey & CvCounts & { total: number };
export type TatByMonth = MonthKey & TatValues;
export type SuppressionByProvince = CvCounts & {
  province: string | null;
  total: number;
  routine: number;
  treatment_failure: number;
  reason_not_specified: number;
};
export type IndicatorsByMonth = MonthKey & {
  registered: number;
  tested: number;
  suppressed: number;
  rejected: number;
  non_validated: number;
};
export type TatVsDisalinks = { semester: string; disalinks: number; tat: number };

// laboratories
export type WeeklyNationalRow = {
  week: string;
  start: string;
  end: string;
  backlogs: number;
  tests: number;
  registrations: number;
  rejections: number;
  capacity: number;
  tat: number | null;
};
export type WeeklyLabRow = WeeklyNationalRow & { lab_code: string; lab_name: string };
export type TestedByLab = CvCounts & { testing_facility: string; total: number };
export type TestedByMonth = MonthKey & CvCounts & { total: number };
export type TatByLab = TatValues & { testing_facility: string };
export type RejectedByLab = { lab_code: string; testing_facility: string; total: number };
export type RejectedByMonth = MonthKey & { total: number };

// facilities
export type FacilityRow = { requesting_facility: string };
export type RegisteredByFacility = FacilityRow & { total: number };
export type TestedByFacility = FacilityRow & CvCounts & { total: number };
export type GenderByFacility = FacilityRow & GenderCounts & { total: number };
export type GenderByMonth = MonthKey & GenderCounts & { total: number };
export type TatByFacility = FacilityRow & TatValues;
export type AgeByFacility = FacilityRow & CvCounts & { age_group: string; total: number };
export type TestReasonByFacility = FacilityRow & {
  routine: number;
  treatment_failure: number;
  reason_not_specified: number;
  total: number;
};
```

`apps/vl/lib/vl/api.ts`:

```ts
import axios from "axios";
import { api } from "@/config/api";

export type Params = Record<string, string | number | string[] | undefined>;

export const VL_BASE = "/hiv/vl";

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Portuguese message for an HTTP status. 5xx text from the server is never shown. */
export function errorMessage(status: number | null, serverMessage?: string): string {
  if (status === 401) return "A sua sessão expirou. Inicie sessão novamente.";
  if (status === 403) return "Acesso restrito a utilizadores com permissão de Administrador.";
  if (status === 400) return serverMessage || "Parâmetros inválidos.";
  if (status === null) return "Não foi possível contactar o servidor. Verifique a ligação e tente novamente.";
  return "Ocorreu um erro no servidor. Tente novamente.";
}

export function cleanParams(params: Params): Params {
  const out: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export async function vlGet<T>(path: string, params: Params, token: string | null): Promise<T> {
  try {
    const res = await api(token ?? "").get<T>(`${VL_BASE}${path}`, {
      params: cleanParams(params),
      paramsSerializer: { indexes: null },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      const message = (error.response?.data as { message?: unknown } | undefined)?.message;
      throw new ApiError(errorMessage(status, typeof message === "string" ? message : undefined), status);
    }
    throw new ApiError(errorMessage(500), 500);
  }
}
```

`apps/vl/lib/vl/request-gate.ts`:

```ts
/** Latest-request-wins: a response is applied only if no newer request started since. */
export function createRequestGate() {
  let latest = 0;
  return {
    next: () => ++latest,
    isCurrent: (id: number) => id === latest,
  };
}
```

`apps/vl/lib/vl/dates.ts`:

```ts
export type DateRange = { start: string; end: string };

const pad = (n: number) => String(n).padStart(2, "0");

export const toIsoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (d: Date, days: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Legacy "Últimos 12 meses": the same day one year ago → today (29 Feb → 28 Feb). */
export function lastYear(today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  if (start.getMonth() !== today.getMonth()) start.setDate(0);
  return { start: toIsoDate(start), end: toIsoDate(today) };
}

/** Legacy "Últimas 12 Semanas": today − 84 days → today. */
export function lastTwelveWeeks(today: Date = new Date()): DateRange {
  return { start: toIsoDate(addDays(today, -84)), end: toIsoDate(today) };
}

/** Legacy weekly-by-lab default: Sunday → Saturday of the week containing today − 6 days. */
export function legacyWeek(today: Date = new Date()): DateRange {
  const anchor = addDays(today, -6);
  const sunday = addDays(anchor, -anchor.getDay());
  return { start: toIsoDate(sunday), end: toIsoDate(addDays(sunday, 6)) };
}

export const intervalParam = (range: DateRange): string => `${range.start},${range.end}`;

export const PT_MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PT_MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const monthLabel = (year: number, month: number): string =>
  `${PT_MONTHS_SHORT[month - 1] ?? String(month)}/${String(year).slice(-2)}`;

/** "2026-01-01" → "01 de janeiro de 2026", parsed by hand to avoid timezone shifts. */
export function formatDatePt(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} de ${PT_MONTHS_LONG[Number(m) - 1]} de ${y}`;
}

export const formatRangePt = (range: DateRange): string => `${formatDatePt(range.start)} à ${formatDatePt(range.end)}`;
```

`apps/vl/lib/vl/format.ts`:

```ts
export const num = (value: number | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const sum = (values: (number | null | undefined)[]): number => values.reduce<number>((acc, v) => acc + num(v), 0);

export const mean = (values: (number | null | undefined)[]): number => (values.length ? sum(values) / values.length : 0);

/** round(part / total × 100), 0 when total is 0 or missing. */
export const pct = (part: number | null | undefined, total: number | null | undefined): number =>
  num(total) > 0 ? Math.round((num(part) / num(total)) * 100) : 0;
```

`apps/vl/lib/vl/age.ts`:

```ts
export type AgeRange = [number, number];

export const DEFAULT_AGE_RANGE: AgeRange = [15, 49];

export function parseAgeRange(min: string, max: string): AgeRange | string {
  const a = min.trim();
  const b = max.trim();
  if (a === "" || b === "" || !Number.isInteger(Number(a)) || !Number.isInteger(Number(b))) {
    return "Indique idades inteiras.";
  }
  const lo = Number(a);
  const hi = Number(b);
  if (lo < 0 || hi > 120) return "As idades devem estar entre 0 e 120.";
  if (lo > hi) return "A idade inicial não pode ser maior que a final.";
  return [lo, hi];
}

export const ageRangeParam = (range: AgeRange): string => `${range[0]},${range[1]}`;
```

`apps/vl/lib/vl/geo.ts`:

```ts
export type ProvinceKey = "mc" | "mp" | "gz" | "ib" | "mn" | "sf" | "tt" | "zb" | "np" | "ns" | "cd";

const KEYS: Record<string, ProvinceKey> = {
  "maputo cidade": "mc",
  "cidade de maputo": "mc",
  "maputo provincia": "mp",
  "provincia de maputo": "mp",
  gaza: "gz",
  inhambane: "ib",
  manica: "mn",
  sofala: "sf",
  tete: "tt",
  zambezia: "zb",
  nampula: "np",
  niassa: "ns",
  "cabo delgado": "cd",
};

export const normalizeName = (name: string): string =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export function provinceKey(name: string | null | undefined): ProvinceKey | undefined {
  if (!name) return undefined;
  return KEYS[normalizeName(name)];
}
```

`apps/vl/lib/vl/labs.ts`:

```ts
/** The 16 lab groups of the legacy VL lab filter (openldr-frontend FacilitiesSelect), verbatim. */
export const LAB_GROUPS: { name: string; codes: string[] }[] = [
  { name: "Carmelo", codes: ["PCA"] },
  { name: "Cabo Delgado", codes: ["PCD", "PDD"] },
  { name: "Chimoio", codes: ["PCV", "PCM"] },
  { name: "DREAM Beira", codes: ["PDB"] },
  { name: "DREAM Maputo", codes: ["PDM"] },
  { name: "Clinica da UEM", codes: ["PEM", "PBU"] },
  { name: "H Militar de Maputo", codes: ["PIC", "PIT", "PIV"] },
  { name: "Jose Macamo", codes: ["PJC", "PJV"] },
  { name: "INS", codes: ["PMB"] },
  { name: "HG Machava", codes: ["PMV", "PMC"] },
  { name: "HG Mavalane", codes: ["PMA", "PVM"] },
  { name: "Nampula", codes: ["PNC", "PNT"] },
  { name: "Ponta Gea", codes: ["PPG"] },
  { name: "Quelimane", codes: ["PQM", "PQA", "PQE"] },
  { name: "HP Tete", codes: ["PTV", "PTC"] },
  { name: "Xai-Xai", codes: ["PXM", "PXE", "PXA"] },
];

export const labCodes = (names: string[]): string[] =>
  LAB_GROUPS.filter((group) => names.includes(group.name)).flatMap((group) => group.codes);
```

`apps/vl/lib/vl/export/chart-id.ts`:

```ts
/** DOM/ApexCharts id of the chart inside a card; the card wrapper div uses the plain card id. */
export const chartDomId = (cardId: string): string => `${cardId}-chart`;
```

`apps/vl/lib/vl/export/excel.ts`:

```ts
import * as XLSX from "xlsx";
import { toIsoDate } from "../dates";

export type Cell = string | number | null;
export type ExcelSheet = { header: Cell[]; rows: Cell[][] };

export const safeFileName = (name: string): string =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** Excel sheet names: max 31 chars, none of []:*?/\ */
export const sheetName = (name: string): string => name.replace(/[[\]:*?/\\]/g, "").slice(0, 31);

export const sheetToAoa = (title: string, subtitle: string, sheet: ExcelSheet): Cell[][] => [
  [title],
  [subtitle],
  [],
  sheet.header,
  ...sheet.rows,
];

export function exportSheet(title: string, subtitle: string, sheet: ExcelSheet, today: Date = new Date()): void {
  const worksheet = XLSX.utils.aoa_to_sheet(sheetToAoa(title, subtitle, sheet));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName(title));
  XLSX.writeFile(workbook, `${safeFileName(title)}_${toIsoDate(today)}.xlsx`);
}
```

`apps/vl/lib/vl/series.ts`:

```ts
import type { ExcelSheet } from "./export/excel";
import { num } from "./format";
import type { CvCounts, GenderCounts, TatValues } from "./types";

export type Series = {
  name: string;
  data: number[];
  color: string;
  type?: "column" | "line";
  group?: string;
  yAxis?: 0 | 1;
};
export type ChartModel = { labels: string[]; series: Series[] };

export const TAT_SEGMENTS: { key: keyof TatValues; name: string; color: string }[] = [
  { key: "collection_reception", name: "Colheita à Recepção", color: "#fb8c00" },
  { key: "reception_registration", name: "Recepção ao Registo", color: "#ef5350" },
  { key: "registration_analysis", name: "Registo à Análise", color: "#6B53C6" },
  { key: "analysis_validation", name: "Análise à Validação", color: "#00b000" },
];

export const tatSeries = (rows: TatValues[]): Series[] =>
  TAT_SEGMENTS.map((segment) => ({
    name: segment.name,
    color: segment.color,
    data: rows.map((row) => num(row[segment.key])),
  }));

export const cvSeries = (rows: CvCounts[]): Series[] => [
  { name: "CV > 1000", color: "#fb8c00", data: rows.map((r) => num(r.not_suppressed)) },
  { name: "CV < 1000", color: "#ef5350", data: rows.map((r) => num(r.suppressed)) },
];

export const genderSeries = (rows: GenderCounts[]): Series[] => [
  { name: "Homens (CV < 1000)", group: "Homens", color: "#00b000", data: rows.map((r) => num(r.male_suppressed)) },
  { name: "Homens (CV > 1000)", group: "Homens", color: "rgba(0,176,0,0.4)", data: rows.map((r) => num(r.male_not_suppressed)) },
  { name: "Mulheres (CV < 1000)", group: "Mulheres", color: "#e74c3c", data: rows.map((r) => num(r.female_suppressed)) },
  { name: "Mulheres (CV > 1000)", group: "Mulheres", color: "rgba(231,76,60,0.4)", data: rows.map((r) => num(r.female_not_suppressed)) },
];

export const singleSeries = (name: string, color: string, values: (number | null)[]): Series[] => [
  { name, color, data: values.map((v) => num(v)) },
];

export const chartToSheet = (model: ChartModel, corner = ""): ExcelSheet => ({
  header: [corner, ...model.labels],
  rows: model.series.map((s) => [s.name, ...s.data]),
});
```

`apps/vl/lib/vl/drill.ts`:

```ts
import type { Params } from "./api";
import { formatRangePt, type DateRange } from "./dates";

export type FacilityLevel = "province" | "district" | "health_facility";

/**
 * filterType + names = the location filter sent to the API.
 * disaggregation = show the next level down inside that filter (legacy drill-down).
 */
export type DrillState = {
  filterType: FacilityLevel;
  names: string[];
  disaggregation: boolean;
  trail: string[];
};

export type DrillAction =
  | { kind: "drill"; next: DrillState }
  | { kind: "patients"; facility: string; district?: string }
  | { kind: "none" };

export const INITIAL_DRILL: DrillState = { filterType: "province", names: [], disaggregation: false, trail: [] };

export const LEVEL_LABEL: Record<FacilityLevel, string> = {
  province: "Província",
  district: "Distrito",
  health_facility: "Unidade Sanitária",
};

const CHILD: Record<FacilityLevel, FacilityLevel> = {
  province: "district",
  district: "health_facility",
  health_facility: "health_facility",
};

/** Level of the rows the API returns for this state. */
export const rowLevel = (state: DrillState): FacilityLevel =>
  state.disaggregation ? CHILD[state.filterType] : state.filterType;

export function drillClick(state: DrillState, label: string, isAdmin: boolean): DrillAction {
  if (!label) return { kind: "none" };
  const level = rowLevel(state);
  if (level === "health_facility") {
    if (!isAdmin) return { kind: "none" };
    return {
      kind: "patients",
      facility: label,
      district: state.filterType === "district" ? state.names[0] : undefined,
    };
  }
  return {
    kind: "drill",
    next: { filterType: level, names: [label], disaggregation: true, trail: [...state.trail, label] },
  };
}

export function drillParams(state: DrillState): Params {
  const params: Params = {
    facility_type: state.filterType,
    disaggregation: state.disaggregation ? "true" : "false",
  };
  if (state.names.length === 0) return params;
  if (state.filterType === "province") params.province = state.names;
  if (state.filterType === "district") params.district = state.names;
  if (state.filterType === "health_facility") params.health_facility = state.names[0];
  return params;
}

type PopupOption = { value?: string; label: string };

/** Ruling P8: map FacilitiesPopup output to API names. */
export function fromFilter(selection: PopupOption[], type: "province" | "district" | "clinic"): DrillState {
  const names = selection
    .map((option) => (type === "province" ? option.value ?? option.label : option.label))
    .filter((name): name is string => Boolean(name));
  return {
    filterType: type === "clinic" ? "health_facility" : type,
    names: type === "clinic" ? names.slice(0, 1) : names,
    disaggregation: false,
    trail: [],
  };
}

export function drillSubtitle(range: DateRange, state: DrillState): string {
  const parts = [formatRangePt(range)];
  if (state.trail.length > 0) parts.push(state.trail.join(" → "));
  else if (state.names.length > 0) parts.push(`${LEVEL_LABEL[state.filterType]}: ${state.names.join(", ")}`);
  return parts.join(" | ");
}
```

`apps/vl/lib/vl/patients.ts`:

```ts
import { vlGet, type Params } from "./api";
import type { Cell } from "./export/excel";

export type PatientEndpoint = "by_name" | "by_facility" | "by_result_type" | "by_test_reason";
export type ResultType = "suppressed" | "not_suppressed";
export type TestReason = "Routine" | "Repeat" | "Suspected treatment failure" | "Reason Not Specified";

export type PatientFilters = {
  date_basis?: "registration" | "analysis";
  result_type?: ResultType[];
  test_reason?: TestReason[];
  pregnant?: boolean;
  breastfeeding?: boolean;
  rejected?: boolean;
  age_range?: [number, number];
};

/** Fields of hiv/vl/patients rows used by the app (the API sends more). */
export type PatientRow = {
  request_id: string;
  first_name?: string | null;
  last_name?: string | null;
  nid?: string | null;
  age_in_years?: number | null;
  sex_code?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  health_facility?: string | null;
  specimen_datetime?: string | null;
  registered_datetime?: string | null;
  analysis_datetime?: string | null;
  authorised_datetime?: string | null;
  final_result?: string | null;
  viral_load_result_category?: string | null;
  reason_for_test?: string | null;
};

export type PatientsPage = {
  status: string;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  data: PatientRow[];
};

export const MAX_PER_PAGE = 500;

export const RESULT_TYPE_LABEL: Record<ResultType, string> = {
  suppressed: "CV < 1000 (suprimida)",
  not_suppressed: "CV > 1000 (não suprimida)",
};

export const TEST_REASON_LABEL: Record<TestReason, string> = {
  Routine: "Rotina",
  Repeat: "Repetição",
  "Suspected treatment failure": "Suspeita de falha terapêutica",
  "Reason Not Specified": "Motivo não preenchido",
};

export function patientFilterParams(filters: PatientFilters): Params {
  const params: Params = {};
  if (filters.date_basis) params.date_basis = filters.date_basis;
  if (filters.result_type?.length) params.result_type = filters.result_type;
  if (filters.pregnant) params.pregnant = "true";
  if (filters.breastfeeding) params.breastfeeding = "true";
  if (filters.rejected) params.rejected = "true";
  if (filters.age_range) params.age_range = `${filters.age_range[0]},${filters.age_range[1]}`;
  if (filters.test_reason?.length) params.test_reason = filters.test_reason;
  return params;
}

export const fetchPatients = (
  endpoint: PatientEndpoint,
  params: Params,
  page: number,
  perPage: number,
  token: string | null,
): Promise<PatientsPage> =>
  vlGet<PatientsPage>(
    `/patients/${endpoint}/`,
    { ...params, page, per_page: Math.min(perPage, MAX_PER_PAGE) },
    token,
  );

export const PATIENT_HEADERS = [
  "Nome", "Apelido", "NID", "Idade", "Sexo", "Contacto", "Província", "Distrito", "Unidade Sanitária",
  "Data de Colheita", "Data de Registo", "Data de Análise", "Data de Validação",
  "Resultado Final", "Supressão Viral", "Motivo de Teste",
];

/** "2026-03-04T10:22:00" → "04/03/2026"; null → "". */
export function formatDateTimePt(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
}

const suppressionLabel = (category: string | null | undefined): string =>
  category === "Suppressed" ? "CV Suprimida" : category === "Not Suppressed" ? "CV Não Suprimida" : "";

export function patientToRow(p: PatientRow): Cell[] {
  return [
    p.first_name ?? "",
    p.last_name ?? "",
    p.nid ?? "",
    p.age_in_years ?? null,
    p.sex_code ?? "",
    p.phone ?? "",
    p.province ?? "",
    p.district ?? "",
    p.health_facility ?? "",
    formatDateTimePt(p.specimen_datetime),
    formatDateTimePt(p.registered_datetime),
    formatDateTimePt(p.analysis_datetime),
    formatDateTimePt(p.authorised_datetime),
    p.final_result ?? "",
    suppressionLabel(p.viral_load_result_category),
    p.reason_for_test ? TEST_REASON_LABEL[p.reason_for_test as TestReason] ?? p.reason_for_test : "",
  ];
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS, every file in `lib/vl` green.

- [ ] **Step 5: Type-check**

Run: `pnpm --filter=vl exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/vl/lib/vl
git commit -m "feat(vl): add lib/vl core (API client, dates, series, drill-down, patients, Excel)"
```

---

### Task 3: Shared card UI, charts, dialogs and data hooks

**Files:**
- Create:
  - `apps/vl/lib/vl/combo-options.ts`
  - `apps/vl/lib/vl/export/image.ts`
  - `apps/vl/hooks/use-report.ts`
  - `apps/vl/hooks/use-facility-report.ts`
  - `apps/vl/components/card-message.tsx`
  - `apps/vl/components/card-docs.tsx`
  - `apps/vl/components/report-card.tsx`
  - `apps/vl/components/charts/combo-chart.tsx`
  - `apps/vl/components/charts/pie-chart.tsx`
  - `apps/vl/components/lab-groups-dialog.tsx`
  - `apps/vl/components/age-range-dialog.tsx`
  - `apps/vl/components/patients-table.tsx`
  - `apps/vl/components/patients-dialog.tsx`
- Modify: `apps/vl/lib/vl/drill.ts` (add `facilityParams`)
- Test: `apps/vl/lib/vl/combo-options.test.ts`, `apps/vl/lib/vl/drill.test.ts` (append)

**Interfaces:**
- Consumes: everything from Task 2; `useIsAdmin` from Task 1.
- Produces:

| Area | Export | Signature |
|---|---|---|
| Chart options | `buildComboOptions` | `(input: ComboOptionsInput) => ApexOptions` |
| | `toApexSeries` | `(series: Series[])` |
| | `type ComboOptionsInput` | `{ id; labels; series; stacked?; sparkline?; percentLabels?; yTitles? }` |
| Drill-down | `facilityParams` | `(range: DateRange, drill: DrillState, extra?: Params) => Params` |
| Image export | `exportCardImage` | `(cardId: string, title: string) => Promise<void>` |
| Hooks | `useReport` | `<T>(load, deps) => { data, loading, error, retry }` |
| | `useRangeReport` | `<T>(load: (range, token) => Promise<T>, initial?) => { data, loading, error, retry, range, subtitle, onSubmit, onRestart }` |
| | `useLabReport` | `<T>(load: (range, codes, token) => Promise<T>, initial?) => { …same…, labs, openLabs, labsDialog }` |
| | `useFacilityReport` | `<Row>(config: { endpoint; extraParams?; patientFilters? }) => { data, rows, loading, error, retry, range, drill, isAdmin, subtitle, levelLabel, facilityHint, onChartClick, onSubmit, onRestart, patients, closePatients }` |
| | `type PatientsDialogState`, `CLOSED_PATIENTS` | |
| Components | `ReportCard` | props `{ title, subtitle, cardId, reportType?, loading, error, empty, onRetry, onSubmit?, excel, onRestart?, onSelectLabs?, extraOptions?, documentation, footer?, children }` |
| | `CardMessage` | `{ tone, message, onRetry? }` |
| | `CardDocs` | `{ overview, reading, filters, endpoint, notes? }` |
| | `ComboChart` | `ComboOptionsInput & { height?, onClick? }` |
| | `PieChart` | `{ id, labels, values, colors, height? }` |
| | `LabGroupsDialog` | `{ open, onOpenChange, selected, onApply }` |
| | `AgeRangeDialog` | `{ open, onOpenChange, value, onApply }` |
| | `PatientsTable` | `{ rows }` |
| | `PatientsDialog` | `{ state, subtitle, onClose }` |

- [ ] **Step 1: Write the failing tests**

`apps/vl/lib/vl/combo-options.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildComboOptions, toApexSeries } from "./combo-options";
import type { Series } from "./series";

const bars: Series[] = [
  { name: "Registadas", color: "#00b000", data: [1, 2] },
  { name: "Testadas", color: "#fb8c00", data: [3, 4] },
];
const tat: Series = { name: "TRL", color: "#000000", type: "line", yAxis: 1, data: [10, 12] };

describe("buildComboOptions", () => {
  it("sets the chart id, colours, categories and per-series stroke widths", () => {
    const o = buildComboOptions({ id: "c1-chart", labels: ["A", "B"], series: [...bars, tat] });
    expect(o.chart?.id).toBe("c1-chart");
    expect(o.colors).toEqual(["#00b000", "#fb8c00", "#000000"]);
    expect(o.xaxis?.categories).toEqual(["A", "B"]);
    expect(o.stroke?.width).toEqual([0, 0, 3]);
  });

  it("builds one y-axis entry per series for dual axes, sharing by seriesName and showing each axis once", () => {
    const o = buildComboOptions({ id: "c", labels: [], series: [...bars, tat], yTitles: ["Amostras", "Dias"] });
    const y = o.yaxis as any[];
    expect(y).toHaveLength(3);
    expect(y.map((a) => [a.seriesName, a.opposite, a.show])).toEqual([
      ["Registadas", false, true],
      ["Registadas", false, false],
      ["TRL", true, true],
    ]);
    expect(y[2].title.text).toBe("Dias");
  });

  it("uses a single y-axis object when no series is on the right", () => {
    const o = buildComboOptions({ id: "c", labels: [], series: bars, stacked: true });
    expect(Array.isArray(o.yaxis)).toBe(false);
    expect(o.chart?.stacked).toBe(true);
  });

  it("hides the legend and markers for sparklines", () => {
    const o = buildComboOptions({ id: "s", labels: [], series: [{ ...tat, yAxis: 0 }], sparkline: true });
    expect(o.chart?.sparkline?.enabled).toBe(true);
    expect(o.legend?.show).toBe(false);
  });

  it("formats data labels as percentages when asked", () => {
    const o = buildComboOptions({ id: "p", labels: [], series: [{ ...tat, yAxis: 0 }], percentLabels: true });
    expect(o.dataLabels?.enabled).toBe(true);
    expect((o.dataLabels?.formatter as (v: number) => string)(42)).toBe("42%");
  });
});

describe("toApexSeries", () => {
  it("defaults to column, keeps line types and passes stack groups", () => {
    expect(toApexSeries([{ name: "H", color: "#0", data: [1], group: "Homens" }, tat])).toEqual([
      { name: "H", type: "column", data: [1], group: "Homens" },
      { name: "TRL", type: "line", data: [10, 12] },
    ]);
  });
});
```

Append to `apps/vl/lib/vl/drill.test.ts`:

```ts
import { facilityParams } from "./drill";

describe("facilityParams", () => {
  it("combines the window, the drill state and card extras", () => {
    const range = { start: "2025-10-13", end: "2026-10-13" };
    expect(facilityParams(range, INITIAL_DRILL, { age_range: "15,49" })).toEqual({
      interval_dates: "2025-10-13,2026-10-13",
      facility_type: "province",
      disaggregation: "false",
      age_range: "15,49",
    });
  });
});
```

Move that import line to the top of the file, next to the existing `./drill` import.

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL with `Failed to resolve import "./combo-options"`, plus `facilityParams is not a function`.

- [ ] **Step 3: Implement `combo-options.ts` and `facilityParams`**

`apps/vl/lib/vl/combo-options.ts`:

```ts
import type { ApexOptions } from "apexcharts";
import type { Series } from "./series";

export type ComboOptionsInput = {
  id: string;
  labels: string[];
  series: Series[];
  stacked?: boolean;
  sparkline?: boolean;
  percentLabels?: boolean;
  yTitles?: [string, string?];
};

const axisOf = (s: Series): 0 | 1 => s.yAxis ?? 0;

export function buildComboOptions(input: ComboOptionsInput): ApexOptions {
  const { id, labels, series, stacked, sparkline, percentLabels, yTitles } = input;
  const formatter = percentLabels ? (v: number) => `${v}%` : (v: number) => String(v);
  const dual = series.some((s) => axisOf(s) === 1);
  const owner = (axis: 0 | 1) => series.find((s) => axisOf(s) === axis)?.name;
  const firstIndex = (axis: 0 | 1) => series.findIndex((s) => axisOf(s) === axis);

  const yaxis: ApexOptions["yaxis"] = dual
    ? series.map((s, i) => {
        const axis = axisOf(s);
        return {
          seriesName: owner(axis),
          opposite: axis === 1,
          show: firstIndex(axis) === i,
          title: { text: yTitles?.[axis] ?? "" },
          labels: { formatter },
        };
      })
    : { title: { text: yTitles?.[0] ?? "" }, labels: { formatter } };

  return {
    chart: {
      id,
      stacked: Boolean(stacked),
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: Boolean(sparkline) },
      fontFamily: "inherit",
    },
    colors: series.map((s) => s.color),
    xaxis: { categories: labels },
    yaxis,
    stroke: { width: series.map((s) => (s.type === "line" ? 3 : 0)), curve: "smooth" },
    markers: { size: sparkline ? 0 : 4 },
    dataLabels: { enabled: Boolean(percentLabels), formatter },
    plotOptions: { bar: { columnWidth: "55%" } },
    legend: { show: !sparkline && series.length > 1, position: "bottom" },
    tooltip: { shared: true, intersect: false },
  };
}

export const toApexSeries = (series: Series[]) =>
  series.map((s) => ({
    name: s.name,
    type: s.type ?? "column",
    data: s.data,
    ...(s.group ? { group: s.group } : {}),
  }));
```

Append to `apps/vl/lib/vl/drill.ts`:

```ts
import { intervalParam } from "./dates";

export const facilityParams = (range: DateRange, drill: DrillState, extra: Params = {}): Params => ({
  interval_dates: intervalParam(range),
  ...drillParams(drill),
  ...extra,
});
```

Merge `intervalParam` into the existing `./dates` import at the top of `drill.ts`; don't add a second import line.

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 5: Implement `lib/vl/export/image.ts`**

Copy three functions **verbatim** from `apps/tb/app/(dashboard)/(index)/reports/mtb-map-card/chart-export-utils.ts`: `oklchToRgb`, `fixOklchColors` and `restoreOklchColors`, the block from the `oklchToRgb` doc comment down to the end of `restoreOklchColors`, about lines 8–113. Then add:

```ts
import { toIsoDate } from "../dates";
import { chartDomId } from "./chart-id";
import { safeFileName } from "./excel";

// ... oklchToRgb, fixOklchColors, restoreOklchColors copied here ...

function download(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * PNG export of a card. ApexCharts cards use the chart's own renderer (id `<cardId>-chart`);
 * maps and tables fall back to html2canvas on the card wrapper (id `<cardId>`), with the
 * Tailwind v4 OKLCH colour fix.
 */
export async function exportCardImage(cardId: string, title: string): Promise<void> {
  const filename = `${safeFileName(title)}_${toIsoDate(new Date())}.png`;
  const ApexCharts = (await import("apexcharts")).default as any;
  const chart = ApexCharts.getChartByID?.(chartDomId(cardId));
  if (chart) {
    const { imgURI } = await chart.dataURI({ scale: 3 });
    download(imgURI, filename);
    return;
  }
  const element = document.getElementById(cardId);
  if (!element) throw new Error(`Elemento '${cardId}' não encontrado`);
  const html2canvas = (await import("html2canvas")).default;
  const modified = fixOklchColors(element);
  try {
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
    download(canvas.toDataURL("image/png"), filename);
  } finally {
    restoreOklchColors(modified);
  }
}
```

The copied block must not import `CHART_CONFIG` or `ActiveTab`. If it does, drop those imports; the three functions don't use them.

- [ ] **Step 6: Implement the hooks**

`apps/vl/hooks/use-report.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createRequestGate } from "@/lib/vl/request-gate";
import { formatRangePt, lastYear, type DateRange } from "@/lib/vl/dates";
import { labCodes } from "@/lib/vl/labs";

export type ReportState<T> = { data: T | null; loading: boolean; error: string | null; retry: () => void };

/** Loads data whenever deps change. Only the latest request may update state (Review Focus 1). */
export function useReport<T>(load: (token: string | null) => Promise<T>, deps: unknown[]): ReportState<T> {
  const { getToken } = useAuth();
  const gate = useRef(createRequestGate());
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const id = gate.current.next();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    (async () => {
      try {
        const token = await getToken();
        const data = await load(token);
        if (gate.current.isCurrent(id)) setState({ data, loading: false, error: null });
      } catch (error) {
        if (gate.current.isCurrent(id)) {
          setState({ data: null, loading: false, error: error instanceof Error ? error.message : "Ocorreu um erro." });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

/** Date-range card (reportType "national"). */
export function useRangeReport<T>(
  load: (range: DateRange, token: string | null) => Promise<T>,
  initial: () => DateRange = lastYear,
) {
  const [range, setRange] = useState<DateRange>(initial);
  const report = useReport((token) => load(range, token), [range]);
  return {
    ...report,
    range,
    subtitle: formatRangePt(range),
    onSubmit: (dates: [string, string]) => setRange({ start: dates[0], end: dates[1] }),
    onRestart: () => setRange(initial()),
  };
}

/** Lab card: date range + the 16 legacy lab groups (Ruling P2). */
export function useLabReport<T>(
  load: (range: DateRange, codes: string[], token: string | null) => Promise<T>,
  initial: () => DateRange = lastYear,
) {
  const [range, setRange] = useState<DateRange>(initial);
  const [labs, setLabs] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const report = useReport((token) => load(range, labCodes(labs), token), [range, labs]);
  return {
    ...report,
    range,
    labs,
    subtitle: labs.length ? `${formatRangePt(range)} | ${labs.join(", ")}` : formatRangePt(range),
    onSubmit: (dates: [string, string]) => setRange({ start: dates[0], end: dates[1] }),
    onRestart: () => {
      setRange(initial());
      setLabs([]);
    },
    openLabs: () => setOpen(true),
    labsDialog: {
      open,
      onOpenChange: setOpen,
      selected: labs,
      onApply: (names: string[]) => {
        setLabs(names);
        setOpen(false);
      },
    },
  };
}
```

`apps/vl/hooks/use-facility-report.ts`:

```ts
"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useIsAdmin } from "@/lib/vl/admin";
import { vlGet, type Params } from "@/lib/vl/api";
import { intervalParam, lastYear, type DateRange } from "@/lib/vl/dates";
import {
  drillClick,
  drillSubtitle,
  facilityParams,
  fromFilter,
  INITIAL_DRILL,
  LEVEL_LABEL,
  rowLevel,
  type DrillState,
} from "@/lib/vl/drill";
import { fetchPatients, MAX_PER_PAGE, patientFilterParams, type PatientFilters, type PatientRow } from "@/lib/vl/patients";
import { useReport } from "./use-report";

export type PatientsDialogState = {
  open: boolean;
  title: string;
  rows: PatientRow[];
  total: number;
  loading: boolean;
  error: string | null;
};

export const CLOSED_PATIENTS: PatientsDialogState = { open: false, title: "", rows: [], total: 0, loading: false, error: null };

export type FacilityReportConfig = {
  endpoint: string;
  extraParams?: Params;
  patientFilters?: PatientFilters;
};

type PopupOption = { value?: string; label: string };

export function useFacilityReport<Row>(config: FacilityReportConfig) {
  const { getToken } = useAuth();
  const isAdmin = useIsAdmin();
  const [range, setRange] = useState<DateRange>(lastYear);
  const [drill, setDrill] = useState<DrillState>(INITIAL_DRILL);
  const [patients, setPatients] = useState<PatientsDialogState>(CLOSED_PATIENTS);
  const extraKey = JSON.stringify(config.extraParams ?? {});
  const filtersKey = JSON.stringify(config.patientFilters ?? {});

  const report = useReport<Row[]>(
    (token) => vlGet<Row[]>(config.endpoint, facilityParams(range, drill, config.extraParams), token),
    [config.endpoint, range, drill, extraKey],
  );

  const onChartClick = useCallback(
    async (label: string) => {
      const action = drillClick(drill, label, isAdmin);
      if (action.kind === "drill") {
        setDrill(action.next);
        return;
      }
      if (action.kind !== "patients") return;
      setPatients({ ...CLOSED_PATIENTS, open: true, title: action.facility, loading: true });
      try {
        const token = await getToken();
        const page = await fetchPatients(
          "by_facility",
          {
            interval_dates: intervalParam(range),
            health_facility: action.facility,
            district: action.district ? [action.district] : undefined,
            ...patientFilterParams(config.patientFilters ?? {}),
          },
          1,
          MAX_PER_PAGE,
          token,
        );
        setPatients((prev) => ({ ...prev, rows: page.data, total: page.total_count, loading: false }));
      } catch (error) {
        setPatients((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Ocorreu um erro.",
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drill, isAdmin, getToken, range, filtersKey],
  );

  const onSubmit = useCallback(
    (dates: [string, string], facilities?: PopupOption[], facilityType?: "province" | "district" | "clinic") => {
      setRange({ start: dates[0], end: dates[1] });
      setDrill(facilityType ? fromFilter(facilities ?? [], facilityType) : INITIAL_DRILL);
    },
    [],
  );

  const onRestart = useCallback(() => {
    setRange(lastYear());
    setDrill(INITIAL_DRILL);
  }, []);

  const level = rowLevel(drill);

  return {
    ...report,
    rows: report.data ?? [],
    range,
    drill,
    isAdmin,
    subtitle: drillSubtitle(range, drill),
    levelLabel: LEVEL_LABEL[level],
    facilityHint:
      level === "health_facility" && !isAdmin ? "A lista de pacientes está disponível apenas para Administradores." : null,
    onChartClick,
    onSubmit,
    onRestart,
    patients,
    closePatients: () => setPatients(CLOSED_PATIENTS),
  };
}
```

- [ ] **Step 7: Implement the components**

`apps/vl/components/card-message.tsx`:

```tsx
"use client";

import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function CardMessage({
  tone,
  message,
  onRetry,
}: {
  tone: "error" | "empty";
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center text-sm",
        tone === "error" ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-dashed text-muted-foreground",
      )}
    >
      <p>{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
```

`apps/vl/components/card-docs.tsx`:

```tsx
export type CardDocsProps = {
  overview: string;
  reading: string[];
  filters: string[];
  endpoint: string;
  notes?: string[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function CardDocs({ overview, reading, filters, endpoint, notes = [] }: CardDocsProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <Section title="Visão Geral">
        <p>{overview}</p>
      </Section>
      <Section title="Como ler o gráfico">
        <ul className="list-disc space-y-1 pl-5">{reading.map((r) => <li key={r}>{r}</li>)}</ul>
      </Section>
      <Section title="Filtros">
        <ul className="list-disc space-y-1 pl-5">{filters.map((f) => <li key={f}>{f}</li>)}</ul>
      </Section>
      <Section title="Notas técnicas">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Fonte: <code>GET /hiv/vl{endpoint}</code>
          </li>
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </Section>
    </div>
  );
}
```

`apps/vl/components/report-card.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import type { MainCardHeaderOptions } from "@repo/design_system/app/molecules/cards/MainCardHeader";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MdOutlineScience } from "react-icons/md";
import { exportSheet, type ExcelSheet } from "@/lib/vl/export/excel";
import { exportCardImage } from "@/lib/vl/export/image";
import { CardMessage } from "./card-message";

type PopupOption = { value?: string; label: string };

export type ReportCardProps = {
  title: string;
  subtitle: string;
  cardId: string;
  reportType?: "national" | "facility";
  loading: boolean;
  error: string | null;
  empty: boolean;
  onRetry: () => void;
  onSubmit?: (dates: [string, string], facilities?: PopupOption[], facilityType?: "province" | "district" | "clinic") => void;
  excel: () => ExcelSheet;
  onRestart?: () => void;
  onSelectLabs?: () => void;
  extraOptions?: MainCardHeaderOptions[];
  documentation: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function ReportCard(props: ReportCardProps) {
  const { user } = useUser();
  const [exportError, setExportError] = useState<string | null>(null);
  const { title, subtitle, cardId, excel, onRestart, onSelectLabs, extraOptions } = props;

  const options = useMemo<MainCardHeaderOptions[]>(
    () => [
      {
        label: "Exportar para Excel",
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        type: "primary",
        action: () => {
          try {
            setExportError(null);
            exportSheet(title, subtitle, excel());
          } catch {
            setExportError("Não foi possível exportar para Excel.");
          }
        },
      },
      {
        label: "Exportar imagem",
        icon: <IoImageOutline size={20} />,
        type: "primary",
        action: () => {
          setExportError(null);
          exportCardImage(cardId, title).catch(() => setExportError("Não foi possível exportar a imagem."));
        },
      },
      ...(onSelectLabs
        ? [{ label: "Seleccionar laboratórios", icon: <MdOutlineScience size={20} />, type: "primary" as const, action: onSelectLabs }]
        : []),
      ...(onRestart
        ? [{ label: "Reiniciar o relatório", icon: <VscDebugRestart size={20} />, type: "primary" as const, action: onRestart }]
        : []),
      ...(extraOptions ?? []),
    ],
    [title, subtitle, cardId, excel, onRestart, onSelectLabs, extraOptions],
  );

  if (props.loading && props.empty && !props.error) {
    return <MainCardSkeleton sx={{ width: "100%" }} />;
  }

  return (
    <MainCard
      title={title}
      subtitle={subtitle}
      chartId={cardId}
      reportType={props.reportType}
      loading={props.loading}
      additionalOptions={options}
      documentation={props.documentation}
      handleSubmit={props.onSubmit as never}
      footerComponent={props.footer}
      user={{ name: user?.fullName ?? "", email: user?.primaryEmailAddress?.emailAddress ?? "" }}
      width="100%"
      height="auto"
    >
      <div className="px-4 pb-4">
        {exportError && <p className="mb-2 text-xs text-red-500">{exportError}</p>}
        {props.error ? (
          <CardMessage tone="error" message={props.error} onRetry={props.onRetry} />
        ) : props.empty && !props.loading ? (
          <CardMessage tone="empty" message="Sem dados para o período e filtros seleccionados." />
        ) : (
          <div id={cardId}>{props.children}</div>
        )}
      </div>
    </MainCard>
  );
}
```

`apps/vl/components/charts/combo-chart.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { buildComboOptions, toApexSeries, type ComboOptionsInput } from "@/lib/vl/combo-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ComboChartProps = ComboOptionsInput & {
  height?: number;
  onClick?: (label: string) => void;
};

export function ComboChart({ height = 350, onClick, ...input }: ComboChartProps) {
  const base = buildComboOptions(input);
  const options = onClick
    ? {
        ...base,
        chart: {
          ...base.chart,
          events: {
            dataPointSelection: (_e: unknown, _ctx: unknown, cfg: { dataPointIndex: number }) => {
              const label = input.labels[cfg?.dataPointIndex];
              if (label) onClick(label);
            },
          },
        },
      }
    : base;
  const type = input.series.some((s) => s.type === "line") ? "line" : "bar";
  return (
    <div id={input.id}>
      <Chart type={type} options={options} series={toApexSeries(input.series)} height={height} width="100%" />
    </div>
  );
}
```

`apps/vl/components/charts/pie-chart.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function PieChart({
  id,
  labels,
  values,
  colors,
  height = 350,
}: {
  id: string;
  labels: string[];
  values: number[];
  colors: string[];
  height?: number;
}) {
  const options: ApexOptions = {
    chart: { id, toolbar: { show: false }, fontFamily: "inherit" },
    labels,
    colors,
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    tooltip: { y: { formatter: (v: number) => String(v) } },
  };
  return (
    <div id={id}>
      <Chart type="pie" options={options} series={values} height={height} width="100%" />
    </div>
  );
}
```

`apps/vl/components/lab-groups-dialog.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { LAB_GROUPS } from "@/lib/vl/labs";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export function LabGroupsDialog({
  open,
  onOpenChange,
  selected,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onApply: (names: string[]) => void;
}) {
  const [checked, setChecked] = useState<string[]>(selected);
  useEffect(() => {
    if (open) setChecked(selected);
  }, [open, selected]);

  const toggle = (name: string) =>
    setChecked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar laboratórios</DialogTitle>
          <DialogDescription>Sem selecção, cada relatório usa o seu filtro por omissão (ver a documentação do cartão).</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LAB_GROUPS.map((group) => (
            <label key={group.name} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={checked.includes(group.name)} onChange={() => toggle(group.name)} />
              <span>{group.name}</span>
              <span className="text-xs text-muted-foreground">{group.codes.join(", ")}</span>
            </label>
          ))}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setChecked([])}>Limpar</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onApply(checked)}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

`apps/vl/components/age-range-dialog.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { parseAgeRange, type AgeRange } from "@/lib/vl/age";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AgeRangeDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AgeRange;
  onApply: (range: AgeRange) => void;
}) {
  const [min, setMin] = useState(String(value[0]));
  const [max, setMax] = useState(String(value[1]));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMin(String(value[0]));
      setMax(String(value[1]));
      setError(null);
    }
  }, [open, value]);

  const apply = () => {
    const parsed = parseAgeRange(min, max);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    onApply(parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Faixa etária</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="age-min">Início</Label>
            <Input id="age-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="age-max">Fim</Label>
            <Input id="age-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={apply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

`apps/vl/components/patients-table.tsx`:

```tsx
"use client";

import { PATIENT_HEADERS, patientToRow, type PatientRow } from "@/lib/vl/patients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function PatientsTable({ rows }: { rows: PatientRow[] }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {PATIENT_HEADERS.map((h) => (
              <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.request_id}>
              {patientToRow(row).map((cell, i) => (
                <TableCell key={PATIENT_HEADERS[i]} className="whitespace-nowrap">{cell ?? ""}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

`apps/vl/components/patients-dialog.tsx`:

```tsx
"use client";

import { SyncLoader } from "react-spinners";
import { exportSheet } from "@/lib/vl/export/excel";
import { PATIENT_HEADERS, patientToRow } from "@/lib/vl/patients";
import type { PatientsDialogState } from "@/hooks/use-facility-report";
import { CardMessage } from "./card-message";
import { PatientsTable } from "./patients-table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export function PatientsDialog({
  state,
  subtitle,
  onClose,
}: {
  state: PatientsDialogState;
  subtitle: string;
  onClose: () => void;
}) {
  const title = `Pacientes — ${state.title}`;
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        {state.loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <SyncLoader size={8} />
          </div>
        ) : state.error ? (
          <CardMessage tone="error" message={state.error} />
        ) : state.rows.length === 0 ? (
          <CardMessage tone="empty" message="Nenhum paciente encontrado." />
        ) : (
          <>
            {state.total > state.rows.length && (
              <p className="text-sm text-muted-foreground">
                A mostrar {state.rows.length} de {state.total}. Use a página Pacientes para a lista completa.
              </p>
            )}
            <PatientsTable rows={state.rows} />
          </>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={state.rows.length === 0}
            onClick={() => exportSheet(title, subtitle, { header: PATIENT_HEADERS, rows: state.rows.map(patientToRow) })}
          >
            Exportar para Excel
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 8: Verify**

```bash
pnpm --filter=vl test
pnpm --filter=vl exec tsc --noEmit
pnpm --filter=vl lint
```

Expected: all pass.

If `tsc` reports that `MainCardHeaderOptions` is not exported from `@repo/design_system/app/molecules/cards/MainCardHeader`, import the type from `@repo/design_system_mui` instead. Do not edit the package.

- [ ] **Step 9: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add ReportCard, charts, dialogs and data hooks shared by all cards"
```

---

### Task 4: Sumário page (6 cards)

Every card folder in Tasks 4–7 has the same five files:
- `constants.ts`: `CARD_ID`, `TITLE`, `ENDPOINT`.
- `actions.ts`: fetch, `toChart`, `toExcel`. Pure TypeScript.
- `actions.test.ts`
- `docs.tsx`
- `index.tsx`

The card's root `<div id>` is `CARD_ID`, and its chart id is `chartDomId(CARD_ID)`.

**Files:**
- Create: `apps/vl/components/charts/stacked-chart.tsx`
- Create, under `apps/vl/app/(dashboard)/(index)/reports/`:
  - `overview-status-cards/{constants.ts,actions.ts,actions.test.ts,index.tsx}` (no MainCard, so no docs)
  - `vl-suppression-trend/{constants.ts,actions.ts,actions.test.ts,docs.tsx,index.tsx}`
  - `vl-suppression-map/…` (same five files)
  - `vl-tat-national/…`
  - `vl-tat-vs-disalinks/…`
  - `vl-indicators-summary/…`
- Modify: `apps/vl/app/(dashboard)/(index)/page.tsx`

**Interfaces:**
- Consumes: Task 2 lib, Task 3 components and hooks.
- Produces: `StackedChart({ id, model, height?, onClick? })`, a wrapper around the design-system `Stacked` that takes a `ChartModel`. Tasks 5–7 use it.

- [ ] **Step 1: Create `components/charts/stacked-chart.tsx`**

```tsx
"use client";

import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import type { ChartModel } from "@/lib/vl/series";

export function StackedChart({
  id,
  model,
  height = 350,
  onClick,
}: {
  id: string;
  model: ChartModel;
  height?: number;
  onClick?: (label: string) => void;
}) {
  return (
    <Stacked
      id={id}
      height={height}
      labels={model.labels}
      series={model.series.map(({ name, data }) => ({ name, data }))}
      colors={model.series.map((s) => s.color)}
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 2: Write the failing card tests**

`(index)/reports/overview-status-cards/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchOverview, summarize } from "./actions";

const range = { start: "2025-10-13", end: "2026-10-13" };

describe("overview status cards", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));

  it("calls the three summary endpoints with the same window", async () => {
    await fetchOverview(range, "t");
    expect(vlGet.mock.calls.map((c) => c[0])).toEqual([
      "/summary/number_of_samples_by_month/",
      "/summary/viral_suppression_by_month/",
      "/summary/tat_by_month/",
    ]);
    expect(vlGet.mock.calls.every((c) => c[1].interval_dates === "2025-10-13,2026-10-13")).toBe(true);
  });

  it("reproduces the legacy maths (sum, mean of rounded %, mean of TAT sums)", () => {
    const s = summarize({
      samples: [
        { year: 2026, month: 1, month_name: "January", total: 100 },
        { year: 2026, month: 2, month_name: "February", total: 50 },
      ],
      suppression: [
        { year: 2026, month: 1, month_name: "January", total: 3, suppressed: 2, not_suppressed: 1 },
        { year: 2026, month: 2, month_name: "February", total: 0, suppressed: 0, not_suppressed: 0 },
      ],
      tat: [
        { year: 2026, month: 1, month_name: "January", collection_reception: 2, reception_registration: 1, registration_analysis: null, analysis_validation: 3 },
      ],
    });
    expect(s.samples.value).toBe(150);
    expect(s.samples.labels).toEqual(["Jan/26", "Fev/26"]);
    expect(s.suppression.data).toEqual([67, 0]);
    expect(s.suppression.value).toBe(34); // round((67 + 0) / 2)
    expect(s.tat.value).toBe(6);
  });

  it("returns zeros for empty responses", () => {
    const s = summarize({ samples: [], suppression: [], tat: [] });
    expect([s.samples.value, s.suppression.value, s.tat.value]).toEqual([0, 0, 0]);
  });
});
```

`(index)/reports/vl-suppression-trend/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2025, month: 12, month_name: "December", total: 4, suppressed: 3, not_suppressed: 1 },
  { year: 2026, month: 1, month_name: "January", total: 0, suppressed: 0, not_suppressed: 0 },
];

describe("vl-suppression-trend", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches viral_suppression_by_month with the window", async () => {
    await fetchData({ start: "2025-01-01", end: "2025-12-31" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/viral_suppression_by_month/", { interval_dates: "2025-01-01,2025-12-31" }, "t");
  });
  it("plots rounded suppression % per month, 0 for empty months", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Dez/25", "Jan/26"]);
    expect(c.series[0]).toMatchObject({ name: "Supressão Viral", type: "line", color: "#00b000", data: [75, 0] });
  });
  it("exports the legacy Excel layout", () => {
    expect(toExcel(rows)).toEqual({ header: ["Supressão Viral", "Dez/25", "Jan/26"], rows: [["Total %", 75, 0]] });
  });
});
```

`(index)/reports/vl-suppression-map/actions.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/vl/api", () => ({ vlGet: vi.fn() }));

import { rowFor, toExcel, toMapProvinces } from "./actions";

const rows = [
  { province: "Gaza", total: 10, suppressed: 9, not_suppressed: 1, routine: 7, treatment_failure: 2, reason_not_specified: 1 },
  { province: "Zambézia", total: 0, suppressed: 0, not_suppressed: 0, routine: 0, treatment_failure: 0, reason_not_specified: 0 },
  { province: null, total: 5, suppressed: 5, not_suppressed: 0, routine: 5, treatment_failure: 0, reason_not_specified: 0 },
];

describe("vl-suppression-map", () => {
  it("maps provinces to keys with the suppression ratio, skipping null names and zero totals safely", () => {
    expect(toMapProvinces(rows)).toEqual({
      gz: { highlighted: true, highlightedColor: "#00b000", ratio: 0.9 },
      zb: { highlighted: true, highlightedColor: "#00b000", ratio: 0 },
    });
  });
  it("finds the row for a clicked map province by normalised name", () => {
    expect(rowFor(rows, "Zambezia")?.total).toBe(0);
    expect(rowFor(rows, "Tete")).toBeUndefined();
  });
  it("exports the legacy table with one column per province", () => {
    const sheet = toExcel(rows);
    expect(sheet.header).toEqual(["Motivo de Teste", "Gaza", "Zambézia", "Sem província"]);
    expect(sheet.rows.map((r) => r[0])).toEqual([
      "Rotina", "Falência Terapêutica", "Motivo não especificado", "Supressão Viral", "Taxa de Supressão (%)", "Amostras Testadas",
    ]);
    expect(sheet.rows[4]).toEqual(["Taxa de Supressão (%)", 90, 0, 100]);
  });
});
```

`(index)/reports/vl-tat-national/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 3, month_name: "March", collection_reception: 4, reception_registration: 1, registration_analysis: 6, analysis_validation: null },
];

describe("vl-tat-national", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches summary tat_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/tat_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("stacks the 4 TAT segments by month", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([4, 1, 6, 0]);
  });
  it("exports one row per segment", () => {
    expect(toExcel(rows).header).toEqual(["Tempo Resposta", "Mar/26"]);
    expect(toExcel(rows).rows).toHaveLength(4);
  });
});
```

`(index)/reports/vl-tat-vs-disalinks/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { semester: "17S1", disalinks: 28, tat: 46 },
  { semester: "17S2", disalinks: 67, tat: 20 },
];

describe("vl-tat-vs-disalinks", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches the static endpoint without date params", async () => {
    await fetchData("t");
    expect(vlGet).toHaveBeenCalledWith("/summary/tat_vs_disalinks/", {}, "t");
  });
  it("draws TAT on the left axis and Disalinks on the right", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["17S1", "17S2"]);
    expect(c.series.map((s) => [s.name, s.yAxis, s.data])).toEqual([
      ["TAT", 0, [46, 20]],
      ["#Disalinks", 1, [28, 67]],
    ]);
  });
  it("exports the legacy rows", () => {
    expect(toExcel(rows)).toEqual({
      header: ["", "17S1", "17S2"],
      rows: [["Tempo de Resposta", 46, 20], ["# Disalinks", 28, 67]],
    });
  });
});
```

`(index)/reports/vl-indicators-summary/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toExcel, toTable } from "./actions";

const rows = [
  { year: 2026, month: 1, month_name: "January", registered: 10, tested: 8, suppressed: 6, rejected: 1, non_validated: 2 },
  { year: 2026, month: 2, month_name: "February", registered: 5, tested: 5, suppressed: 4, rejected: 0, non_validated: 0 },
];

describe("vl-indicators-summary", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches samples_history", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-02-28" }, "t");
    expect(vlGet).toHaveBeenCalledWith("/summary/samples_history/", { interval_dates: "2026-01-01,2026-02-28" }, "t");
  });
  it("puts months in columns and the 5 legacy indicators in rows, in order", () => {
    const t = toTable(rows);
    expect(t.columns).toEqual(["Jan/26", "Fev/26"]);
    expect(t.rows).toEqual([
      { label: "Amostras Registadas", values: [10, 5] },
      { label: "Amostras Testadas", values: [8, 5] },
      { label: "Amostras com CV<1000", values: [6, 4] },
      { label: "Amostras não validadas", values: [2, 0] },
      { label: "Amostras Rejeitadas", values: [1, 0] },
    ]);
  });
  it("exports the same table", () => {
    expect(toExcel(rows).header).toEqual(["Indicadores", "Jan/26", "Fev/26"]);
    expect(toExcel(rows).rows[0]).toEqual(["Amostras Registadas", 10, 5]);
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL with `Failed to resolve import "./actions"` in the 6 new test files.

- [ ] **Step 4: Implement `constants.ts` and `actions.ts` for each card**

`overview-status-cards/constants.ts`:

```ts
export const CARD_ID = "vl-overview-status-cards";
export const ENDPOINTS = {
  samples: "/summary/number_of_samples_by_month/",
  suppression: "/summary/viral_suppression_by_month/",
  tat: "/summary/tat_by_month/",
} as const;
```

`overview-status-cards/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import { mean, num, pct, sum } from "@/lib/vl/format";
import type { SamplesByMonth, SuppressionByMonth, TatByMonth } from "@/lib/vl/types";
import { ENDPOINTS } from "./constants";

export type Overview = { samples: SamplesByMonth[]; suppression: SuppressionByMonth[]; tat: TatByMonth[] };
export type Tile = { value: number; labels: string[]; data: number[] };

export async function fetchOverview(range: DateRange, token: string | null): Promise<Overview> {
  const params = { interval_dates: intervalParam(range) };
  const [samples, suppression, tat] = await Promise.all([
    vlGet<SamplesByMonth[]>(ENDPOINTS.samples, params, token),
    vlGet<SuppressionByMonth[]>(ENDPOINTS.suppression, params, token),
    vlGet<TatByMonth[]>(ENDPOINTS.tat, params, token),
  ]);
  return { samples, suppression, tat };
}

/** Ruling P13: legacy maths. */
export function summarize(o: Overview): { samples: Tile; suppression: Tile; tat: Tile } {
  const label = (r: { year: number; month: number }) => monthLabel(r.year, r.month);
  const suppressionPct = o.suppression.map((r) => pct(r.suppressed, r.total));
  const tatSums = o.tat.map(
    (r) => num(r.collection_reception) + num(r.reception_registration) + num(r.registration_analysis) + num(r.analysis_validation),
  );
  return {
    samples: { value: sum(o.samples.map((r) => r.total)), labels: o.samples.map(label), data: o.samples.map((r) => num(r.total)) },
    suppression: { value: Math.round(mean(suppressionPct)), labels: o.suppression.map(label), data: suppressionPct },
    tat: { value: Math.round(mean(tatSums)), labels: o.tat.map(label), data: tatSums },
  };
}
```

`vl-suppression-trend/constants.ts`:

```ts
export const CARD_ID = "vl-suppression-trend";
export const TITLE = "Supressão Viral";
export const ENDPOINT = "/summary/viral_suppression_by_month/";
```

`vl-suppression-trend/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { pct } from "@/lib/vl/format";
import type { ChartModel } from "@/lib/vl/series";
import type { SuppressionByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<SuppressionByMonth[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: SuppressionByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: [{ name: "Supressão Viral", type: "line", color: "#00b000", data: rows.map((r) => pct(r.suppressed, r.total)) }],
});

export function toExcel(rows: SuppressionByMonth[]): ExcelSheet {
  const chart = toChart(rows);
  return { header: ["Supressão Viral", ...chart.labels], rows: [["Total %", ...chart.series[0].data]] };
}
```

`vl-suppression-map/constants.ts`:

```ts
export const CARD_ID = "vl-suppression-map";
export const TITLE = "Média da Supressão Viral";
export const ENDPOINT = "/summary/suppression_by_province_by_month/";
export const MAP_COLOR = "#00b000";
```

`vl-suppression-map/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { pct } from "@/lib/vl/format";
import { provinceKey, type ProvinceKey } from "@/lib/vl/geo";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { ENDPOINT, MAP_COLOR } from "./constants";

export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<SuppressionByProvince[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export function toMapProvinces(rows: SuppressionByProvince[]): Partial<Record<ProvinceKey, MapProvince>> {
  const out: Partial<Record<ProvinceKey, MapProvince>> = {};
  for (const row of rows) {
    const key = provinceKey(row.province);
    if (!key) continue;
    out[key] = { highlighted: true, highlightedColor: MAP_COLOR, ratio: pct(row.suppressed, row.total) / 100 };
  }
  return out;
}

export const rowFor = (rows: SuppressionByProvince[], provinceName: string) =>
  rows.find((row) => provinceKey(row.province) !== undefined && provinceKey(row.province) === provinceKey(provinceName));

export function toExcel(rows: SuppressionByProvince[]): ExcelSheet {
  return {
    header: ["Motivo de Teste", ...rows.map((r) => r.province ?? "Sem província")],
    rows: [
      ["Rotina", ...rows.map((r) => r.routine)],
      ["Falência Terapêutica", ...rows.map((r) => r.treatment_failure)],
      ["Motivo não especificado", ...rows.map((r) => r.reason_not_specified)],
      ["Supressão Viral", ...rows.map((r) => r.suppressed)],
      ["Taxa de Supressão (%)", ...rows.map((r) => pct(r.suppressed, r.total))],
      ["Amostras Testadas", ...rows.map((r) => r.total)],
    ],
  };
}
```

`vl-tat-national/constants.ts`:

```ts
export const CARD_ID = "vl-tat-national";
export const TITLE = "Tempo de Resposta médio Nacional";
export const ENDPOINT = "/summary/tat_by_month/";
```

`vl-tat-national/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<TatByMonth[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]): ExcelSheet => chartToSheet(toChart(rows), "Tempo Resposta");
```

`vl-tat-vs-disalinks/constants.ts`:

```ts
export const CARD_ID = "vl-tat-vs-disalinks";
export const TITLE = "TRL vs No. de Disalinks";
export const ENDPOINT = "/summary/tat_vs_disalinks/";
export const SUBTITLE = "Por semestre (dados históricos fixos)";
```

`vl-tat-vs-disalinks/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import type { ChartModel } from "@/lib/vl/series";
import type { TatVsDisalinks } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (token: string | null) => vlGet<TatVsDisalinks[]>(ENDPOINT, {}, token);

export const toChart = (rows: TatVsDisalinks[]): ChartModel => ({
  labels: rows.map((r) => r.semester),
  series: [
    { name: "TAT", type: "line", yAxis: 0, color: "#00b000", data: rows.map((r) => r.tat) },
    { name: "#Disalinks", type: "line", yAxis: 1, color: "#f8a200", data: rows.map((r) => r.disalinks) },
  ],
});

export const toExcel = (rows: TatVsDisalinks[]): ExcelSheet => ({
  header: ["", ...rows.map((r) => r.semester)],
  rows: [
    ["Tempo de Resposta", ...rows.map((r) => r.tat)],
    ["# Disalinks", ...rows.map((r) => r.disalinks)],
  ],
});
```

`vl-indicators-summary/constants.ts`:

```ts
export const CARD_ID = "vl-indicators-summary";
export const TITLE = "Resumo de Indicadores";
export const ENDPOINT = "/summary/samples_history/";
```

`vl-indicators-summary/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { intervalParam, monthLabel, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import type { IndicatorsByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export type IndicatorsTable = { columns: string[]; rows: { label: string; values: number[] }[] };

const INDICATORS: { label: string; key: keyof IndicatorsByMonth }[] = [
  { label: "Amostras Registadas", key: "registered" },
  { label: "Amostras Testadas", key: "tested" },
  { label: "Amostras com CV<1000", key: "suppressed" },
  { label: "Amostras não validadas", key: "non_validated" },
  { label: "Amostras Rejeitadas", key: "rejected" },
];

export const fetchData = (range: DateRange, token: string | null) =>
  vlGet<IndicatorsByMonth[]>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const toTable = (rows: IndicatorsByMonth[]): IndicatorsTable => ({
  columns: rows.map((r) => monthLabel(r.year, r.month)),
  rows: INDICATORS.map(({ label, key }) => ({ label, values: rows.map((r) => Number(r[key]) || 0) })),
});

export function toExcel(rows: IndicatorsByMonth[]): ExcelSheet {
  const table = toTable(rows);
  return { header: ["Indicadores", ...table.columns], rows: table.rows.map((r) => [r.label, ...r.values]) };
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 6: Write the `docs.tsx` files**

Each uses `CardDocs`. Write them exactly as follows.

`vl-suppression-trend/docs.tsx`:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Percentagem mensal de amostras com carga viral suprimida (CV < 1000 cópias/mL) entre as amostras analisadas."
      reading={[
        "Cada ponto é um mês de análise (data de análise).",
        "Valor = amostras suprimidas ÷ amostras com resultado × 100, arredondado.",
        "Meses sem resultados mostram 0%.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
```

`vl-suppression-map/docs.tsx`:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Taxa de supressão viral por província requisitante no período seleccionado."
      reading={[
        "A intensidade da cor de cada província corresponde à taxa de supressão.",
        "Passe o cursor sobre uma província para ver a taxa, as amostras testadas e os motivos de teste.",
        "Amostras sem província requisitante não aparecem no mapa, mas constam da exportação Excel.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
```

`vl-tat-national/docs.tsx`:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio, em dias, de cada etapa do circuito da amostra a nível nacional, por mês de análise."
      reading={[
        "Cada barra empilha quatro etapas: Colheita à Recepção, Recepção ao Registo, Registo à Análise e Análise à Validação.",
        "A altura total é a soma das médias das etapas.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
      notes={[
        "Só entram amostras com resultado e com data de recepção igual ou posterior à de colheita.",
        "✱ Sem limite de 90 dias: o sistema anterior pretendia aplicá-lo, mas nunca o aplicou.",
      ]}
    />
  );
}
```

`vl-tat-vs-disalinks/docs.tsx`:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Evolução do tempo de resposta laboratorial (TRL) face ao número de impressoras Disa*Link instaladas, por semestre."
      reading={[
        "Linha verde: TRL médio em dias (eixo esquerdo).",
        "Linha laranja: número de Disalinks (eixo direito).",
      ]}
      filters={["Sem filtros: dados históricos fixos (2017–2020), herdados do portal anterior."]}
      endpoint={ENDPOINT}
    />
  );
}
```

`vl-indicators-summary/docs.tsx`:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Resumo mensal dos principais indicadores de carga viral, por mês de registo da amostra."
      reading={[
        "Registadas: todas as amostras registadas no mês.",
        "Testadas: amostras registadas no mês que já têm data de análise.",
        "CV<1000: amostras com resultado suprimido.",
        "Não validadas: com resultado mas sem data de validação.",
        "Rejeitadas: com código de rejeição.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
```

- [ ] **Step 7: Write the `index.tsx` files**

`overview-status-cards/index.tsx`:

```tsx
"use client";

import { StatusCard } from "@repo/design_system/app/organisms/cards/StatusCard";
import { StatusCardSkeleton } from "@repo/design_system/app/molecules/skeletons/StatusCardSkeleton";
import { CardMessage } from "@/components/card-message";
import { ComboChart } from "@/components/charts/combo-chart";
import { useReport } from "@/hooks/use-report";
import { lastYear } from "@/lib/vl/dates";
import { CARD_ID } from "./constants";
import { fetchOverview, summarize, type Tile } from "./actions";

const TILES: { key: "samples" | "suppression" | "tat"; title: string; color: string; format: (v: number) => string }[] = [
  { key: "samples", title: "Número de amostras", color: "#00b000", format: (v) => v.toLocaleString("pt-PT") },
  { key: "suppression", title: "Supressão Viral das amostras", color: "#ef5350", format: (v) => `${v}%` },
  { key: "tat", title: "Tempo de Resposta", color: "#6B53C6", format: (v) => `${v} dias` },
];

export default function OverviewStatusCards() {
  const { data, loading, error, retry } = useReport((token) => fetchOverview(lastYear(), token), []);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-4 md:flex-row">
        {TILES.map((t) => (
          <StatusCardSkeleton key={t.key} sx={{ width: "100%" }} />
        ))}
      </div>
    );
  }

  const summary = summarize(data);
  return (
    <div id={CARD_ID} className="flex flex-col gap-4 md:flex-row">
      {TILES.map((t) => {
        const tile: Tile = summary[t.key];
        return (
          <section key={t.key} className="min-w-[220px] flex-1">
            <StatusCard title={t.title} value={t.format(tile.value)} subtitle="Últimos 12 meses">
              <ComboChart
                id={`${CARD_ID}-${t.key}-chart`}
                labels={tile.labels}
                series={[{ name: t.title, type: "line", color: t.color, data: tile.data }]}
                sparkline
                height={70}
              />
            </StatusCard>
          </section>
        );
      })}
    </div>
  );
}
```

`vl-suppression-trend/index.tsx`:

```tsx
"use client";

import { ReportCard } from "@/components/report-card";
import { ComboChart } from "@/components/charts/combo-chart";
import { useRangeReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlSuppressionTrend() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const chart = toChart(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <ComboChart id={chartDomId(CARD_ID)} labels={chart.labels} series={chart.series} percentLabels />
    </ReportCard>
  );
}
```

`vl-suppression-map/index.tsx`:

```tsx
"use client";

import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { MapLegend } from "@repo/design_system/app/atoms/maps/MapLegend";
import { ReportCard } from "@/components/report-card";
import { useRangeReport } from "@/hooks/use-report";
import { pct } from "@/lib/vl/format";
import { CARD_ID, MAP_COLOR, TITLE } from "./constants";
import { fetchData, rowFor, toExcel, toMapProvinces } from "./actions";
import Docs from "./docs";

export default function VlSuppressionMap() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <div className="flex flex-col items-center gap-2">
        <InteractiveSvgMap
          width="100%"
          height={420}
          provinces={toMapProvinces(rows)}
          highlightedColor={MAP_COLOR}
          showPopover
          getPopoverContent={(provinceName: string) => {
            const row = rowFor(rows, provinceName);
            if (!row) return <span>{provinceName}: sem dados</span>;
            return (
              <div className="space-y-1 text-xs">
                <strong>{provinceName}</strong>
                <div>Supressão viral: {pct(row.suppressed, row.total)}%</div>
                <div>Amostras testadas: {row.total}</div>
                <div>Rotina: {row.routine}</div>
                <div>Falência terapêutica: {row.treatment_failure}</div>
              </div>
            );
          }}
        />
        <MapLegend baseColor={MAP_COLOR} size="small" />
      </div>
    </ReportCard>
  );
}
```

`vl-tat-national/index.tsx`:

```tsx
"use client";

import { ReportCard } from "@/components/report-card";
import { StackedChart } from "@/components/charts/stacked-chart";
import { useRangeReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTatNational() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <StackedChart id={chartDomId(CARD_ID)} model={toChart(rows)} />
    </ReportCard>
  );
}
```

`vl-tat-vs-disalinks/index.tsx`:

```tsx
"use client";

import { ReportCard } from "@/components/report-card";
import { ComboChart } from "@/components/charts/combo-chart";
import { useReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
import { CARD_ID, SUBTITLE, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTatVsDisalinks() {
  const r = useReport(fetchData, []);
  const rows = r.data ?? [];
  const chart = toChart(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={SUBTITLE}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <ComboChart id={chartDomId(CARD_ID)} labels={chart.labels} series={chart.series} yTitles={["TRL (dias)", "Disalinks"]} />
    </ReportCard>
  );
}
```

`vl-indicators-summary/index.tsx`:

```tsx
"use client";

import { ReportCard } from "@/components/report-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRangeReport } from "@/hooks/use-report";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

export default function VlIndicatorsSummary() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const table = toTable(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicadores</TableHead>
              {table.columns.map((c) => (
                <TableHead key={c} className="text-right">{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="whitespace-nowrap font-medium">{row.label}</TableCell>
                {row.values.map((v, i) => (
                  <TableCell key={table.columns[i]} className="text-right">{v.toLocaleString("pt-PT")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ReportCard>
  );
}
```

- [ ] **Step 8: Replace `apps/vl/app/(dashboard)/(index)/page.tsx`**

```tsx
"use client";

import OverviewStatusCards from "./reports/overview-status-cards";
import VlSuppressionTrend from "./reports/vl-suppression-trend";
import VlSuppressionMap from "./reports/vl-suppression-map";
import VlTatNational from "./reports/vl-tat-national";
import VlTatVsDisalinks from "./reports/vl-tat-vs-disalinks";
import VlIndicatorsSummary from "./reports/vl-indicators-summary";

export default function SummaryPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[1536px]:gap-8">
        <OverviewStatusCards />
        <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
          <VlSuppressionTrend />
          <VlSuppressionMap />
          <VlTatNational />
          <VlTatVsDisalinks />
        </div>
        <VlIndicatorsSummary />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Verify in the browser**

```bash
pnpm --filter=vl test
pnpm --filter=vl exec tsc --noEmit
pnpm --filter=vl lint
pnpm --filter=vl dev
```

Open `/` while signed in. Check:
- The 3 tiles show values and sparklines.
- The map colours the provinces, and hovering shows the details.
- The Excel and image exports download files.
- Changing dates in one card refetches only that card.
- Restart resets it.

If `NEXT_PUBLIC_OPENLDR_API` is unreachable, each card shows its own error box and the "Tentar novamente" button, and the page stays up.

- [ ] **Step 10: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add Sumário page with status cards, suppression trend and map, TAT and indicators"
```

---

### Task 5: Laboratório page (8 cards)

All 8 lab cards have the same behaviour: a date range, the lab-group selection, and one chart with no drill-down. They render through one generic `LabReportCard`. Each card folder still owns its endpoint, transforms, tests and docs.

**Files:**
- Create: `apps/vl/components/lab-report-card.tsx`
- Modify: `apps/vl/lib/vl/labs.ts` (add `labParams`) and `apps/vl/lib/vl/labs.test.ts`
- Create, under `apps/vl/app/(dashboard)/lab/reports/`, five files (`constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx`, `index.tsx`) for each of:
  - `vl-weekly-report-by-lab`
  - `vl-weekly-report-national`
  - `vl-tested-by-lab`
  - `vl-tested-by-month`
  - `vl-tat-by-lab`
  - `vl-tat-by-month`
  - `vl-rejected-by-lab`
  - `vl-rejected-by-month`
- Modify: `apps/vl/app/(dashboard)/lab/page.tsx`

**Interfaces:**
- Consumes: `useLabReport` and `ReportCard` (Task 3), `StackedChart` (Task 4), `ComboChart`, `LabGroupsDialog`.
- Produces: `labParams(range: DateRange, codes: string[]): Params` and the `LabReportCard` component (props below).

- [ ] **Step 1: Write the failing tests**

Append to `apps/vl/lib/vl/labs.test.ts`:

```ts
import { labParams } from "./labs";

describe("labParams", () => {
  it("sends the window and lab codes; empty codes are dropped later by cleanParams", () => {
    expect(labParams({ start: "2026-01-01", end: "2026-01-31" }, ["PJC", "PJV"])).toEqual({
      interval_dates: "2026-01-01,2026-01-31",
      lab_code: ["PJC", "PJV"],
    });
  });
});
```

Move the import up to join the existing `./labs` import.

`lab/reports/vl-weekly-report-by-lab/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const row = (lab: string, week: string, tat: number | null) => ({
  lab_code: lab.slice(0, 3).toUpperCase(), lab_name: lab, week, start: "2026-10-04", end: "2026-10-10",
  backlogs: 5, tests: 90, registrations: 100, rejections: 2, capacity: 120, tat,
});

describe("vl-weekly-report-by-lab", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches weekly_report with window and lab codes", async () => {
    await fetchData({ start: "2026-10-04", end: "2026-10-10" }, ["PJC"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/weekly_report/", { interval_dates: "2026-10-04,2026-10-10", lab_code: ["PJC"] }, "t");
  });
  it("labels by lab for one week and adds the week when several weeks are shown", () => {
    expect(toChart([row("Chimoio", "40", 3), row("INS", "40", 4)]).labels).toEqual(["Chimoio", "INS"]);
    expect(toChart([row("Chimoio", "40", 3), row("Chimoio", "41", 4)]).labels).toEqual(["Chimoio · 40", "Chimoio · 41"]);
  });
  it("draws 4 columns on the left axis and TRL as a right-axis line", () => {
    const c = toChart([row("Chimoio", "40", null)]);
    expect(c.series.map((s) => [s.name, s.type ?? "column", s.yAxis ?? 0, s.data[0]])).toEqual([
      ["Registadas", "column", 0, 100],
      ["Testadas", "column", 0, 90],
      ["Não processadas", "column", 0, 5],
      ["Capacidade", "column", 0, 120],
      ["TRL", "line", 1, 0],
    ]);
  });
  it("exports the legacy rows, including rejections", () => {
    const sheet = toExcel([row("Chimoio", "40", 3)]);
    expect(sheet.rows.map((r) => r[0])).toEqual([
      "Amostras Registadas", "Amostras Testadas", "Amostras não processadas", "Amostras Rejeitadas",
      "Capacidade Laboratorial (85%)", "Tempo de Resposta",
    ]);
    expect(sheet.rows[3]).toEqual(["Amostras Rejeitadas", 2]);
  });
});
```

`lab/reports/vl-weekly-report-national/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { week: "39", start: "2026-09-27", end: "2026-10-03", backlogs: 1, tests: 2, registrations: 3, rejections: 4, capacity: 5, tat: 6.4 },
];

describe("vl-weekly-report-national", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches weekly_report_national", async () => {
    await fetchData({ start: "2026-07-21", end: "2026-10-13" }, [], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/weekly_report_national/", { interval_dates: "2026-07-21,2026-10-13", lab_code: [] }, "t");
  });
  it("has 3 columns, a capacity line on the left axis and TRL on the right axis", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["39"]);
    expect(c.series.map((s) => [s.name, s.type ?? "column", s.yAxis ?? 0])).toEqual([
      ["Registadas", "column", 0],
      ["Testadas", "column", 0],
      ["Não processadas", "column", 0],
      ["Capacidade", "line", 0],
      ["TRL", "line", 1],
    ]);
    expect(c.series[4].data).toEqual([6.4]);
  });
  it("exports one column per week", () => {
    expect(toExcel(rows).header).toEqual(["", "39"]);
  });
});
```

`lab/reports/vl-tested-by-lab/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [{ testing_facility: "Lab A", total: 10, suppressed: 7, not_suppressed: 3 }];

describe("vl-tested-by-lab", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories tested_samples", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tested_samples/");
  });
  it("stacks CV > 1000 and CV < 1000 per lab", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series.map((s) => s.data[0])).toEqual([3, 7]);
  });
  it("exports with a Laboratório header", () => {
    expect(toExcel(rows).header).toEqual(["Laboratório", "Lab A"]);
  });
});
```

`lab/reports/vl-tested-by-month/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tested-by-month", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories tested_samples_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, ["PMB"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/tested_samples_by_month/", { interval_dates: "2026-01-01,2026-12-31", lab_code: ["PMB"] }, "t");
  });
  it("labels by month", () => {
    const c = toChart([{ year: 2026, month: 5, month_name: "May", total: 3, suppressed: 2, not_suppressed: 1 }]);
    expect(c.labels).toEqual(["Mai/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2]);
  });
});
```

`lab/reports/vl-tat-by-lab/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tat-by-lab", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories tat_by_lab", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tat_by_lab/");
  });
  it("stacks the 4 segments per lab", () => {
    const c = toChart([
      { testing_facility: "Lab A", collection_reception: 1, reception_registration: 2, registration_analysis: 3, analysis_validation: 4 },
    ]);
    expect(c.labels).toEqual(["Lab A"]);
    expect(c.series).toHaveLength(4);
  });
});
```

`lab/reports/vl-tat-by-month/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-tat-by-month", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories tat_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/tat_by_month/");
  });
  it("labels by month", () => {
    const c = toChart([
      { year: 2026, month: 1, month_name: "January", collection_reception: 1, reception_registration: null, registration_analysis: 3, analysis_validation: 4 },
    ]);
    expect(c.labels).toEqual(["Jan/26"]);
    expect(c.series[1].data).toEqual([0]);
  });
});
```

`lab/reports/vl-rejected-by-lab/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

describe("vl-rejected-by-lab", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories rejected_samples", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, ["PJC"], "t");
    expect(vlGet).toHaveBeenCalledWith("/laboratories/rejected_samples/", { interval_dates: "2026-01-01,2026-12-31", lab_code: ["PJC"] }, "t");
  });
  it("has one red series of rejected totals per lab", () => {
    const rows = [{ lab_code: "PJC", testing_facility: "Jose Macamo", total: 12 }];
    expect(toChart(rows).series).toEqual([{ name: "Amostras Rejeitadas", color: "#ef5350", data: [12] }]);
    expect(toExcel(rows)).toEqual({ header: ["Laboratório", "Jose Macamo"], rows: [["Amostras Rejeitadas", 12]] });
  });
});
```

`lab/reports/vl-rejected-by-month/actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart } from "./actions";

describe("vl-rejected-by-month", () => {
  beforeEach(() => vlGet.mockReset().mockResolvedValue([]));
  it("fetches laboratories rejected_samples_by_month", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-12-31" }, [], "t");
    expect(vlGet.mock.calls[0][0]).toBe("/laboratories/rejected_samples_by_month/");
  });
  it("has one orange series by month", () => {
    const c = toChart([{ year: 2026, month: 3, month_name: "March", total: 4 }]);
    expect(c).toEqual({ labels: ["Mar/26"], series: [{ name: "Amostras Rejeitadas", color: "#fb8c00", data: [4] }] });
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL. `labParams` is not exported, and `./actions` does not resolve in the 8 lab folders.

- [ ] **Step 3: Add `labParams` to `lib/vl/labs.ts`**

```ts
import type { Params } from "./api";
import { intervalParam, type DateRange } from "./dates";

export const labParams = (range: DateRange, codes: string[]): Params => ({
  interval_dates: intervalParam(range),
  lab_code: codes,
});
```

Put the imports at the top of the file.

- [ ] **Step 4: Implement `constants.ts` and `actions.ts` for the 8 cards**

`vl-weekly-report-by-lab/constants.ts`:

```ts
export const CARD_ID = "vl-weekly-report-by-lab";
export const TITLE = "Relatório Semanal (por lab)";
export const ENDPOINT = "/laboratories/weekly_report/";
```

`vl-weekly-report-by-lab/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { num } from "@/lib/vl/format";
import { labParams } from "@/lib/vl/labs";
import type { ChartModel } from "@/lib/vl/series";
import type { WeeklyLabRow } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<WeeklyLabRow[]>(ENDPOINT, labParams(range, codes), token);

export function toChart(rows: WeeklyLabRow[]): ChartModel {
  const manyWeeks = new Set(rows.map((r) => r.week)).size > 1;
  return {
    labels: rows.map((r) => (manyWeeks ? `${r.lab_name} · ${r.week}` : r.lab_name)),
    series: [
      { name: "Registadas", color: "#00b000", data: rows.map((r) => num(r.registrations)) },
      { name: "Testadas", color: "#fb8c00", data: rows.map((r) => num(r.tests)) },
      { name: "Não processadas", color: "#e74c3c", data: rows.map((r) => num(r.backlogs)) },
      { name: "Capacidade", color: "#7868e6", data: rows.map((r) => num(r.capacity)) },
      { name: "TRL", type: "line", yAxis: 1, color: "#37474f", data: rows.map((r) => num(r.tat)) },
    ],
  };
}

export function toExcel(rows: WeeklyLabRow[]): ExcelSheet {
  return {
    header: ["", ...toChart(rows).labels],
    rows: [
      ["Amostras Registadas", ...rows.map((r) => r.registrations)],
      ["Amostras Testadas", ...rows.map((r) => r.tests)],
      ["Amostras não processadas", ...rows.map((r) => r.backlogs)],
      ["Amostras Rejeitadas", ...rows.map((r) => r.rejections)],
      ["Capacidade Laboratorial (85%)", ...rows.map((r) => r.capacity)],
      ["Tempo de Resposta", ...rows.map((r) => r.tat)],
    ],
  };
}
```

`vl-weekly-report-national/constants.ts`:

```ts
export const CARD_ID = "vl-weekly-report-national";
export const TITLE = "Relatório Semanal";
export const ENDPOINT = "/laboratories/weekly_report_national/";
```

`vl-weekly-report-national/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { num } from "@/lib/vl/format";
import { labParams } from "@/lib/vl/labs";
import type { ChartModel } from "@/lib/vl/series";
import type { WeeklyNationalRow } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<WeeklyNationalRow[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: WeeklyNationalRow[]): ChartModel => ({
  labels: rows.map((r) => r.week),
  series: [
    { name: "Registadas", color: "#00b000", data: rows.map((r) => num(r.registrations)) },
    { name: "Testadas", color: "#fb8c00", data: rows.map((r) => num(r.tests)) },
    { name: "Não processadas", color: "#e74c3c", data: rows.map((r) => num(r.backlogs)) },
    { name: "Capacidade", type: "line", color: "#7868e6", data: rows.map((r) => num(r.capacity)) },
    { name: "TRL", type: "line", yAxis: 1, color: "#37474f", data: rows.map((r) => num(r.tat)) },
  ],
});

export const toExcel = (rows: WeeklyNationalRow[]): ExcelSheet => ({
  header: ["", ...rows.map((r) => r.week)],
  rows: [
    ["Amostras Registadas", ...rows.map((r) => r.registrations)],
    ["Amostras Testadas", ...rows.map((r) => r.tests)],
    ["Amostras não processadas", ...rows.map((r) => r.backlogs)],
    ["Amostras Rejeitadas", ...rows.map((r) => r.rejections)],
    ["Capacidade Laboratorial (85%)", ...rows.map((r) => r.capacity)],
    ["Tempo de Resposta", ...rows.map((r) => r.tat)],
  ],
});
```

`vl-tested-by-lab/constants.ts`:

```ts
export const CARD_ID = "vl-tested-by-lab";
export const TITLE = "Amostras Testadas por Lab";
export const ENDPOINT = "/laboratories/tested_samples/";
```

`vl-tested-by-lab/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TestedByLab[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TestedByLab[]): ChartModel => ({
  labels: rows.map((r) => r.testing_facility),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByLab[]) => chartToSheet(toChart(rows), "Laboratório");
```

`vl-tested-by-month/constants.ts`:

```ts
export const CARD_ID = "vl-tested-by-month";
export const TITLE = "Amostras Testadas por mês";
export const ENDPOINT = "/laboratories/tested_samples_by_month/";
```

`vl-tested-by-month/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TestedByMonth[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TestedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByMonth[]) => chartToSheet(toChart(rows), "Mês");
```

`vl-tat-by-lab/constants.ts`:

```ts
export const CARD_ID = "vl-tat-by-lab";
export const TITLE = "Tempo de Resposta por Lab";
export const ENDPOINT = "/laboratories/tat_by_lab/";
```

`vl-tat-by-lab/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TatByLab[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TatByLab[]): ChartModel => ({
  labels: rows.map((r) => r.testing_facility),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByLab[]) => chartToSheet(toChart(rows), "Tempo Resposta");
```

`vl-tat-by-month/constants.ts`:

```ts
export const CARD_ID = "vl-tat-by-month";
export const TITLE = "Tempo de Resposta por mês";
export const ENDPOINT = "/laboratories/tat_by_month/";
```

`vl-tat-by-month/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<TatByMonth[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[]) => chartToSheet(toChart(rows), "Tempo Resposta");
```

`vl-rejected-by-lab/constants.ts`:

```ts
export const CARD_ID = "vl-rejected-by-lab";
export const TITLE = "Amostras Rejeitadas por Lab";
export const ENDPOINT = "/laboratories/rejected_samples/";
```

`vl-rejected-by-lab/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import type { DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RejectedByLab } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<RejectedByLab[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: RejectedByLab[]): ChartModel => ({
  labels: rows.map((r) => r.testing_facility),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByLab[]) => chartToSheet(toChart(rows), "Laboratório");
```

`vl-rejected-by-month/constants.ts`:

```ts
export const CARD_ID = "vl-rejected-by-month";
export const TITLE = "Amostras Rejeitadas por mês";
export const ENDPOINT = "/laboratories/rejected_samples_by_month/";
```

`vl-rejected-by-month/actions.ts`:

```ts
import { vlGet } from "@/lib/vl/api";
import { monthLabel, type DateRange } from "@/lib/vl/dates";
import { labParams } from "@/lib/vl/labs";
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RejectedByMonth } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export const fetchData = (range: DateRange, codes: string[], token: string | null) =>
  vlGet<RejectedByMonth[]>(ENDPOINT, labParams(range, codes), token);

export const toChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: singleSeries("Amostras Rejeitadas", "#fb8c00", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByMonth[]) => chartToSheet(toChart(rows), "Mês");
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 6: Create `components/lab-report-card.tsx`**

```tsx
"use client";

import { useLabReport } from "@/hooks/use-report";
import type { DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { chartDomId } from "@/lib/vl/export/chart-id";
import type { ChartModel } from "@/lib/vl/series";
import { ComboChart } from "./charts/combo-chart";
import { StackedChart } from "./charts/stacked-chart";
import { LabGroupsDialog } from "./lab-groups-dialog";
import { ReportCard } from "./report-card";

export type LabReportCardProps<Row> = {
  cardId: string;
  title: string;
  fetchData: (range: DateRange, codes: string[], token: string | null) => Promise<Row[]>;
  toChart: (rows: Row[]) => ChartModel;
  toExcel: (rows: Row[]) => ExcelSheet;
  documentation: React.ReactNode;
  chart?: "stacked" | "combo";
  yTitles?: [string, string?];
  initialRange?: () => DateRange;
};

export function LabReportCard<Row>(props: LabReportCardProps<Row>) {
  const r = useLabReport(props.fetchData, props.initialRange);
  const rows = r.data ?? [];
  const model = props.toChart(rows);
  const id = chartDomId(props.cardId);
  return (
    <>
      <ReportCard
        title={props.title}
        subtitle={r.subtitle}
        cardId={props.cardId}
        reportType="national"
        loading={r.loading}
        error={r.error}
        empty={rows.length === 0}
        onRetry={r.retry}
        onSubmit={r.onSubmit}
        onRestart={r.onRestart}
        onSelectLabs={r.openLabs}
        excel={() => props.toExcel(rows)}
        documentation={props.documentation}
      >
        {props.chart === "combo" ? (
          <ComboChart id={id} labels={model.labels} series={model.series} yTitles={props.yTitles} />
        ) : (
          <StackedChart id={id} model={model} />
        )}
      </ReportCard>
      <LabGroupsDialog {...r.labsDialog} />
    </>
  );
}
```

- [ ] **Step 7: Write the 8 `index.tsx` files**

The pattern, shown for `vl-tested-by-lab/index.tsx`:

```tsx
"use client";

import { LabReportCard } from "@/components/lab-report-card";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByLab() {
  return (
    <LabReportCard
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
    />
  );
}
```

Write the other seven the same way. Only the component name and these extra props change:

| Folder | Component name | Extra props |
|---|---|---|
| `vl-weekly-report-by-lab` | `VlWeeklyReportByLab` | `chart="combo" yTitles={["Amostras", "TRL (dias)"]} initialRange={legacyWeek}`. Import `legacyWeek` from `@/lib/vl/dates`. |
| `vl-weekly-report-national` | `VlWeeklyReportNational` | `chart="combo" yTitles={["Amostras", "TRL (dias)"]} initialRange={lastTwelveWeeks}`. Import `lastTwelveWeeks` from `@/lib/vl/dates`. |
| `vl-tested-by-month` | `VlTestedByMonth` | none |
| `vl-tat-by-lab` | `VlTatByLab` | none |
| `vl-tat-by-month` | `VlTatByMonth` | none |
| `vl-rejected-by-lab` | `VlRejectedByLab` | none |
| `vl-rejected-by-month` | `VlRejectedByMonth` | none |

- [ ] **Step 8: Write the 8 `docs.tsx` files**

Each file has the same shape:

```tsx
import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return <CardDocs overview="…" reading={[…]} filters={[…]} endpoint={ENDPOINT} notes={[…]} />;
}
```

Use this content for each folder:

| Folder | overview | reading | filters | notes |
|---|---|---|---|---|
| `vl-weekly-report-by-lab` | "Desempenho semanal de cada laboratório: amostras registadas, testadas, por processar, capacidade e tempo de resposta." | "Barras: Registadas, Testadas, Não processadas e Capacidade (eixo esquerdo).", "Linha: TRL médio em dias (eixo direito).", "Se o período tiver várias semanas, cada barra indica o laboratório e a semana." | "Intervalo de datas (por omissão, a semana completa mais recente; filtra pela data de início da semana).", "Laboratórios (menu 'Seleccionar laboratórios')." | "Fonte: relatórios semanais (ReportData)." |
| `vl-weekly-report-national` | "Totais nacionais semanais de registo, testagem, amostras por processar e capacidade, com o tempo de resposta médio." | "Barras: Registadas, Testadas e Não processadas.", "Linha roxa: Capacidade.", "Linha escura: TRL médio (eixo direito)." | "Intervalo de datas (por omissão, últimas 12 semanas).", "Laboratórios." | "O TRL nacional é a média simples dos TRL dos laboratórios." |
| `vl-tested-by-lab` | "Amostras testadas por laboratório, separadas por resultado de carga viral." | "CV > 1000: não suprimida.", "CV < 1000: suprimida." | "Intervalo de datas.", "Laboratórios (sem selecção: laboratórios convencionais, códigos P*)." | none |
| `vl-tested-by-month` | "Amostras testadas por mês de análise, separadas por resultado." | "CV > 1000 e CV < 1000 empilhados por mês." | "Intervalo de datas.", "Laboratórios (sem selecção: todos)." | none |
| `vl-tat-by-lab` | "Tempo médio de cada etapa do circuito da amostra, por laboratório." | "Quatro etapas empilhadas: Colheita à Recepção, Recepção ao Registo, Registo à Análise, Análise à Validação." | "Intervalo de datas.", "Laboratórios (sem selecção: convencionais, P*)." | "✱ Sem limite de 90 dias (o limite do sistema anterior nunca foi aplicado)." |
| `vl-tat-by-month` | "Tempo médio de cada etapa do circuito da amostra, por mês de análise." | "Quatro etapas empilhadas por mês." | "Intervalo de datas.", "Laboratórios (sem selecção: convencionais, P*)." | "✱ Sem limite de 90 dias." |
| `vl-rejected-by-lab` | "Amostras rejeitadas por laboratório, identificado pelo código no número da requisição." | "Uma barra por laboratório." | "Intervalo de datas (data de registo, ambos os dias incluídos).", "Laboratórios." | "Rejeitada = tem código de rejeição LIMS ou HIVVL." |
| `vl-rejected-by-month` | "Amostras rejeitadas por mês de registo." | "Uma barra por mês." | "Intervalo de datas (data de registo, ambos os dias incluídos).", "Laboratórios." | "Rejeitada = tem código de rejeição LIMS ou HIVVL." |

"none" means omit the `notes` prop.

- [ ] **Step 9: Replace `apps/vl/app/(dashboard)/lab/page.tsx`**

```tsx
"use client";

import VlWeeklyReportByLab from "./reports/vl-weekly-report-by-lab";
import VlWeeklyReportNational from "./reports/vl-weekly-report-national";
import VlTestedByLab from "./reports/vl-tested-by-lab";
import VlTestedByMonth from "./reports/vl-tested-by-month";
import VlTatByLab from "./reports/vl-tat-by-lab";
import VlTatByMonth from "./reports/vl-tat-by-month";
import VlRejectedByLab from "./reports/vl-rejected-by-lab";
import VlRejectedByMonth from "./reports/vl-rejected-by-month";

export default function LabPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
        <VlWeeklyReportByLab />
        <VlWeeklyReportNational />
        <VlTestedByLab />
        <VlTestedByMonth />
        <VlTatByLab />
        <VlTatByMonth />
        <VlRejectedByLab />
        <VlRejectedByMonth />
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Verify in the browser**

```bash
pnpm --filter=vl test && pnpm --filter=vl exec tsc --noEmit && pnpm --filter=vl lint
pnpm --filter=vl dev
```

Open `/lab`. Check:
- "Seleccionar laboratórios" opens the 16 groups.
- Choosing "Jose Macamo" refetches with `lab_code=PJC&lab_code=PJV` (check the Network tab), and the subtitle lists the lab.
- The weekly by-lab card defaults to last week (Sunday to Saturday).

If `DB_REPORT_DATA` is not set on the API, the two weekly cards show the server-error box and the other six still load.

- [ ] **Step 11: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add Laboratório page with weekly reports, tested, TAT and rejected cards"
```

---

### Task 6: Província/Distrito/US drill-down cards (8 cards)

Clicking a bar on these cards drills down: province → district → US. At US level, a click opens the patient list for Admins only (Ruling P9). Every clinic card renders through one generic `FacilityReportCard`, which Task 7 reuses without drill-down.

**Files:**
- Create: `apps/vl/components/facility-report-card.tsx`
- Modify: `apps/vl/lib/vl/patients.ts` (add `TESTED_PATIENTS`) and `apps/vl/lib/vl/patients.test.ts`
- Create, under `apps/vl/app/(dashboard)/clinic/reports/`, five files (`constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx`, `index.tsx`) for each of:
  - `vl-registered-by-facility`
  - `vl-tested-by-facility`
  - `vl-tested-by-gender-by-facility`
  - `vl-tat-by-facility`
  - `vl-tested-by-age`
  - `vl-tested-pregnant`
  - `vl-tested-breastfeeding`
  - `vl-rejected-by-facility`

**Interfaces:**
- Consumes: `useFacilityReport` and `PatientsDialog` (Task 3), `StackedChart` (Task 4), `ComboChart`, `PieChart`, `AgeRangeDialog`, plus the age helpers.
- Produces:
  - `TESTED_PATIENTS: PatientFilters`
  - `FacilityReportCard<Row>` with props `{ cardId, title, endpoint, toChart(rows), toExcel(rows, levelLabel), documentation, drill?, patientFilters?, extraParams?, chart?: "stacked" | "combo" | "pie", stacked?, pieColors?, footer?, extraOptions? }`

- [ ] **Step 1: Write the failing tests**

Append to `apps/vl/lib/vl/patients.test.ts`:

```ts
import { TESTED_PATIENTS } from "./patients";

describe("TESTED_PATIENTS", () => {
  it("lists tested samples by analysis date with a result (legacy ViralLoadResultCategory IS NOT NULL)", () => {
    expect(patientFilterParams(TESTED_PATIENTS)).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
    });
  });
});
```

Merge the import into the existing `./patients` import.

`clinic/reports/vl-registered-by-facility/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [{ requesting_facility: "Gaza", total: 12 }];

describe("vl-registered-by-facility", () => {
  it("uses registered_samples and registration-date patients", () => {
    expect(ENDPOINT).toBe("/facilities/registered_samples/");
    expect(PATIENT_FILTERS).toEqual({ date_basis: "registration" });
  });
  it("draws one red series per location and exports under the level label", () => {
    expect(toChart(rows)).toEqual({
      labels: ["Gaza"],
      series: [{ name: "Amostras Registadas", color: "#ef5350", data: [12] }],
    });
    expect(toExcel(rows, "Província")).toEqual({ header: ["Província", "Gaza"], rows: [["Amostras Registadas", 12]] });
  });
});
```

`clinic/reports/vl-tested-by-facility/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart, toExcel } from "./actions";

describe("vl-tested-by-facility", () => {
  it("uses tested_samples_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("stacks CV series per location", () => {
    const rows = [{ requesting_facility: "Chokwe", total: 5, suppressed: 4, not_suppressed: 1 }];
    expect(toChart(rows).series.map((s) => s.data[0])).toEqual([1, 4]);
    expect(toExcel(rows, "Distrito").header).toEqual(["Distrito", "Chokwe"]);
  });
});
```

`clinic/reports/vl-tested-by-gender-by-facility/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tested-by-gender-by-facility", () => {
  it("uses tested_samples_by_gender_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_gender_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("produces the 4 grouped gender series", () => {
    const c = toChart([
      { requesting_facility: "Gaza", total: 10, male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 },
    ]);
    expect(c.series.map((s) => s.group)).toEqual(["Homens", "Homens", "Mulheres", "Mulheres"]);
  });
});
```

`clinic/reports/vl-tat-by-facility/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TESTED_PATIENTS } from "@/lib/vl/patients";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tat-by-facility", () => {
  it("uses tat_by_facility and tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tat_by_facility/");
    expect(PATIENT_FILTERS).toEqual(TESTED_PATIENTS);
  });
  it("stacks TAT segments per location", () => {
    const c = toChart([
      { requesting_facility: "Gaza", collection_reception: 1, reception_registration: 2, registration_analysis: null, analysis_validation: 4 },
    ]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 0, 4]);
  });
});
```

`clinic/reports/vl-tested-by-age/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, patientFiltersFor } from "./constants";
import { sumByFacility, toChart } from "./actions";

const rows = [
  { requesting_facility: "Gaza", age_group: "15-19", total: 3, suppressed: 2, not_suppressed: 1 },
  { requesting_facility: "Gaza", age_group: "20-24", total: 4, suppressed: 4, not_suppressed: 0 },
  { requesting_facility: "Tete", age_group: "15-19", total: 1, suppressed: 0, not_suppressed: 1 },
];

describe("vl-tested-by-age", () => {
  it("uses tested_samples_by_age_by_facility and adds the age range to tested patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_age_by_facility/");
    expect(patientFiltersFor([15, 49])).toEqual({
      date_basis: "analysis",
      result_type: ["suppressed", "not_suppressed"],
      age_range: [15, 49],
    });
  });
  it("sums the age-group rows per location, keeping first-seen order", () => {
    expect(sumByFacility(rows)).toEqual([
      { requesting_facility: "Gaza", total: 7, suppressed: 6, not_suppressed: 1 },
      { requesting_facility: "Tete", total: 1, suppressed: 0, not_suppressed: 1 },
    ]);
    expect(toChart(rows).labels).toEqual(["Gaza", "Tete"]);
  });
});
```

`clinic/reports/vl-tested-pregnant/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tested-pregnant", () => {
  it("uses the pregnant by-facility endpoint and pregnant patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_pregnant_by_facility/");
    expect(PATIENT_FILTERS).toMatchObject({ pregnant: true, date_basis: "analysis" });
  });
  it("stacks CV series", () => {
    expect(toChart([{ requesting_facility: "Gaza", total: 2, suppressed: 1, not_suppressed: 1 }]).series).toHaveLength(2);
  });
});
```

`clinic/reports/vl-tested-breastfeeding/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-tested-breastfeeding", () => {
  it("uses the breastfeeding by-facility endpoint and breastfeeding patients", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_breastfeeding_by_facility/");
    expect(PATIENT_FILTERS).toMatchObject({ breastfeeding: true, date_basis: "analysis" });
  });
  it("stacks CV series", () => {
    expect(toChart([{ requesting_facility: "Gaza", total: 2, suppressed: 1, not_suppressed: 1 }]).series).toHaveLength(2);
  });
});
```

`clinic/reports/vl-rejected-by-facility/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, PATIENT_FILTERS } from "./constants";
import { toChart } from "./actions";

describe("vl-rejected-by-facility", () => {
  it("uses rejected_samples_by_facility and rejected patients", () => {
    expect(ENDPOINT).toBe("/facilities/rejected_samples_by_facility/");
    expect(PATIENT_FILTERS).toEqual({ rejected: true });
  });
  it("draws one red series", () => {
    expect(toChart([{ requesting_facility: "Gaza", total: 3 }]).series).toEqual([
      { name: "Amostras Rejeitadas", color: "#ef5350", data: [3] },
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL. `TESTED_PATIENTS` is undefined, and `./constants` / `./actions` do not resolve.

- [ ] **Step 3: Add `TESTED_PATIENTS` to `lib/vl/patients.ts`**

```ts
/** Tested-type drill-downs: analysis-date window, rows with a result (legacy "ViralLoadResultCategory IS NOT NULL"). */
export const TESTED_PATIENTS: PatientFilters = {
  date_basis: "analysis",
  result_type: ["suppressed", "not_suppressed"],
};
```

- [ ] **Step 4: Implement `constants.ts` and `actions.ts` for the 8 cards**

`vl-registered-by-facility/constants.ts`:

```ts
import type { PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-registered-by-facility";
export const TITLE = "Amostras Registadas por Província";
export const ENDPOINT = "/facilities/registered_samples/";
export const PATIENT_FILTERS: PatientFilters = { date_basis: "registration" };
```

`vl-registered-by-facility/actions.ts`:

```ts
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RegisteredByFacility } from "@/lib/vl/types";

export const toChart = (rows: RegisteredByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: singleSeries("Amostras Registadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RegisteredByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tested-by-facility/constants.ts`:

```ts
import { TESTED_PATIENTS } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-by-facility";
export const TITLE = "Amostras Testadas por Província";
export const ENDPOINT = "/facilities/tested_samples_by_facility/";
export const PATIENT_FILTERS = TESTED_PATIENTS;
```

`vl-tested-by-facility/actions.ts`:

```ts
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByFacility } from "@/lib/vl/types";

export const toChart = (rows: TestedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tested-by-gender-by-facility/constants.ts`:

```ts
import { TESTED_PATIENTS } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-by-gender-by-facility";
export const TITLE = "Amostras Testadas por Província/sexo";
export const ENDPOINT = "/facilities/tested_samples_by_gender_by_facility/";
export const PATIENT_FILTERS = TESTED_PATIENTS;
```

`vl-tested-by-gender-by-facility/actions.ts`:

```ts
import { chartToSheet, genderSeries, type ChartModel } from "@/lib/vl/series";
import type { GenderByFacility } from "@/lib/vl/types";

export const toChart = (rows: GenderByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tat-by-facility/constants.ts`:

```ts
import { TESTED_PATIENTS } from "@/lib/vl/patients";

export const CARD_ID = "vl-tat-by-facility";
export const TITLE = "Tempo de Resposta por Província";
export const ENDPOINT = "/facilities/tat_by_facility/";
export const PATIENT_FILTERS = TESTED_PATIENTS;
```

`vl-tat-by-facility/actions.ts`:

```ts
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByFacility } from "@/lib/vl/types";

export const toChart = (rows: TatByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tested-by-age/constants.ts`:

```ts
import type { AgeRange } from "@/lib/vl/age";
import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-by-age";
export const TITLE = "Amostras Testadas por idade";
export const ENDPOINT = "/facilities/tested_samples_by_age_by_facility/";
export const patientFiltersFor = (age: AgeRange): PatientFilters => ({ ...TESTED_PATIENTS, age_range: age });
```

`vl-tested-by-age/actions.ts`:

```ts
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { AgeByFacility, TestedByFacility } from "@/lib/vl/types";

/** The API returns one row per location and age group; the card shows one bar per location. */
export function sumByFacility(rows: AgeByFacility[]): TestedByFacility[] {
  const byName = new Map<string, TestedByFacility>();
  for (const r of rows) {
    const acc = byName.get(r.requesting_facility) ?? { requesting_facility: r.requesting_facility, total: 0, suppressed: 0, not_suppressed: 0 };
    acc.total += r.total ?? 0;
    acc.suppressed += r.suppressed ?? 0;
    acc.not_suppressed += r.not_suppressed ?? 0;
    byName.set(r.requesting_facility, acc);
  }
  return [...byName.values()];
}

export function toChart(rows: AgeByFacility[]): ChartModel {
  const summed = sumByFacility(rows);
  return { labels: summed.map((r) => r.requesting_facility), series: cvSeries(summed) };
}

export const toExcel = (rows: AgeByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tested-pregnant/constants.ts`:

```ts
import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-pregnant";
export const TITLE = "Amostras Testadas (Mulheres Grávidas)";
export const ENDPOINT = "/facilities/tested_samples_pregnant_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { ...TESTED_PATIENTS, pregnant: true };
```

`vl-tested-pregnant/actions.ts`:

```ts
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByFacility } from "@/lib/vl/types";

export const toChart = (rows: TestedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-tested-breastfeeding/constants.ts`:

```ts
import { TESTED_PATIENTS, type PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-tested-breastfeeding";
export const TITLE = "Amostras Testadas (Mulheres Lactantes)";
export const ENDPOINT = "/facilities/tested_samples_breastfeeding_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { ...TESTED_PATIENTS, breastfeeding: true };
```

`vl-tested-breastfeeding/actions.ts`:

```ts
import { chartToSheet, cvSeries, type ChartModel } from "@/lib/vl/series";
import type { TestedByFacility } from "@/lib/vl/types";

export const toChart = (rows: TestedByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: cvSeries(rows),
});

export const toExcel = (rows: TestedByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

`vl-rejected-by-facility/constants.ts`:

```ts
import type { PatientFilters } from "@/lib/vl/patients";

export const CARD_ID = "vl-rejected-by-facility";
export const TITLE = "Amostras Rejeitadas por Província";
export const ENDPOINT = "/facilities/rejected_samples_by_facility/";
export const PATIENT_FILTERS: PatientFilters = { rejected: true };
```

`vl-rejected-by-facility/actions.ts`:

```ts
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RegisteredByFacility } from "@/lib/vl/types";

export const toChart = (rows: RegisteredByFacility[]): ChartModel => ({
  labels: rows.map((r) => r.requesting_facility),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RegisteredByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 6: Create `components/facility-report-card.tsx`**

```tsx
"use client";

import type { MainCardHeaderOptions } from "@repo/design_system/app/molecules/cards/MainCardHeader";
import { useFacilityReport } from "@/hooks/use-facility-report";
import type { Params } from "@/lib/vl/api";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { chartDomId } from "@/lib/vl/export/chart-id";
import type { PatientFilters } from "@/lib/vl/patients";
import type { ChartModel } from "@/lib/vl/series";
import { ComboChart } from "./charts/combo-chart";
import { PieChart } from "./charts/pie-chart";
import { StackedChart } from "./charts/stacked-chart";
import { PatientsDialog } from "./patients-dialog";
import { ReportCard } from "./report-card";

export type FacilityReportCardProps<Row> = {
  cardId: string;
  title: string;
  endpoint: string;
  toChart: (rows: Row[]) => ChartModel;
  toExcel: (rows: Row[], levelLabel: string) => ExcelSheet;
  documentation: React.ReactNode;
  drill?: boolean;
  patientFilters?: PatientFilters;
  extraParams?: Params;
  chart?: "stacked" | "combo" | "pie";
  stacked?: boolean;
  pieColors?: string[];
  footer?: React.ReactNode;
  extraOptions?: MainCardHeaderOptions[];
};

export function FacilityReportCard<Row>(props: FacilityReportCardProps<Row>) {
  const r = useFacilityReport<Row>({
    endpoint: props.endpoint,
    extraParams: props.extraParams,
    patientFilters: props.patientFilters,
  });
  const model = props.toChart(r.rows);
  const id = chartDomId(props.cardId);
  const onClick = props.drill ? r.onChartClick : undefined;
  const hint = props.drill ? r.facilityHint : null;
  const footer =
    props.footer || hint ? (
      <div className="space-y-1 px-4 pb-3 text-xs text-muted-foreground">
        {props.footer}
        {hint && <p>{hint}</p>}
      </div>
    ) : undefined;

  return (
    <>
      <ReportCard
        title={props.title}
        subtitle={r.subtitle}
        cardId={props.cardId}
        reportType="facility"
        loading={r.loading}
        error={r.error}
        empty={r.rows.length === 0}
        onRetry={r.retry}
        onSubmit={r.onSubmit}
        onRestart={r.onRestart}
        extraOptions={props.extraOptions}
        excel={() => props.toExcel(r.rows, r.levelLabel)}
        documentation={props.documentation}
        footer={footer}
      >
        {props.chart === "pie" ? (
          <PieChart id={id} labels={model.labels} values={model.series[0]?.data ?? []} colors={props.pieColors ?? []} />
        ) : props.chart === "combo" ? (
          <ComboChart id={id} labels={model.labels} series={model.series} stacked={props.stacked} onClick={onClick} />
        ) : (
          <StackedChart id={id} model={model} onClick={onClick} />
        )}
      </ReportCard>
      {props.drill && <PatientsDialog state={r.patients} subtitle={r.subtitle} onClose={r.closePatients} />}
    </>
  );
}
```

- [ ] **Step 7: Write the 8 `index.tsx` files**

The pattern, shown for `vl-tested-by-facility/index.tsx`:

```tsx
"use client";

import { FacilityReportCard } from "@/components/facility-report-card";
import { CARD_ID, ENDPOINT, PATIENT_FILTERS, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByFacility() {
  return (
    <FacilityReportCard
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      patientFilters={PATIENT_FILTERS}
      drill
    />
  );
}
```

Write these the same way:

| Folder | Component name | Extra props |
|---|---|---|
| `vl-registered-by-facility` | `VlRegisteredByFacility` | none |
| `vl-tested-by-gender-by-facility` | `VlTestedByGenderByFacility` | `chart="combo" stacked` |
| `vl-tat-by-facility` | `VlTatByFacility` | none |
| `vl-tested-pregnant` | `VlTestedPregnant` | none |
| `vl-tested-breastfeeding` | `VlTestedBreastfeeding` | none |
| `vl-rejected-by-facility` | `VlRejectedByFacility` | none |

`vl-tested-by-age/index.tsx` holds the age state:

```tsx
"use client";

import { useState } from "react";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { AgeRangeDialog } from "@/components/age-range-dialog";
import { FacilityReportCard } from "@/components/facility-report-card";
import { ageRangeParam, DEFAULT_AGE_RANGE, type AgeRange } from "@/lib/vl/age";
import { CARD_ID, ENDPOINT, patientFiltersFor, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByAge() {
  const [age, setAge] = useState<AgeRange>(DEFAULT_AGE_RANGE);
  const [open, setOpen] = useState(false);
  return (
    <>
      <FacilityReportCard
        cardId={CARD_ID}
        title={TITLE}
        endpoint={ENDPOINT}
        toChart={toChart}
        toExcel={toExcel}
        documentation={<Docs />}
        patientFilters={patientFiltersFor(age)}
        extraParams={{ age_range: ageRangeParam(age) }}
        footer={<p>Idade: {age[0]}-{age[1]} anos</p>}
        extraOptions={[
          {
            label: "Alterar faixa etária",
            icon: <TbAdjustmentsHorizontal size={20} />,
            type: "primary",
            action: () => setOpen(true),
          },
        ]}
        drill
      />
      <AgeRangeDialog
        open={open}
        onOpenChange={setOpen}
        value={age}
        onApply={(next) => {
          setAge(next);
          setOpen(false);
        }}
      />
    </>
  );
}
```

- [ ] **Step 8: Write the 8 `docs.tsx` files**

Use the `CardDocs` shape from Task 5 Step 8. Every drill-down card shares this `filters` text:

```ts
[
  "Intervalo de datas (por omissão, últimos 12 meses).",
  "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
  "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
]
```

Write this text as a literal array in each of the eight `docs.tsx` files. Do not create a shared constant for docs text.

| Folder | overview | reading | notes |
|---|---|---|---|
| `vl-registered-by-facility` | "Amostras registadas por local requisitante." | "Uma barra por província, distrito ou unidade sanitária, conforme o nível." | "Janela pela data de registo." |
| `vl-tested-by-facility` | "Amostras testadas por local requisitante, separadas por resultado." | "CV > 1000: não suprimida.", "CV < 1000: suprimida." | "Janela pela data de análise." |
| `vl-tested-by-gender-by-facility` | "Amostras testadas por local e sexo, separadas por resultado." | "Coluna verde: homens. Coluna vermelha: mulheres. A parte clara indica CV > 1000." | "Sexo segundo o código HL7 (M/F)." |
| `vl-tat-by-facility` | "Tempo médio de cada etapa do circuito da amostra, por local requisitante." | "Quatro etapas empilhadas por local." | "✱ Sem limite de 90 dias.", "A lista de pacientes mostra as amostras com resultado, pela data de análise." |
| `vl-tested-by-age` | "Amostras testadas na faixa etária seleccionada, por local requisitante." | "CV > 1000 e CV < 1000 empilhados por local.", "A faixa etária aparece no rodapé." | "Faixa por omissão: 15–49 anos. Altere-a em 'Alterar faixa etária'." |
| `vl-tested-pregnant` | "Amostras testadas de mulheres grávidas, por local requisitante." | "CV > 1000 e CV < 1000 empilhados por local." | "Grávida = Sim/Yes, sem distinção de maiúsculas." |
| `vl-tested-breastfeeding` | "Amostras testadas de mulheres lactantes, por local requisitante." | "CV > 1000 e CV < 1000 empilhados por local." | "Lactante = Sim/Yes, sem distinção de maiúsculas." |
| `vl-rejected-by-facility` | "Amostras rejeitadas por local requisitante." | "Uma barra por local." | "Janela pela data de registo, ambos os dias incluídos.", "✱ Rejeitada = código de rejeição LIMS ou HIVVL (o sistema anterior exigia os dois)." |

- [ ] **Step 9: Verify (the page itself is wired in Task 7)**

```bash
pnpm --filter=vl test && pnpm --filter=vl exec tsc --noEmit && pnpm --filter=vl lint
```

Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add facility drill-down cards with Admin patient lists"
```

---

### Task 7: Província/Distrito/US non-drill cards (4) and the clinic page

**Files:**
- Create, under `apps/vl/app/(dashboard)/clinic/reports/`, five files (`constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx`, `index.tsx`) for each of:
  - `vl-tested-by-gender-by-month`
  - `vl-tat-by-facility-month`
  - `vl-test-reasons`
  - `vl-rejected-by-facility-month`
- Modify: `apps/vl/app/(dashboard)/clinic/page.tsx`

**Interfaces:**
- Consumes: `FacilityReportCard` (Task 6) without `drill`.

- [ ] **Step 1: Write the failing tests**

`clinic/reports/vl-tested-by-gender-by-month/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [
  { year: 2026, month: 4, month_name: "April", total: 10, male_suppressed: 1, male_not_suppressed: 2, female_suppressed: 3, female_not_suppressed: 4 },
];

describe("vl-tested-by-gender-by-month", () => {
  it("uses tested_samples_by_gender_by_month", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_gender_by_month/");
  });
  it("labels by month with the 4 gender series", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Abr/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4]);
    expect(toExcel(rows, "Província").header).toEqual(["Mês", "Abr/26"]);
  });
});
```

`clinic/reports/vl-tat-by-facility-month/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart } from "./actions";

describe("vl-tat-by-facility-month", () => {
  it("uses facilities tat_by_month (facility_type is sent: Ruling P10)", () => {
    expect(ENDPOINT).toBe("/facilities/tat_by_month/");
  });
  it("stacks the TAT segments by month", () => {
    const c = toChart([
      { year: 2026, month: 7, month_name: "July", collection_reception: 1, reception_registration: 1, registration_analysis: 1, analysis_validation: 1 },
    ]);
    expect(c.labels).toEqual(["Jul/26"]);
    expect(c.series).toHaveLength(4);
  });
});
```

`clinic/reports/vl-test-reasons/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT, PIE_COLORS } from "./constants";
import { toChart, toExcel } from "./actions";

const rows = [
  { requesting_facility: "Gaza", routine: 10, treatment_failure: 2, reason_not_specified: 1, total: 15 },
  { requesting_facility: "Tete", routine: 5, treatment_failure: 0, reason_not_specified: 3, total: 9 },
];

describe("vl-test-reasons", () => {
  it("uses the by-facility test-reason endpoint with 3 legacy colours", () => {
    expect(ENDPOINT).toBe("/facilities/tested_samples_by_test_reason_by_facility/");
    expect(PIE_COLORS).toEqual(["#00b000", "#fb8c00", "#ef5350"]);
  });
  it("sums the location rows into the 3 legacy slices, in legacy order", () => {
    expect(toChart(rows)).toEqual({
      labels: ["Motivo não especificado", "Rotina", "Falência Terapêutica"],
      series: [{ name: "Amostras", color: "#00b000", data: [4, 15, 2] }],
    });
  });
  it("exports one row of counts", () => {
    expect(toExcel(rows, "Província")).toEqual({
      header: ["", "Motivo não especificado", "Rotina", "Falência Terapêutica"],
      rows: [["Amostras", 4, 15, 2]],
    });
  });
});
```

`clinic/reports/vl-rejected-by-facility-month/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart } from "./actions";

describe("vl-rejected-by-facility-month", () => {
  it("uses facilities rejected_samples_by_month", () => {
    expect(ENDPOINT).toBe("/facilities/rejected_samples_by_month/");
  });
  it("has one red series by month", () => {
    expect(toChart([{ year: 2026, month: 9, month_name: "September", total: 6 }])).toEqual({
      labels: ["Set/26"],
      series: [{ name: "Amostras Rejeitadas", color: "#ef5350", data: [6] }],
    });
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `pnpm --filter=vl test`
Expected: FAIL. `./constants` and `./actions` do not resolve in the 4 folders.

- [ ] **Step 3: Implement `constants.ts` and `actions.ts`**

`vl-tested-by-gender-by-month/constants.ts`:

```ts
export const CARD_ID = "vl-tested-by-gender-by-month";
export const TITLE = "Amostras Testadas por Província/mês (sexo)";
export const ENDPOINT = "/facilities/tested_samples_by_gender_by_month/";
```

`vl-tested-by-gender-by-month/actions.ts`:

```ts
import { monthLabel } from "@/lib/vl/dates";
import { chartToSheet, genderSeries, type ChartModel } from "@/lib/vl/series";
import type { GenderByMonth } from "@/lib/vl/types";

export const toChart = (rows: GenderByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: genderSeries(rows),
});

export const toExcel = (rows: GenderByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
```

`vl-tat-by-facility-month/constants.ts`:

```ts
export const CARD_ID = "vl-tat-by-facility-month";
export const TITLE = "Tempo de Resposta por Província/mês";
export const ENDPOINT = "/facilities/tat_by_month/";
```

`vl-tat-by-facility-month/actions.ts`:

```ts
import { monthLabel } from "@/lib/vl/dates";
import { chartToSheet, tatSeries, type ChartModel } from "@/lib/vl/series";
import type { TatByMonth } from "@/lib/vl/types";

export const toChart = (rows: TatByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: tatSeries(rows),
});

export const toExcel = (rows: TatByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
```

`vl-test-reasons/constants.ts`:

```ts
export const CARD_ID = "vl-test-reasons";
export const TITLE = "Amostras Testadas por Motivo";
export const ENDPOINT = "/facilities/tested_samples_by_test_reason_by_facility/";
export const PIE_COLORS = ["#00b000", "#fb8c00", "#ef5350"];
```

`vl-test-reasons/actions.ts`:

```ts
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { sum } from "@/lib/vl/format";
import type { ChartModel } from "@/lib/vl/series";
import type { TestReasonByFacility } from "@/lib/vl/types";
import { PIE_COLORS } from "./constants";

const LABELS = ["Motivo não especificado", "Rotina", "Falência Terapêutica"];

/** The API returns one row per location; the legacy card showed national totals of 3 reasons. */
export const toChart = (rows: TestReasonByFacility[]): ChartModel => ({
  labels: LABELS,
  series: [
    {
      name: "Amostras",
      color: PIE_COLORS[0],
      data: [
        sum(rows.map((r) => r.reason_not_specified)),
        sum(rows.map((r) => r.routine)),
        sum(rows.map((r) => r.treatment_failure)),
      ],
    },
  ],
});

export function toExcel(rows: TestReasonByFacility[], _levelLabel: string): ExcelSheet {
  const chart = toChart(rows);
  return { header: ["", ...chart.labels], rows: [["Amostras", ...chart.series[0].data]] };
}
```

`vl-rejected-by-facility-month/constants.ts`:

```ts
export const CARD_ID = "vl-rejected-by-facility-month";
export const TITLE = "Amostras Rejeitadas por Província/mês";
export const ENDPOINT = "/facilities/rejected_samples_by_month/";
```

`vl-rejected-by-facility-month/actions.ts`:

```ts
import { monthLabel } from "@/lib/vl/dates";
import { chartToSheet, singleSeries, type ChartModel } from "@/lib/vl/series";
import type { RejectedByMonth } from "@/lib/vl/types";

export const toChart = (rows: RejectedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: singleSeries("Amostras Rejeitadas", "#ef5350", rows.map((r) => r.total)),
});

export const toExcel = (rows: RejectedByMonth[], _levelLabel: string) => chartToSheet(toChart(rows), "Mês");
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 5: Write `index.tsx` and `docs.tsx`**

The `index.tsx` files follow the Task 6 pattern **without** `drill` and without `patientFilters`:

| Folder | Component name | Extra props |
|---|---|---|
| `vl-tested-by-gender-by-month` | `VlTestedByGenderByMonth` | `chart="combo" stacked` |
| `vl-tat-by-facility-month` | `VlTatByFacilityMonth` | none |
| `vl-test-reasons` | `VlTestReasons` | `chart="pie" pieColors={PIE_COLORS}` (import `PIE_COLORS` from `./constants`) |
| `vl-rejected-by-facility-month` | `VlRejectedByFacilityMonth` | none |

The `docs.tsx` files use the Task 5 `CardDocs` shape. Their `filters` are `["Intervalo de datas (por omissão, últimos 12 meses).", "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores."]`.

| Folder | overview | reading | notes |
|---|---|---|---|
| `vl-tested-by-gender-by-month` | "Amostras testadas por mês e sexo, separadas por resultado." | "Coluna verde: homens. Coluna vermelha: mulheres. A parte clara indica CV > 1000." | "Inclui amostras sem província requisitante quando não há filtro de local." |
| `vl-tat-by-facility-month` | "Tempo médio de cada etapa do circuito da amostra, por mês, para os locais seleccionados." | "Quatro etapas empilhadas por mês." | "✱ Sem limite de 90 dias." |
| `vl-test-reasons` | "Distribuição das amostras testadas pelos três motivos de teste do portal anterior." | "Rotina, Falência Terapêutica e Motivo não especificado.", "Outros motivos (por exemplo, repetição após aleitamento) não aparecem, tal como no portal anterior." | "Os totais somam todos os locais da selecção." |
| `vl-rejected-by-facility-month` | "Amostras rejeitadas por mês de registo, para os locais seleccionados." | "Uma barra por mês." | "Janela pela data de registo, ambos os dias incluídos.", "✱ Rejeitada = código de rejeição LIMS ou HIVVL." |

- [ ] **Step 6: Replace `apps/vl/app/(dashboard)/clinic/page.tsx`**

```tsx
"use client";

import VlRegisteredByFacility from "./reports/vl-registered-by-facility";
import VlTestedByFacility from "./reports/vl-tested-by-facility";
import VlTestedByGenderByFacility from "./reports/vl-tested-by-gender-by-facility";
import VlTestedByGenderByMonth from "./reports/vl-tested-by-gender-by-month";
import VlTatByFacilityMonth from "./reports/vl-tat-by-facility-month";
import VlTatByFacility from "./reports/vl-tat-by-facility";
import VlTestedByAge from "./reports/vl-tested-by-age";
import VlTestedPregnant from "./reports/vl-tested-pregnant";
import VlTestedBreastfeeding from "./reports/vl-tested-breastfeeding";
import VlTestReasons from "./reports/vl-test-reasons";
import VlRejectedByFacilityMonth from "./reports/vl-rejected-by-facility-month";
import VlRejectedByFacility from "./reports/vl-rejected-by-facility";

export default function ClinicPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
        <VlRegisteredByFacility />
        <VlTestedByFacility />
        <VlTestedByGenderByFacility />
        <VlTestedByGenderByMonth />
        <VlTatByFacilityMonth />
        <VlTatByFacility />
        <VlTestedByAge />
        <VlTestedPregnant />
        <VlTestedBreastfeeding />
        <VlTestReasons />
        <VlRejectedByFacilityMonth />
        <VlRejectedByFacility />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify the drill-down in the browser, as an Admin and as a non-Admin**

```bash
pnpm --filter=vl test && pnpm --filter=vl exec tsc --noEmit && pnpm --filter=vl lint
pnpm --filter=vl dev
```

Open `/clinic`.

As an Admin:
- On "Amostras Testadas por Província", click a province. Districts appear, and the subtitle shows "… | Gaza".
- Click a district. Facilities appear.
- Click a facility. The patient dialog opens. In the Network tab, the request is `/hiv/vl/patients/by_facility/?…&health_facility=…&district=…&date_basis=analysis&result_type=suppressed&result_type=not_suppressed&page=1&per_page=500`.
- "Exportar para Excel" in the dialog downloads the 16 legacy columns.
- The age card's "Alterar faixa etária" option rejects 50–49 inline, and accepts 0–14 and refetches.

As a non-Admin (or after setting the user's role to `user` in the API DB):
- The Pacientes nav item is hidden.
- At facility level, a click does nothing, and the footer explains why.
- Choosing "Unidade Sanitária" in Editar shows the restricted-access message in the card, and the other cards keep working.

- [ ] **Step 8: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add remaining clinic cards and wire the Província/Distrito/US page"
```

---

### Task 8: Pacientes page (Admin only)

**Files:**
- Create, under `apps/vl/app/(dashboard)/patients/reports/vl-patients-search/`: `constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx`, `index.tsx`
- Modify: `apps/vl/app/(dashboard)/patients/page.tsx`

**Interfaces:**
- Consumes: `fetchPatients`, `PATIENT_HEADERS`, `patientToRow`, `TEST_REASON_LABEL` and `RESULT_TYPE_LABEL` (Task 2); `useAdminStatus` (Task 1); `PatientsTable` and `CardMessage` (Task 3); `createRequestGate`.
- Produces:
  - `type SearchMode = "name" | "facility" | "result" | "reason"`
  - `type SearchFilters`
  - `EMPTY_FILTERS`
  - `buildSearch(mode, filters, range): { endpoint: PatientEndpoint; params: Params } | { error: string }`
  - `pageSummary(page: PatientsPage | null): string`

- [ ] **Step 1: Write the failing test**

`patients/reports/vl-patients-search/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildSearch, EMPTY_FILTERS, pageSummary } from "./actions";

const range = { start: "2025-10-13", end: "2026-10-13" };

describe("buildSearch", () => {
  it("by name needs a first name or a surname, and trims them", () => {
    expect(buildSearch("name", EMPTY_FILTERS, range)).toEqual({ error: "Indique o nome ou o apelido." });
    expect(buildSearch("name", { ...EMPTY_FILTERS, surname: "  Silva " }, range)).toEqual({
      endpoint: "by_name",
      params: { interval_dates: "2025-10-13,2026-10-13", first_name: undefined, surname: "Silva" },
    });
  });

  it("by facility needs the facility; province and district are optional", () => {
    expect(buildSearch("facility", EMPTY_FILTERS, range)).toEqual({ error: "Indique o nome da unidade sanitária." });
    expect(buildSearch("facility", { ...EMPTY_FILTERS, facility: "CS Chokwe", district: "Chokwe" }, range)).toEqual({
      endpoint: "by_facility",
      params: { interval_dates: "2025-10-13,2026-10-13", health_facility: "CS Chokwe", province: undefined, district: ["Chokwe"] },
    });
  });

  it("by result and by reason need a choice", () => {
    expect(buildSearch("result", EMPTY_FILTERS, range)).toEqual({ error: "Escolha o tipo de resultado." });
    expect(buildSearch("result", { ...EMPTY_FILTERS, resultType: "not_suppressed" }, range)).toMatchObject({
      endpoint: "by_result_type",
      params: { result_type: ["not_suppressed"] },
    });
    expect(buildSearch("reason", EMPTY_FILTERS, range)).toEqual({ error: "Escolha o motivo de teste." });
    expect(buildSearch("reason", { ...EMPTY_FILTERS, testReason: "Routine" }, range)).toMatchObject({
      endpoint: "by_test_reason",
      params: { test_reason: ["Routine"] },
    });
  });
});

describe("pageSummary", () => {
  it("describes the page in Portuguese and never says 'página 1 de 0'", () => {
    expect(pageSummary(null)).toBe("");
    expect(pageSummary({ status: "success", page: 1, per_page: 50, total_count: 0, total_pages: 0, data: [] })).toBe(
      "0 pacientes · página 1 de 1",
    );
    expect(pageSummary({ status: "success", page: 2, per_page: 50, total_count: 120, total_pages: 3, data: [] })).toBe(
      "120 pacientes · página 2 de 3",
    );
  });
});
```

- [ ] **Step 2: Run the test to see it fail**

Run: `pnpm --filter=vl test`
Expected: FAIL with `Failed to resolve import "./actions"`.

- [ ] **Step 3: Implement `constants.ts` and `actions.ts`**

`constants.ts`:

```ts
export const CARD_ID = "vl-patients-search";
export const TITLE = "Resultados de Pacientes";
export const PER_PAGE_OPTIONS = [50, 100, 500];
```

`actions.ts`:

```ts
import type { Params } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { PatientEndpoint, PatientsPage, ResultType, TestReason } from "@/lib/vl/patients";

export type SearchMode = "name" | "facility" | "result" | "reason";

export type SearchFilters = {
  firstName: string;
  surname: string;
  facility: string;
  province: string;
  district: string;
  resultType: ResultType | "";
  testReason: TestReason | "";
};

export const EMPTY_FILTERS: SearchFilters = {
  firstName: "",
  surname: "",
  facility: "",
  province: "",
  district: "",
  resultType: "",
  testReason: "",
};

type Search = { endpoint: PatientEndpoint; params: Params } | { error: string };

const optionalList = (value: string) => (value.trim() ? [value.trim()] : undefined);

export function buildSearch(mode: SearchMode, f: SearchFilters, range: DateRange): Search {
  const base = { interval_dates: intervalParam(range) };
  switch (mode) {
    case "name":
      if (!f.firstName.trim() && !f.surname.trim()) return { error: "Indique o nome ou o apelido." };
      return {
        endpoint: "by_name",
        params: { ...base, first_name: f.firstName.trim() || undefined, surname: f.surname.trim() || undefined },
      };
    case "facility":
      if (!f.facility.trim()) return { error: "Indique o nome da unidade sanitária." };
      return {
        endpoint: "by_facility",
        params: { ...base, health_facility: f.facility.trim(), province: optionalList(f.province), district: optionalList(f.district) },
      };
    case "result":
      if (!f.resultType) return { error: "Escolha o tipo de resultado." };
      return { endpoint: "by_result_type", params: { ...base, result_type: [f.resultType] } };
    case "reason":
      if (!f.testReason) return { error: "Escolha o motivo de teste." };
      return { endpoint: "by_test_reason", params: { ...base, test_reason: [f.testReason] } };
  }
}

export const pageSummary = (page: PatientsPage | null): string =>
  page ? `${page.total_count} pacientes · página ${page.page} de ${Math.max(page.total_pages, 1)}` : "";
```

- [ ] **Step 4: Run the test to see it pass**

Run: `pnpm --filter=vl test`
Expected: PASS.

- [ ] **Step 5: Write `docs.tsx`**

```tsx
import { CardDocs } from "@/components/card-docs";

export default function Docs() {
  return (
    <CardDocs
      overview="Pesquisa de resultados de carga viral por paciente. Acesso exclusivo a Administradores."
      reading={[
        "Por Nome: nome e/ou apelido (contém, sem distinção de maiúsculas).",
        "Por US: nome exacto da unidade sanitária requisitante; província e distrito são opcionais.",
        "Por Resultado: CV < 1000 ou CV > 1000, pela data de análise.",
        "Por Motivo: motivo do teste, pela data de registo.",
      ]}
      filters={["Intervalo de datas (botão Editar; por omissão, últimos 12 meses).", "Resultados por página: 50, 100 ou 500."]}
      endpoint="/patients/{by_name|by_facility|by_result_type|by_test_reason}/"
      notes={["A exportação Excel inclui a página actual."]}
    />
  );
}
```

- [ ] **Step 6: Write `index.tsx`**

```tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { CardMessage } from "@/components/card-message";
import { PatientsTable } from "@/components/patients-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStatus } from "@/lib/vl/admin";
import { formatRangePt, lastYear, type DateRange } from "@/lib/vl/dates";
import { exportSheet } from "@/lib/vl/export/excel";
import {
  fetchPatients,
  PATIENT_HEADERS,
  patientToRow,
  RESULT_TYPE_LABEL,
  TEST_REASON_LABEL,
  type PatientsPage,
  type ResultType,
  type TestReason,
} from "@/lib/vl/patients";
import { createRequestGate } from "@/lib/vl/request-gate";
import { CARD_ID, PER_PAGE_OPTIONS, TITLE } from "./constants";
import { buildSearch, EMPTY_FILTERS, pageSummary, type SearchFilters, type SearchMode } from "./actions";
import Docs from "./docs";

const SELECT_CLASS = "h-9 w-full rounded-md border bg-transparent px-3 text-sm";

export default function VlPatientsSearch() {
  const status = useAdminStatus();
  const { user } = useUser();
  const { getToken } = useAuth();
  const gate = useRef(createRequestGate());
  const [range, setRange] = useState<DateRange>(lastYear);
  const [mode, setMode] = useState<SearchMode>("name");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[0]);
  const [result, setResult] = useState<PatientsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof SearchFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const run = useCallback(
    async (page: number, size: number = perPage) => {
      const search = buildSearch(mode, filters, range);
      if ("error" in search) {
        setError(search.error);
        setResult(null);
        return;
      }
      const id = gate.current.next();
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await fetchPatients(search.endpoint, search.params, page, size, token);
        if (gate.current.isCurrent(id)) setResult(data);
      } catch (e) {
        if (gate.current.isCurrent(id)) {
          setError(e instanceof Error ? e.message : "Ocorreu um erro.");
          setResult(null);
        }
      } finally {
        if (gate.current.isCurrent(id)) setLoading(false);
      }
    },
    [mode, filters, range, perPage, getToken],
  );

  const subtitle = formatRangePt(range);

  const options = useMemo(
    () => [
      {
        label: "Exportar para Excel",
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        type: "primary" as const,
        action: () => {
          if (result?.data.length) {
            exportSheet(TITLE, `${subtitle} | ${pageSummary(result)}`, { header: PATIENT_HEADERS, rows: result.data.map(patientToRow) });
          }
        },
      },
      {
        label: "Reiniciar o relatório",
        icon: <VscDebugRestart size={20} />,
        type: "primary" as const,
        action: () => {
          setRange(lastYear());
          setFilters(EMPTY_FILTERS);
          setResult(null);
          setError(null);
        },
      },
    ],
    [result, subtitle],
  );

  if (status === "unknown") return <MainCardSkeleton sx={{ width: "100%" }} />;
  if (status === "user") {
    return <CardMessage tone="error" message="Acesso restrito a utilizadores com permissão de Administrador." />;
  }

  return (
    <MainCard
      id={CARD_ID}
      title={TITLE}
      subtitle={subtitle}
      reportType="national"
      handleSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
      loading={loading}
      additionalOptions={options}
      documentation={<Docs />}
      user={{ name: user?.fullName ?? "", email: user?.primaryEmailAddress?.emailAddress ?? "" }}
      width="100%"
      height="auto"
    >
      <form
        className="space-y-4 px-4 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(1);
        }}
      >
        <Tabs
          value={mode}
          onValueChange={(v) => {
            setMode(v as SearchMode);
            setResult(null);
            setError(null);
          }}
        >
          <TabsList>
            <TabsTrigger value="name">Por Nome</TabsTrigger>
            <TabsTrigger value="facility">Por US</TabsTrigger>
            <TabsTrigger value="result">Por Resultado</TabsTrigger>
            <TabsTrigger value="reason">Por Motivo</TabsTrigger>
          </TabsList>
          <TabsContent value="name" className="grid gap-3 pt-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="p-first">Nome</Label>
              <Input id="p-first" value={filters.firstName} onChange={set("firstName")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-surname">Apelido</Label>
              <Input id="p-surname" value={filters.surname} onChange={set("surname")} />
            </div>
          </TabsContent>
          <TabsContent value="facility" className="grid gap-3 pt-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="p-facility">Unidade Sanitária (nome exacto)</Label>
              <Input id="p-facility" value={filters.facility} onChange={set("facility")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-province">Província (opcional)</Label>
              <Input id="p-province" value={filters.province} onChange={set("province")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-district">Distrito (opcional)</Label>
              <Input id="p-district" value={filters.district} onChange={set("district")} />
            </div>
          </TabsContent>
          <TabsContent value="result" className="pt-3 sm:max-w-xs">
            <Label htmlFor="p-result">Resultado</Label>
            <select id="p-result" className={SELECT_CLASS} value={filters.resultType} onChange={set("resultType")}>
              <option value="">Escolha…</option>
              {(Object.keys(RESULT_TYPE_LABEL) as ResultType[]).map((k) => (
                <option key={k} value={k}>{RESULT_TYPE_LABEL[k]}</option>
              ))}
            </select>
          </TabsContent>
          <TabsContent value="reason" className="pt-3 sm:max-w-xs">
            <Label htmlFor="p-reason">Motivo de teste</Label>
            <select id="p-reason" className={SELECT_CLASS} value={filters.testReason} onChange={set("testReason")}>
              <option value="">Escolha…</option>
              {(Object.keys(TEST_REASON_LABEL) as TestReason[]).map((k) => (
                <option key={k} value={k}>{TEST_REASON_LABEL[k]}</option>
              ))}
            </select>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-end gap-3">
          <Button type="submit" disabled={loading}>Pesquisar</Button>
          <div className="space-y-1">
            <Label htmlFor="p-per-page">Por página</Label>
            <select
              id="p-per-page"
              className={SELECT_CLASS}
              value={perPage}
              onChange={(e) => {
                const size = Number(e.target.value);
                setPerPage(size);
                if (result) run(1, size);
              }}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <CardMessage tone="error" message={error} />}

        {result &&
          (result.data.length === 0 ? (
            <CardMessage tone="empty" message="Nenhum paciente encontrado." />
          ) : (
            <div className="space-y-2">
              <PatientsTable rows={result.data} />
              <div className="flex items-center justify-between text-sm">
                <span>{pageSummary(result)}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={loading || result.page <= 1} onClick={() => run(result.page - 1)}>
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || result.page >= result.total_pages}
                    onClick={() => run(result.page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </form>
    </MainCard>
  );
}
```

- [ ] **Step 7: Replace `apps/vl/app/(dashboard)/patients/page.tsx`**

```tsx
"use client";

import VlPatientsSearch from "./reports/vl-patients-search";

export default function PatientsPage() {
  return (
    <div className="w-full">
      <VlPatientsSearch />
    </div>
  );
}
```

- [ ] **Step 8: Verify in the browser**

```bash
pnpm --filter=vl test && pnpm --filter=vl exec tsc --noEmit && pnpm --filter=vl lint
pnpm --filter=vl dev
```

As an Admin, on `/patients`:
- An empty name search shows "Indique o nome ou o apelido." and sends no request.
- A surname search returns a page. "Próxima" and "Anterior" page through it.
- Changing "Por página" to 500 reloads page 1.
- Excel downloads the 16 columns.

As a non-Admin, visit `/patients` directly. It shows the restricted-access message, and the nav has no Pacientes item.

- [ ] **Step 9: Commit**

```bash
git add apps/vl
git commit -m "feat(vl): add Admin-only Pacientes search page"
```

---

### Task 9: Final gates, Docker image and monorepo docs

**Files:**
- Modify: `openldr-monorepo/CLAUDE.md`. Add an "`apps/vl` — Portal de Carga Viral" section after the TB project structure, with 10–15 lines covering:
  - the pages;
  - `lib/vl` / `hooks` / `components`;
  - the card folder layout;
  - the admin probe;
  - `pnpm --filter=vl test`.

- [ ] **Step 1: Run every gate from a clean install**

```bash
pnpm install --frozen-lockfile
pnpm --filter=vl test
pnpm --filter=vl exec tsc --noEmit
pnpm --filter=vl lint
pnpm turbo run build --filter=vl
pnpm turbo run build --filter=tb
git diff --stat origin/main -- packages/
```

Expected:
- Every command passes.
- The last command shows only `packages/design_system_mui/src/templates/DashboardLayout.tsx` (Ruling P1).

- [ ] **Step 2: Build the Docker image (if Docker is available locally)**

```bash
docker build -f apps/vl/Dockerfile -t openldr-vl:local \
  --build-arg NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' apps/vl/.env.local | cut -d= -f2-)" .
docker run --rm -p 3001:3000 --env-file apps/vl/.env.local openldr-vl:local
```

Expected:
- The image builds, and http://localhost:3001 redirects to `/sign-in`.
- `docker run --rm openldr-vl:local id -u` prints `1000` (the container runs as `node`).

If the TB Dockerfile does not declare `ARG`s for the build-time `NEXT_PUBLIC_*` values, the build reads them from the environment that Coolify injects. In that case, record that the local check was skipped and why. Do not change the Dockerfile.

- [ ] **Step 3: Smoke-check the numbers against the legacy dashboard**

This is not the formal piece-3 sign-off, just a sanity check before the PR.

Pick one closed window, e.g. `2025-01-01,2025-12-31`, on both `pnpm --filter=vl dev` and https://cargaviral.openldr.org.mz. Compare:
- "Resumo de Indicadores", January column;
- "Amostras Testadas por Lab" for one lab;
- "Amostras Rejeitadas por Província" for one province.

Differences are expected only for ✱ items, such as rejections (OR instead of AND) and the inclusive end date. Write the numbers into the PR description.

- [ ] **Step 4: Update `CLAUDE.md` and commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe apps/vl in the monorepo guide"
```

- [ ] **Step 5: Stop and ask before pushing**

The push and the PR (`feat/vl-dashboard` → `main`) are outward-facing, so ask the user first.

When approved, follow the [Monorepo GitHub remote transferred] note: the local `origin` URL is stale, so create the PR with `gh api -X POST repos/Association-of-Public-Health-Labs/openldr-monorepo/pulls` and an explicit `head`.

The PR body must list:
- Rulings P1–P13;
- the smoke-check numbers;
- the piece-3 follow-ups: Coolify app, `vl.openldr.org.mz`, side-by-side sign-off, cutover;
- the remaining follow-ups: a facility picker for "Por US", a shared shell package, `/dict/laboratories` for the lab list, a backend `/auth/me` to replace the probe.

---

## Self-review notes (for the reviewer of this plan)

**Spec §5 coverage:**

| Spec section | Where |
|---|---|
| 5.1 shell | Task 1 |
| 5.2 Sumário | Task 4 |
| 5.2 Laboratório | Task 5 |
| 5.2 clinic | Tasks 6–7 |
| 5.2 Pacientes | Task 8 |
| 5.3 filters and windows | Task 2 `dates.ts`; Tasks 3–5 hooks |
| 5.3 `interval_dates` / `paramsSerializer` | Task 2 `api.ts` |
| 5.3 lab selection | P2, Task 5 |
| 5.3 drill-down | Task 2 `drill.ts`, Task 6 |
| 5.3 Admin from API | P3, Task 1 |
| 5.3 exports | Task 2 `excel.ts`, Task 3 `image.ts` |
| 5.3 errors and loading | Task 3 `ReportCard` / `CardMessage` |
| 5.3 display (% and month labels) | Task 2 |
| 5.4 Dockerfile | Task 1, verified in Task 9 |
| 5.4 Vitest per card | Tasks 4–8 |
| 5.4 CI gates | Task 9 |

**Spec text this plan overrides:**
- "no changes to shared packages" (P1);
- "LabDialog list provides LabCodes" (P2);
- "MapCard / Provinces", "TableCard", "MixedLineBar", "StackedWithLine" (P4, P5);
- "StatusCard ×3 with trend" (P13).

The piece-1 Python API needs no changes for this plan.
