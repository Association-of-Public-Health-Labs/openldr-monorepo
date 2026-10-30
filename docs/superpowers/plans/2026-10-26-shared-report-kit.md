# Shared Report Kit (Plan 2a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move VL's generic report code into `@repo/design_system`, so `apps/eid` (and later dashboards) import it instead of copying it. VL behaviour and VL's existing tests stay unchanged.

**Architecture:**
- **Pure logic** goes to `packages/design_system/src/lib/report/`, with its tests moving alongside: request gate, dates, format, geo, drill, series basics, combo options, export, TAT classes.
- **React hooks** go to `src/hooks/report/`.
- **Report components** go to `src/app/organisms/report/`.
- **App-specific needs** (the Clerk token and user, the app's API list fetcher, patient fetcher and admin status) reach the shared code through one context, `ReportProvider`, that each app mounts in its dashboard layout. The design system therefore never imports Clerk or an app's API module.
- **VL** keeps only what is VL-specific: its API base, types, CV/TAT series colours, the 16 lab groups, the patient filters and columns, and the transport page.

**Tech Stack:** Next 15.5, React 18, TypeScript, vitest, pnpm 9 workspaces, Tailwind v4.

**Not in this plan (my call, against spec §5.0):**
- **Transport components** move with plan 2e (EID Transporte). The EID transport response differs (`total_tested`, `no_collection_date`), so they are generalised when there's a second consumer. Only the pure TAT classes (`tat.ts`) move now.
- **Package choice:** everything goes to `@repo/design_system`, not `@repo/utilities`. The design system already has vitest and the non-visual helpers (`lib/period`, `weeks`, `format-number`); utilities has no test runner.

**Spec:** `docs/superpowers/specs/2026-10-26-eid-dashboard-migration-design.md` §5.0, plus the `openldr-dashboard` skill (`references/reference-apps.md`, last section).

**Repo and branch:** openldr-monorepo. Create a worktree from `origin/main` (db674ba or newer), branch `feat/shared-report-kit`. The work ships as one PR to `main`, which redeploys TB and VL.

## Global Constraints

- **No behaviour change for VL users.** The same cards, numbers, menus, Portuguese text, export file names and contents, drill-down, patient dialog and transport page.
- **VL's existing tests pass unchanged.** A test that moves with its code keeps its assertions word for word; only its import lines change. `pnpm --filter=vl test` must show the same total test count as before the move, summed with the moved tests now counted under `pnpm --filter=@repo/design_system test`.
- **No imports from the shared package into apps:**
  - Package code uses relative imports only. `@/` means the importing app's root.
  - The design system must not import `@clerk/nextjs`, `@/config/api` or anything under `apps/`.
- **Dependencies:** no new third-party packages. Only `xlsx`, `html2canvas`, `apexcharts` and `react-apexcharts` may be declared in `packages/design_system/package.json`, with the exact specifiers `apps/vl` uses (`^0.18.5`, `^1.4.1`, `^5.3.4`, `^1.7.0`). The `pnpm-lock.yaml` diff may touch only the `packages/design_system` importer. Never run a plain `pnpm install`.
- **Gates on every task:**
  - `pnpm --filter=vl test`
  - `pnpm --filter=@repo/design_system test`
  - `pnpm --filter=vl exec tsc --noEmit`
  - `pnpm --filter=tb exec tsc --noEmit`
  - `pnpm --filter=vl lint`
  - `pnpm turbo run build --filter=vl --filter=tb`
- **Commit trailer:** `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Exports keep their exact output.** The Excel file name, title, period rows and header cells, and the image export, including Tailwind `lab()`/`oklch()` colours and the transparent map image, must be the same as before. Task 1 moves the existing export tests unchanged. Task 5 adds a manual browser check.
2. **Out-of-order responses.** A slow old response must not overwrite a newer one after the hooks move. The `request-gate` tests move unchanged in Task 1, and Task 2 adds `test_latest_request_wins` for `runLatest`.
3. **TB must not break from the dependency and lockfile change.** It's the csstype pitfall. Task 1 builds TB and checks that the lockfile diff touches only the design-system importer.
4. **A component rendered outside `ReportProvider`** must fail loudly with a clear error, not silently send requests without a token. Task 2 adds `test_use_report_context_throws_outside_provider`.
5. **Non-admins** still see "A lista de pacientes está disponível apenas para Administradores." at facility level and never get the patients dialog (Task 4 test).

---

### Task 1: Pure report library and dependencies

**Files:**
- Create `packages/design_system/src/lib/report/` by moving each file with `git mv` so history is kept, then fixing imports:
  - `apps/vl/lib/vl/request-gate.ts`, `dates.ts`, `format.ts`, `geo.ts`, `drill.ts`, `combo-options.ts`
  - `export/{chart-id,excel,image,image-colors,image-trim}.ts`
  - `transport/tat.ts` → `lib/report/tat.ts`
  - the tests next to them (`*.test.ts`)
- Create `packages/design_system/src/lib/report/series.ts` with the generic part of VL's `series.ts`: `Series`, `ChartModel`, `singleSeries`, `chartToSheet`.
- Create `packages/design_system/src/lib/report/params.ts`: `export type Params = Record<string, string | string[] | number | undefined>`. Copy the exact type from `apps/vl/lib/vl/api.ts` and have `api.ts` re-export it.
- Modify `apps/vl/lib/vl/series.ts`: keep `TAT_SEGMENTS`, `tatSeries`, `cvSeries` and `genderSeries`, and import the moved names from `@repo/design_system/lib/report/series`.
- Modify every VL import of a moved file. Find them with `grep -rln "lib/vl/\(request-gate\|dates\|format\|geo\|drill\|combo-options\|export/\|transport/tat\)" apps/vl`.
- Modify `packages/design_system/package.json` (the 4 dependencies, exact specifiers) and `pnpm-lock.yaml`.

**Interfaces:**
- Produces import paths `@repo/design_system/lib/report/{request-gate,dates,format,geo,drill,combo-options,series,params,tat}` and `@repo/design_system/lib/report/export/{chart-id,excel,image,image-colors,image-trim}`. Every exported name stays the same as in VL.

- [ ] **Step 1: Record the baseline counts.** Run `pnpm --filter=vl test` and `pnpm --filter=@repo/design_system test` and note both totals in the report.
- [ ] **Step 2: Declare the four dependencies and update the lockfile only.** Run `pnpm install --lockfile-only`, then `git diff pnpm-lock.yaml`. The diff must touch only `importers['packages/design_system']`. If anything else changes (for example `csstype`), revert and stop with BLOCKED. Then run `pnpm install --frozen-lockfile`.
- [ ] **Step 3: Move the files and tests with `git mv` and rewrite the imports** (relative inside the package, `@repo/design_system/lib/report/...` in VL). The moved tests keep their assertions; they now run under the design-system vitest config (`src/**/*.test.{ts,tsx}`).
- [ ] **Step 4: Run the gates.** The VL test count plus the moved tests' count must equal the baseline total. Everything must be green, including the TB and VL builds.
- [ ] **Step 5: Commit** `refactor(design-system): shared report library moved from VL`.

### Task 2: `ReportProvider` and the report hooks

**Files:**
- Create `packages/design_system/src/hooks/report/report-context.tsx`.
- Create `packages/design_system/src/hooks/report/use-report.ts`, moved from `apps/vl/hooks/use-report.ts`.
- Test: `packages/design_system/src/hooks/report/use-report.test.ts`.
- Modify `apps/vl/app/(dashboard)/layout.tsx`: mount `ReportProvider`.
- Delete `apps/vl/hooks/use-report.ts`, and update the imports of VL's lab and range cards.

**Interfaces:**
- Produces:

```ts
export type AdminStatus = "admin" | "user" | "unknown";
export type ReportServices = {
  getToken: () => Promise<string | null>;
  user: { name: string; email: string };
  getList: <Row>(endpoint: string, params: Params, token: string | null) => Promise<Row[]>;
  fetchPatients?: (params: Params, token: string | null) => Promise<{ rows: Record<string, unknown>[]; total: number }>;
  adminStatus: AdminStatus;
};
export function ReportProvider(props: { value: ReportServices; children: React.ReactNode }): JSX.Element;
export function readReportServices(value: ReportServices | null): ReportServices; // pure; throws Error("ReportProvider em falta") when null
export function useReportServices(): ReportServices; // = readReportServices(useContext(ReportContext))
export function runLatest<T>(gate: RequestGate, id: number, result: T, apply: (r: T) => void): void; // pure: apply only if id is current
export function useReport<T>(load: (token: string | null) => Promise<T>, deps: unknown[]): ReportState<T>;
export function useRangeReport<T>(load, initial?): /* same return as VL today */;
export function useLabReport<T>(load: (range, codes: string[], token) => Promise<T>, toCodes: (labs: string[]) => string[], initial?): /* same return as VL today */;
```

- In VL's layout, `value` gets:
  - `getToken` from `useAuth()`
  - `user` from `useUser()`, mapped as `ReportCard` does today
  - `getList: (e, p, t) => vlGetList(e, p, t)`
  - `fetchPatients`, wrapping `fetchPatients("by_facility", …)` into `{rows: page.data, total: page.total_count}`
  - `adminStatus` from `useAdminStatus()`

  VL's lab cards pass `labCodes` (from `apps/vl/lib/vl/labs.ts`) as `toCodes`.

- [ ] **Step 1: Write the failing tests.**
  - `test_latest_request_wins`: two ids from one gate; `runLatest` applies only the newer one.
  - `test_use_report_context_throws_outside_provider`: calling the context reader outside the provider throws "ReportProvider em falta". Test the plain reader `readReportServices(ctxValue)` that `useReportServices` wraps, so no DOM is needed.
- [ ] **Step 2: Run them.** `pnpm --filter=@repo/design_system test` → FAIL.
- [ ] **Step 3: Implement.** The hook bodies stay as in VL, except that the token comes from `useReportServices().getToken` and lab codes come from `toCodes`.
- [ ] **Step 4: Run the gates.** All green, with the VL count unchanged.
- [ ] **Step 5: Commit** `refactor(design-system): report hooks behind ReportProvider`.

### Task 3: Report card, card message and charts

**Files:**
- Move to `packages/design_system/src/app/organisms/report/`, with `git mv`:
  - `apps/vl/components/report-card.tsx`
  - `card-message.tsx`
  - `charts/{stacked-chart,combo-chart,legend-totals}.tsx`
- Move `lab-report-card.tsx` too, but give it a `labsDialog` render prop in place of VL's `LabGroupsDialog` import.
- Modify the VL card `index.tsx` files and pages that import them.

**Interfaces:**
- Consumes: `useReportServices().user`, which replaces `useUser()` in `ReportCard`.
- Produces `@repo/design_system/app/organisms/report/{report-card,card-message,lab-report-card,charts/stacked-chart,charts/combo-chart,charts/legend-totals}`, with the same props as today. `LabReportCard` gains:
  - `labsDialog: (state: { open: boolean; onOpenChange: (o: boolean) => void; selected: string[]; onApply: (names: string[]) => void }) => React.ReactNode`
  - `toCodes: (labs: string[]) => string[]`

  VL passes `(s) => <LabGroupsDialog {...s} />` and `labCodes`.
- `card-message.tsx` uses the design system's own `cn` (`src/lib/utils`) in place of VL's `../lib/utils`.

- [ ] **Step 1: Move the files and wire VL.** These are presentational components without tests; correctness is proven by the gates plus Task 5's browser check.
- [ ] **Step 2: Run the gates.** All green; also grep that `packages/design_system/src` has no `@clerk/nextjs` and no `@/` imports.
- [ ] **Step 3: Commit** `refactor(design-system): shared report card and charts`.

### Task 4: Facility report: drill-down and patients dialog

**Files:**
- Move `apps/vl/hooks/use-facility-report.ts` → `packages/design_system/src/hooks/report/use-facility-report.ts`.
- Move `apps/vl/components/facility-report-card.tsx`, `patients-dialog.tsx` and `patients-table.tsx` → `packages/design_system/src/app/organisms/report/`.
- Create `packages/design_system/src/lib/report/patients.ts`, holding `PatientColumn`, `MAX_PER_PAGE = 500`, and the patients-to-Excel helper if it's generic. Check VL's `patients.ts`; VL-specific filters and column definitions stay in VL.
- Test: `packages/design_system/src/lib/report/facility.test.ts`.

**Interfaces:**
- Consumes `ReportServices.getList`, `fetchPatients`, `adminStatus` (Task 2), and the moved `drill`.
- Produces:
  - `useFacilityReport<Row>(config: { endpoint: string; extraParams?: Params; patientParams?: Params })`, with the same return as today. VL computes `patientParams` from `patientFilterParams(filters)` itself.
  - `FacilityReportCard` gains `patientColumns: PatientColumn[]` (`type PatientColumn = { key: string; label: string; format?: (v: unknown) => string }`). VL passes its current columns, in the same order with the same labels.
  - `facilityHint(level, adminStatus): string | null`, extracted pure.

- [ ] **Step 1: Write the failing tests.**
  - `test_facility_hint_for_users_only`:
    - `facilityHint("health_facility","user")` is "A lista de pacientes está disponível apenas para Administradores."
    - `"admin"` and `"unknown"` give `null`.
    - Other levels give `null`.
  - `test_patient_request_params`: a pure `patientRequestParams(range, action, patientParams)` returns `interval_dates`, `health_facility`, optional `district`, and the extra params, exactly as VL sends today.
- [ ] **Step 2: Run them.** → FAIL.
- [ ] **Step 3: Implement.** Move the code, extract both pure helpers, and use `getList`/`fetchPatients` from the provider. VL passes its columns and filters.
- [ ] **Step 4: Run the gates.** All green.
- [ ] **Step 5: Commit** `refactor(design-system): shared facility report and patients dialog`.

### Task 5: Docs and a browser check of VL

**Files:**
- Modify the `openldr-monorepo/CLAUDE.md` `apps/vl` section. Add a "Shared report kit (`@repo/design_system`)" section listing the paths from Tasks 1–4, `ReportProvider` and what an app must provide, and that transport components stay in VL until the EID Transporte page.

- [ ] **Step 1: Write the docs.**
- [ ] **Step 2: Browser check.** Start VL against dev with `NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz pnpm --filter=vl dev -p 3002`, after `rm -rf apps/vl/.next`. The user signs in. Then check:
  - Sumário, Laboratório, Província and Transporte render.
  - One lab card's lab dialog filters.
  - One facility card drills province → district → facility, and the patients dialog opens for an admin.
  - "Exportar para Excel" and "Exportar imagem" work on one card, and the map image is transparent.

  Record what was checked, with screenshots saved to the scratchpad.
- [ ] **Step 3: Commit** `docs: shared report kit`.
