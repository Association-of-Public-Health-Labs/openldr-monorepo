# EID App: Shell and Sumário (Plan 2b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `apps/eid` ("Portal de DPI") with the platform shell and a complete Sumário page (8 legacy cards) on `/hiv/eid/summary/*`. The other pages exist, empty and hidden.

**Architecture:**
- **Shared kit first (Task 1):** close the plan 2a follow-ups in `@repo/design_system`:
  - extra parameters on range and lab cards
  - the generic API helpers, the admin probe and the lab-groups dialog moved out of VL
- **App (Tasks 2–3):**
  - `apps/eid` copies VL's skeleton (scaffold guide).
  - `lib/eid/` holds the EID base path, types, series colours and labels.
- **Cards (Tasks 4–8):** each card uses the VL card folder (`constants.ts`, `actions.ts`, `actions.test.ts`, `docs.tsx`, thin `index.tsx`). Tasks 4–8 are independent of each other once Task 3 is done.

**Tech Stack:** Next 15.5, React 18, TypeScript, vitest, pnpm 9 + turbo, Tailwind v4, Clerk, ApexCharts.

**Spec:** `docs/superpowers/specs/2026-10-26-eid-dashboard-migration-design.md` (§5, Appendix A "Sumário"), plus `docs/superpowers/specs/2026-10-26-eid-api-handoff-notes.md` (API contracts R1–R23). Skill: `openldr-dashboard` (`scaffold-guide.md`, `report-guide.md`, `pitfalls.md`).

**Repo and branch:** openldr-monorepo, worktree `.claude/worktrees/eid-app`, branch `feat/eid-app` from `origin/main` ea4cf0f. One PR to `main`. TB and VL redeploy on merge because `packages/` changes; EID gets no Coolify app until plan 3a.

**Later plans:** 2c Laboratório, 2d Província/Distrito/US, 2e Pacientes + Transporte, 3a release.

## Global Constraints

- **All UI text in Portuguese**, matching TB/VL wording: "Exportar para Excel", "Últimos 12 meses", "Sem dados para o período e filtros seleccionados.". Card titles are the legacy titles, verbatim (Appendix A).
- **No duplicated generic code.** Anything EID needs from `apps/vl` outside `lib/vl/<domain>` moves to `packages/design_system` first. Never copy it.
- **Package rules (from plan 2a):**
  - Package code uses relative imports only.
  - `design_system` must not import `@clerk/nextjs`, `axios`, `@/…` or anything under `apps/`.
  - No new third-party dependencies anywhere.
- **VL behaviour unchanged.** VL's existing tests pass with only import lines changed. A test that moves keeps its assertions word for word.
- **Lockfile:** adding `apps/eid` changes `pnpm-lock.yaml`. Use `pnpm install --lockfile-only`. The diff may only add the `apps/eid` importer. If anything else re-resolves (the `csstype` pitfall), revert and stop with BLOCKED. Never run a plain `pnpm install`.
- **Dashboard stays hidden:** `ready: false` in `dashboards.ts`. Every page except `/` stays in `UNRELEASED_PAGES`.
- **API strings (R22):** `lab_type` is sent only as `conventional` or `poc`, never `all`. A default request sends no `lab_type` and no `category`, so it hits the API cache seeds.
- **Gates on every task:**
  - `pnpm --filter=eid test` (from Task 2)
  - `pnpm --filter=vl test`
  - `pnpm --filter=@repo/design_system test`
  - `pnpm --filter=eid exec tsc --noEmit` (from Task 2; this is the real type gate, because design_system compiles with `strict: false`)
  - `pnpm --filter=vl exec tsc --noEmit`
  - `pnpm --filter=tb exec tsc --noEmit`
  - `pnpm --filter=eid lint`
  - `pnpm --filter=vl lint`
  - `pnpm turbo run build --filter=eid --filter=vl --filter=tb`
- **Commit trailer:** `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Rulings (my calls; reversible)

- **E1. KPI tiles.** There are 4 tiles from `summary/indicators/` (no `lab_type`), summed over the months:
  - "Total de Amostras" = registered, 100%
  - "Amostras Registadas" = registered, 100%
  - "Amostras Testadas" = tested, tested ÷ registered
  - "Amostras Rejeitadas" = rejected, rejected ÷ registered

  Total and Registadas show the same number, as in the legacy (`SummaryReport`). The docs say so. Percentages are rounded to whole numbers, as in the legacy. The tiles use VL's `overview-status-cards` tile component, with sparklines from the monthly values and the trend of the last two complete months (`completeMonths`).
- **E2. Map colour.** The legacy map shades each province by `Positivity`. EID shades with `#fda92d`, with `ratio = positivity ÷ max(positivity of the provinces shown)`, and grey with no data. The tooltip shows Positividade, Registadas, Testadas, Convencional and PoC.
- **E3. Map drill (replaces `/province/[x]`, spec call 1):**
  - National: the map from `summary/indicators_by_province/`.
  - Province click: the province's district map, plus 3 tiles for that province from its `indicators_by_province` row (Registadas, Testadas, Positividade). The districts come from `facilities/key_indicators/` with `facility_type=province&province=<X>&disaggregation=true`.
  - District click: a facility table from `facilities/key_indicators/` with `facility_type=district&district=<D>&disaggregation=true`.
  - The district and facility levels have a Convencional/PoC segmented switch that sends `lab_type=conventional|poc` (✱1). The default is Convencional.
  - The facility table has columns Unidade sanitária, Registadas, Testadas, Rejeitadas, Pendentes, Positivas and Positividade, with a footer total.
  - Rows with a null name are grouped as "Sem …" (kit `withLocation`).
- **E4. TRL segment select.** It is a shadcn `Select` in the card body, above the chart, with the 6 segment labels.
  - The first view sends no `category`. The select shows segment 0 (the API default).
  - Choosing a segment sends `category=<0–5>`.
  - The title is `TRL - <segment label>`.
  - "Reiniciar o relatório" resets the segment to 0, with no `category` sent.
- **E5. Principais Indicadores.** Two tabs, Convencional and PoC (`lab_type=conventional|poc`); the default is Convencional. The `IndicatorsTable` has rows Registadas, Testadas, Rejeitadas and Pendentes, and one column per month.
- **E6. Positividade das Amostras.** A combo chart: a "Testadas" column series (left axis) and a "Positividade (%)" line (right axis) = `positivity` from the API (✱3). `conventional_positive` and `poc_positive` are not stacked as parts of `positive` (handoff: R8 NULL-analyzer rows); they appear only in the Excel export.
- **E7. API helpers in the kit.** `design_system` has no axios. The pure parts of `lib/vl/api.ts` therefore move (`ApiError`, `errorMessage`, `cleanParams`, plus a new `asList`), and each app keeps its own 10-line `get` wrapper around its `config/api` axios instance.
- **E8. Admin probe in the kit.** `AdminProvider` takes a `probe: () => Promise<number | null>` (HTTP status, or null on a network error) and an `enabled` flag. The app supplies them from Clerk and axios. The `AdminStatus` type is the one already in `report-context.tsx`.

## Review Focus

1. **Stale level on the map.** Click a province, then quickly click another (or go back home) while the first districts load. The view must never draw the previous province's rows. This is VL's `r.data?.province === province` guard. Task 6 test: `test_rows_for_other_province_are_ignored`.
2. **Switching lab-type tab or TRL segment while a request is in flight.** The slower old response must not overwrite the new one. The request gate covers `useReport`, but only if the new `deps` reach it. Task 1 test: `test_range_report_reloads_on_extra_deps`.
3. **Province names with accents or a different spelling** ("Zambézia" or "Zambezia", "Maputo Província" or "Maputo Provincia"). They must still colour the right map shape: `provinceKey` from the kit, never string equality. Task 6 test: `test_accented_province_matches_map_key`.
4. **Months with zero tested.** Positivity must be 0, never NaN or Infinity, in the chart and the Excel. KPI percentages with zero registered must show "0%". Tests in Tasks 4 and 5: `test_zero_registered_shows_zero_percent`, `test_zero_tested_month_plots_zero`.
5. **A non-admin on a fresh session.** The probe of `/hiv/eid/patients/by_facility/` returns 403: no Pacientes item in the nav, and no error toast. A 5xx is retried, then settles to "user". The probe tests move with the code (Task 1) and gain `test_eid_probe_path`.

---

### Task 1: Report kit follow-ups

**Files:**
- Modify `packages/design_system/src/hooks/report/use-report.ts`: `useRangeReport` and `useLabReport` take extra deps.
- Modify `packages/design_system/src/app/organisms/report/lab-report-card.tsx`: `extraParams`, `extraOptions`.
- Create `packages/design_system/src/lib/report/api.ts` (+ `api.test.ts`, moved from the matching parts of `apps/vl/lib/vl/api.test.ts`).
- Create `packages/design_system/src/hooks/report/admin.tsx` and `src/lib/report/admin-probe.ts`, moved with `git mv` from `apps/vl/lib/vl/admin.tsx` and `admin-probe.ts` (+ its test).
- Create `packages/design_system/src/app/organisms/report/lab-groups-dialog.tsx`, moved from `apps/vl/components/lab-groups-dialog.tsx`.
- Modify the VL callers:
  - `apps/vl/lib/vl/api.ts` keeps `VL_BASE`, `vlGet` and `vlGetList`, and re-exports `ApiError`, `errorMessage`, `cleanParams`
  - `apps/vl/lib/vl/admin.tsx` becomes a thin wrapper, so VL imports elsewhere don't change
  - the VL lab cards pass `groups={LAB_GROUPS}`

**Interfaces:**
- Produces:
  - `useRangeReport<T>(load: (range: DateRange, token: string | null) => Promise<T>, initial?: () => DateRange, deps?: unknown[])`. It reloads when `range` or any of `deps` changes. With `deps` omitted, behaviour is unchanged.
  - `useLabReport<T>(load, toCodes, initial?, deps?: unknown[])`, the same way.
  - `LabReportCardProps<Row>` gains:
    - `extraParams?: Params`. `fetchData` becomes `(range, codes, token, extra: Params) => Promise<Row[]>`; `extra` is `extraParams ?? {}` and the deps key is `JSON.stringify(extraParams ?? {})`.
    - `extraOptions?: MainCardHeaderOptions[]`, forwarded to `ReportCard`.
  - `@repo/design_system/lib/report/api`:
    - `class ApiError`, `errorMessage(status)`, `cleanParams(params)`
    - `asList<T>(data: unknown): T[]`, which throws `ApiError(errorMessage(500), 500)` when `data` is not an array
  - `@repo/design_system/lib/report/admin-probe`: `interpretProbe(status)`; `ADMIN_PROBE_PATH` stays in VL as a VL constant.
  - `@repo/design_system/hooks/report/admin`:
    - `AdminProvider({ enabled: boolean; probe: () => Promise<number | null>; children })`
    - `useAdminStatus()`, `useIsAdmin()`
    - retry delays `[2000, 5000]`, unchanged
  - `LabGroupsDialog({ open, onOpenChange, selected, onApply, groups: { name: string; codes: string[] }[] })`.

- [ ] **Step 1: Record the baseline** test totals of `vl` and `@repo/design_system`.
- [ ] **Step 2: Write the failing hook test** in `use-report.test.ts`: `test_range_report_reloads_on_extra_deps`. Render `useRangeReport(load, lastYear, [segment])` with `@testing-library/react`'s `renderHook` if it is already a devDependency (check `packages/design_system/package.json`). Otherwise, test a pure `reportDeps(range, deps)` helper that returns `[range, ...deps]` and is used by both hooks. Assert that a change of `segment` triggers a second `load` call and that only the second result is applied.
- [ ] **Step 3: Run it.** `pnpm --filter=@repo/design_system test use-report` must FAIL.
- [ ] **Step 4: Implement** the `deps` parameter on both hooks, and `extraParams`/`extraOptions` on `LabReportCard`. Update VL's `lib/vl` lab fetchers to accept and ignore the 4th `extra` argument only if tsc demands it.
- [ ] **Step 5: Move the API helpers, the admin probe and the dialog** with `git mv` where a whole file moves. Moved tests keep their assertions. Add `test_eid_probe_path` later in Task 2, not here. Add an `asList` test: a non-array body throws status 500, and an array passes through.
- [ ] **Step 6: Run all gates** (VL + design_system + TB; `eid` does not exist yet). VL count + moved count = baseline total. The VL lab page builds.
- [ ] **Step 7: Commit** `refactor(design-system): extra card params, API helpers, admin probe and lab dialog shared`.

### Task 2: `apps/eid` scaffold and registration

**Files:**
- Create `apps/eid/`, copying from `apps/vl` per `scaffold-guide.md` §2:
  - `package.json` (name `eid`, dev port `-p 3003` if the VL script hard-codes one)
  - `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `tailwind.config.ts`, `theme.config.ts`, `vitest.config.ts`, `middleware.ts`
  - `Dockerfile` with `--filter=eid`
  - `config/api.ts`, `app/layout.tsx`, `app/globals.css`, `app/(auth)/*`
  - `app/(dashboard)/{layout,loading,error}.tsx`
  - `app/api/send-suggestion/route.ts`, if VL's is generic (the "Dúvidas e Sugestões" flow); read it first
  - `public/` (favicon/logo, as VL's)
  - `.env.example` (names only)
- Create `apps/eid/lib/eid/api.ts`: `EID_BASE = "/hiv/eid"`, plus `eidGet` and `eidGetList` built on the kit's `cleanParams` and `asList`.
- Create `apps/eid/lib/eid/admin.tsx`: `EID_ADMIN_PROBE_PATH = "/hiv/eid/patients/by_facility/"`, and an `EidAdminProvider` that wires Clerk `useAuth` and `api` into the kit's `AdminProvider`, with `params: { per_page: 1 }` and `validateStatus: () => true`.
- Create `apps/eid/lib/eid/patients.ts`: `fetchPatients(params, token): Promise<{ rows; total }>`, calling `/patients/by_facility/` with `per_page=500` (spec §4.5). Read the response shape (`data`, `total_count` or the EID equivalent) from `api_openldr_python` `origin/dev` `hiv/eid/controllers/eid_controller_patients.py`.
- Create `apps/eid/lib/eid/nav.ts`:
  - labels as VL's `PAGE_LABELS`
  - `UNRELEASED_PAGES = ["/lab", "/clinic", "/patients", "/transport"]`
  - `buildNavItems`, the same as VL's
- Create empty grids: `app/(dashboard)/{lab,clinic,patients,transport}/page.tsx`, and `app/(dashboard)/(index)/page.tsx`, filled in Task 8.
- Modify `packages/design_system/src/dashboards.ts`:
  - `DashboardId` adds `"eid"`
  - the entry is `{ id: "eid", name: "Diagnóstico Precoce Infantil", portalTitle: "Portal de DPI", url: "https://eid.openldr.org.mz", primary: "#fda92d", primaryForeground: "#1C252E", ready: false }`
  - `ENV_OVERRIDES.eid = process.env.NEXT_PUBLIC_DASHBOARD_URL_EID`
- Modify `packages/design_system/src/styles/theme.css`: a `[data-dashboard="eid"]` block, modelled on the `vl`/`tb` blocks, with primary `#fda92d` and foreground `#1C252E` (contrast 8.1:1, AA; white would be 1.9:1).
- Modify `pnpm-lock.yaml` (`--lockfile-only`, see Global Constraints).
- Tests:
  - `apps/eid/lib/eid/nav.test.ts`, `api.test.ts`, `admin.test.ts`
  - the `dashboards` tests, if any exist (grep `dashboards.test`)

**Interfaces:**
- Consumes (Task 1): `asList`, `cleanParams`, `ApiError`, `errorMessage`, `AdminProvider`.
- Produces:
  - `eidGet<T>(path: string, params: Params, token: string | null): Promise<T>` and `eidGetList<T>(...)`: `Promise<T[]>`
  - `EID_BASE`, `buildNavItems`, `UNRELEASED_PAGES`
  - `fetchPatients`
  - the `(dashboard)/layout.tsx`, mounting `EidAdminProvider` → `ReportProvider` (with `getList: eidGetList` and `fetchPatients`) → `DashboardShell dashboard="eid"`

- [ ] **Step 1: Write the failing tests:**
  - `nav.test.ts`:
    - a production non-admin sees only `["/"]`
    - a dev admin sees all 5 pages in order `/`, `/lab`, `/clinic`, `/patients`, `/transport`
    - a non-admin never sees `/patients`
  - `api.test.ts` (mock `@/config/api`):
    - `eidGetList("/summary/tat/", {interval_dates: "a,b", lab_type: ""}, "t")` calls `GET /hiv/eid/summary/tat/` with params `{interval_dates: "a,b"}`
    - a 403 rejects with the message "Acesso restrito a utilizadores com permissão de Administrador."
    - a 200 object body rejects with status 500
  - `admin.test.ts`: `test_eid_probe_path`, where `EID_ADMIN_PROBE_PATH === "/hiv/eid/patients/by_facility/"`
  - `dashboards`: `getDashboard("eid").ready === false`, and `primaryForeground === "#1C252E"`
- [ ] **Step 2: Run them.** They FAIL (no app yet).
- [ ] **Step 3: Scaffold, register and update the lockfile.** Then run `pnpm install --frozen-lockfile`.
- [ ] **Step 4: Run all gates,** now including `eid`. Then run `NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz pnpm --filter=eid dev -p 3003` (delete `apps/eid/.next` first) and check that `/sign-in` renders with the `#fda92d` primary. The user signs in; never type a password. VL's and TB's switchers list "Diagnóstico Precoce Infantil" as "Em breve".
- [ ] **Step 5: Commit** `feat(eid): app scaffold, shell and dashboard registration`.

### Task 3: `lib/eid` types, series and labels

**Files:**
- Create `apps/eid/lib/eid/types.ts`. The row types follow the API keys exactly (`api_openldr_python` `origin/dev` `hiv/eid/services/eid_services_summary.py`, `eid_services_facilities.py::facility_key_indicators_service`):
  - `Month = { year: number; month: number; month_name: string }`
  - `IndicatorsByMonth = Month & { registered; tested; rejected; pending }`
  - `PositivityByMonth = Month & { tested; positive; negative; indeterminate; conventional_positive; poc_positive; positivity }`
  - `IndicatorsByProvince = { province; registered; tested; rejected; pending; conventional; poc; positive; positivity }`
  - `KeyIndicators = { requesting_facility; registered; tested; rejected; pending; positive; positivity }`
  - `TatByMonth = Month & Record<TatKey, number | null>`
  - `TatBracketsByMonth = Month & { category: TatKey; lt_7; between_7_15; between_16_21; gt_21; no_dates }`
  - `RejectedByMonth = Month & Record<RejectionKey, number> & { total }`
  - `EquipmentByMonth = Month & { tested } & Record<EquipmentKey, number>`

  Every count is `number`; every value the API can return as NULL is `number | null`.
- Create `apps/eid/lib/eid/series.ts` (+ `series.test.ts`):
  - **`TAT_SEGMENTS: { key: TatKey; label: string; color: string }[]`**, in API order. The labels are the legacy text, verbatim:
    1. `collection_hub_reception`: "Colheita na US a Recepção no Hub"
    2. `hub_reception_hub_registration`: "Recepção ao Registo no Hub"
    3. `hub_registration_lab_reception`: "Registo no Hub a Recepção no Lab"
    4. `lab_reception_lab_registration`: "Recepção no Lab ao Registo no Lab"
    5. `lab_registration_analysis`: "Registo à Análise"
    6. `analysis_validation`: "Análise à Validação"
  - **`TAT_BRACKETS`:** `lt_7` "<7 dias", `between_7_15` "7-15 dias", `between_16_21` "16-21 dias", `gt_21` ">21 dias", `no_dates` "Sem datas".
  - **`REJECTION_REASONS: { key; label; color }[]`**, the 9 keys from the API (`repeat_test`, …, `other`), with the spec §4.2 labels: "Repetir Teste", "Amostra Insuficiente", "Requisição Sem Amostra", "Problemas Técnicos", "Sangue Sobreposto", "Registo Duplicado", "Amostra Mal Identificada", "Amostra com +30 dias de Colheita", "Outros Motivos".
  - **`EQUIPMENT_GROUPS`:** keys `CAPCTM`, `ALINITY`, `M2000`, `C6800`, `PANTHER`, `MPIMA`, `MANUAL`, with display labels identical to the keys except "Manual" for `MANUAL`.
  - **`LAB_TYPE_TABS`:** `[{ value: "conventional", label: "Convencional" }, { value: "poc", label: "PoC" }]`.
  - **`EID_PRIMARY = "#fda92d"`.**
  - The functions `tatSeries(rows)`, `bracketSeries(rows)`, `rejectionSeries(rows)` and `equipmentSeries(rows)`: `Series[]`, one series per key in list order, with values through the kit's `num()` (null → 0).
  - Colours: reuse VL's `series.ts` palette tokens where a VL equivalent exists (TAT, reasons); otherwise use a distinct palette that passes the `dataviz` skill's validator in light and dark. Never put `#fda92d` on two series of the same chart.

**Interfaces:**
- Produces all the names above. Tasks 4–8 import only from `@/lib/eid/{api,types,series}` and the kit.

- [ ] **Step 1: Write the failing `series.test.ts`:**
  - the keys of `TAT_SEGMENTS` are the 6 API keys, in order
  - the `REJECTION_REASONS` keys are the 9 API keys, in order
  - `tatSeries([{...month, collection_hub_reception: 4, analysis_validation: null, …}])[5].data` equals `[0]`
  - every colour within one list is unique
- [ ] **Step 2: Run it.** It FAILS.
- [ ] **Step 3: Implement** `types.ts` and `series.ts`.
- [ ] **Step 4: Run the gates.** They PASS.
- [ ] **Step 5: Commit** `feat(eid): EID types, series and labels`.

### Task 4: KPI tiles and Principais Indicadores (`summary/indicators/`)

**Files:**
- Create `apps/eid/app/(dashboard)/(index)/reports/eid-status-cards/{constants,actions,actions.test,index}.tsx?`, modelled on VL `overview-status-cards`. It has no docs, like VL's.
- Create `…/reports/eid-key-indicators/{constants,actions,actions.test,docs,index}`. The title is "Principais Indicadores das Amostras".

**Interfaces:**
- Consumes: `eidGetList`, `IndicatorsByMonth`, `LAB_TYPE_TABS`, and the kit's `useRangeReport(load, initial, deps)`, `completeMonths` (if it lives in VL's `overview-status-cards/actions.ts`, move it to `@repo/design_system/lib/report/format.ts` with its test, per the no-duplication rule) and `IndicatorsTable`.
- Produces:
  - `eid-status-cards/actions.ts`: `fetchData(range, token)`; `toTiles(rows): { title: string; value: number; percent: string; labels: string[]; data: number[]; trend: MonthPair | null }[]`, with 4 tiles in E1 order
  - `eid-key-indicators/actions.ts`: `fetchData(range, labType: "conventional" | "poc", token)`, `toTable(rows)`, `toExcel(rows)`

- [ ] **Step 1: Write the failing tests:**
  - `fetchData` for the status cards calls `("/summary/indicators/", { interval_dates: "2026-01-01,2026-06-30" }, "t")`, with no `lab_type`
  - `toTiles` on 2 months (registered 100+100, tested 90+60, rejected 5+5) gives values `[200, 200, 150, 10]` and percents `["100%", "100%", "75%", "5%"]`
  - `test_zero_registered_shows_zero_percent`: all zeros give `"0%"` on every tile
  - key indicators: `fetchData(range, "poc", "t")` sends `lab_type: "poc"`
  - `toTable` rows are labelled `["Registadas", "Testadas", "Rejeitadas", "Pendentes"]`, and the columns are `monthLabel`s (`"Mar/26"`)
  - the Excel header starts with `"Indicadores"`
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement** the actions and thin components. The key-indicators card renders `Tabs` + `SegmentedTabsList` (TB `mtb-rejected-samples-by-reason` pattern) with `LAB_TYPE_TABS`. The tab state is passed as `deps` to `useRangeReport`. Reset puts it back on Convencional.
- [ ] **Step 4: Write `docs.tsx`** with `CardDocs` (copy a VL docs file's structure). Contents:
  - the source endpoint
  - registration-month grouping
  - pending = no `FinalResult` (✱7)
  - the lab-type rule replacing the RequestID split (✱6)
- [ ] **Step 5: Run the gates.** They PASS.
- [ ] **Step 6: Commit** `feat(eid): Sumário KPI tiles and key indicators`.

### Task 5: Positividade das Amostras (`summary/positivity/`)

**Files:** `…/reports/eid-positivity/{constants,actions,actions.test,docs,index}`. The title is "Positividade das Amostras".

**Interfaces:**
- Consumes: `PositivityByMonth`, and the kit's `ComboChart` (via `useRangeReport` + `ReportCard`, as VL `vl-suppression-trend`).
- Produces: `fetchData(range, token)`, `toChart(rows): ChartModel` (E6), `toExcel(rows)`.

- [ ] **Step 1: Write the failing tests:**
  - the endpoint is `/summary/positivity/` with only `interval_dates`
  - `toChart` gives 2 series: `"Testadas"` as type column with yAxis 0, and `"Positividade (%)"` as type line with yAxis 1, data = `positivity`
  - `test_zero_tested_month_plots_zero`: a row `{tested: 0, positive: 0, positivity: 0}` plots 0
  - a `positivity: null` row also plots 0
  - the Excel rows are Testadas, Positivas, Negativas, Indeterminadas, Positivas Convencional, Positivas PoC and Positividade (%)
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement.** `yTitles=["Amostras", "Positividade (%)"]`.
- [ ] **Step 4: Write the docs:** ✱3 (positive ÷ tested, the legacy plotted conventional ÷ total), ✱7, and that the conventional and PoC positives do not add up to the total (rows without an analyser).
- [ ] **Step 5: Run the gates and commit** `feat(eid): Sumário positivity`.

### Task 6: Amostras por Província map and drill

**Files:** `…/reports/eid-province-map/{constants,actions,actions.test,docs,index,positivity-legend}.tsx?`, modelled on VL `vl-suppression-map` (read all of it, including its province-map memo comments). The title is "Amostras por Província".

**Interfaces:**
- Consumes:
  - `IndicatorsByProvince`, `KeyIndicators`, `LAB_TYPE_TABS`, `EID_PRIMARY`
  - the kit's `provinceKey`, `useReport`, `ReportCard`
  - `InteractiveSvgMap`, the `Provinces` maps, `DrillBreadcrumb`, `MapHint`, `SortableTable`, `BarValue`
  - VL's `DISTRICT_CODES`/`PROVINCE_NAMES` (`apps/vl/lib/vl/districts.ts`): these are geography, not VL data, so move them to `@repo/design_system/lib/report/districts.ts` with any test, and leave a VL re-export
- Produces:
  - `fetchData(range, province: string | null, district: string | null, labType: "conventional" | "poc", token): Promise<{ province; district; rows: IndicatorsByProvince[] | KeyIndicators[]; facilities: KeyIndicators[] }>`, with the E3 parameters at each level
  - `toProvinceColors(rows)` (E2 ratio)
  - `toDistrictColors(province, rows)`
  - `rowFor(rows, name)`
  - `sumFacilities(rows)`
  - `toExcel(rows)`, `toFacilityExcel(rows)`

- [ ] **Step 1: Write the failing tests:**
  - national: `GET /summary/indicators_by_province/` with `interval_dates` only
  - province "Gaza", conventional: `/facilities/key_indicators/` with `{interval_dates, facility_type: "province", province: ["Gaza"], disaggregation: "true", lab_type: "conventional"}` (match the exact array/boolean encoding of VL's `fetchData` test)
  - district: `facility_type: "district", district: ["Chókwè"]`
  - `toProvinceColors`: with positivity 2.0 and 4.0, the ratios are 0.5 and 1, and a province with no row is not highlighted
  - `test_accented_province_matches_map_key`: a row `province: "Zambézia"` colours the `Zambezia` key
  - `test_rows_for_other_province_are_ignored`: the selector used by the component (export it as `rowsForView(data, province)`) returns `[]` when `data.province !== province`
  - `sumFacilities` sums every count and recomputes positivity as positive ÷ tested × 100, rounded to 1 decimal, 0 when tested is 0
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement.** The province view shows the 3 province tiles (E3) above the district map. The `positivity-legend.tsx` shows a 0 → max gradient in `#fda92d`, with "Positividade" and "Sem dados". The lab-type switch appears only at the district and facility levels, and is passed as a `useReport` dep.
- [ ] **Step 4: Write the docs:** the drill levels, ✱1 (separate conventional and PoC rows), key-indicator rules (rejected = status 'X', the legacy), ✱7, and the province page this replaces.
- [ ] **Step 5: Run the gates and commit** `feat(eid): Sumário province map with drill-down`.

### Task 7: Tempo de Resposta por mês and TRL (`summary/tat/`, `summary/tat_samples/`)

**Files:**
- `…/reports/eid-tat-by-month/{…}`, titled "Tempo de Resposta por mês (em dias)"
- `…/reports/eid-tat-brackets/{…}`, titled `TRL - <segment label>`
- `apps/eid/components/tat-segment-select.tsx`. Plans 2c and 2d reuse it inside EID; it is EID-only, so it stays in the app.

**Interfaces:**
- Consumes: `tatSeries`, `bracketSeries`, `TAT_SEGMENTS`, `useRangeReport(load, initial, deps)`, `StackedChart`.
- Produces:
  - `TatSegmentSelect({ value: number; onChange: (category: number) => void })`, using the shadcn `Select` from `@repo/design_system/components/ui/select`, with labelled options 0–5
  - `eid-tat-brackets/actions.ts`: `fetchData(range, category: number, token)` sends `category` only when it is not 0 (E4); `titleFor(category)`

- [ ] **Step 1: Write the failing tests:**
  - TAT by month: endpoint `/summary/tat/`, 6 stacked series in `TAT_SEGMENTS` order, null → 0, Excel corner `"Tempo Resposta"`
  - brackets: `fetchData(range, 0, "t")` sends no `category` key
  - `fetchData(range, 3, "t")` sends `category: 3`
  - `titleFor(4)` = `"TRL - Registo à Análise"`
  - 5 series in `TAT_BRACKETS` order
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement** both cards and the select. Reset sets the category to 0.
- [ ] **Step 4: Write the docs:**
  - the 6 segments and the date chain (spec Appendix B)
  - the summary quality filters (conventional only, `IsPoc='No'`)
  - integer averages
  - analysis-month grouping
  - for TRL, the bracket bounds and "Sem datas"
- [ ] **Step 5: Run the gates and commit** `feat(eid): Sumário TAT and TRL cards`.

### Task 8: Rejeitadas/Mês, Equipamento, and the Sumário page

**Files:**
- `…/reports/eid-rejected-by-month/{…}`, titled "Amostras Rejeitadas/Mês"
- `…/reports/eid-equipment-by-month/{…}`, titled "Amostras Testadas por Equipamento"
- Modify `apps/eid/app/(dashboard)/(index)/page.tsx`

**Interfaces:**
- Consumes: `rejectionSeries`, `equipmentSeries`, `RejectedByMonth`, `EquipmentByMonth`.
- Produces: the Sumário page.

- [ ] **Step 1: Write the failing tests:**
  - rejected: endpoint `/summary/rejected_samples_by_month/`, 9 stacked series in reason order
  - the Excel has a final "Total" row = `total`, which can exceed the sum of reasons (R10: description-only rejections)
  - equipment: endpoint `/summary/samples_by_equipment_by_month/`, 7 series, Excel with a "Testadas" row
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement both cards and the docs:**
  - rejected: the 9 buckets and their codes (spec §4.2), the conventional-only scope, and that total ≥ sum of reasons
  - equipment: the analyser code groups including ✱8 (C680A, M200C, PNTHC, ALNTB, trimmed codes), final results only, conventional
- [ ] **Step 4: Assemble the page** in VL's `(index)/page.tsx` layout:
  1. `EidStatusCards`
  2. row 2/3 + 1/3: `EidPositivity` | `EidProvinceMap`
  3. halves: `EidTatByMonth` | `EidTatBrackets`
  4. `EidKeyIndicators`
  5. halves: `EidRejectedByMonth` | `EidEquipmentByMonth`
- [ ] **Step 5: Run all gates.**
- [ ] **Step 6: Check in the browser** against dev (`NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz`, after deleting `.next`; the user signs in). Run `report-guide.md`'s data review checklist for every Sumário card:
  - the default load
  - a 3-month range
  - empty states (a future range)
  - the error state (block the API host in devtools)
  - Excel and image exports
  - the map drill down to facility level and back, switching the lab-type tab mid-load
  - light and dark themes

  Note anything that needs the user's eye.
- [ ] **Step 7: Commit** `feat(eid): Sumário rejected and equipment cards, Sumário page`.

---

## After the plan

- Open the PR to `main` only with the user's go-ahead. TB and VL redeploy on merge.
- Parity, before `/` is released in production (plan 3a): the user's `tools/eid_parity_check.py` run must have no unexpected DIFFs.
- Update the memory notes on the EID migration status.
