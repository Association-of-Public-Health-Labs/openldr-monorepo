# VL patterns and kit state (feat/eid-app, 2026-10-28)
K = packages/design_system/src. VLD = apps/vl/app/(dashboard). EIDD = apps/eid/app/(dashboard).

## Lab cards
- **VL lab page:** 6 cards, every one a 14-line `VlLabReportCard`. The wrapper is `apps/vl/components/vl-lab-report-card.tsx`: `LabReportCard` plus `toCodes = labCodes` plus `labsDialog = LabGroupsDialog groups={LAB_GROUPS}`. No VL lab card drills down.
- **`LabReportCardProps<Row>`:** cardId, title, fetchData(range, codes, token, extra), toChart, toExcel, documentation, chart?("stacked"|"combo"), yTitles?, initialRange?, extraParams?, extraOptions?, toCodes, labsDialog.
  - It passes **no `controls`, `footer` or `onClick`** to `ReportCard`.
  - Its chart is ComboChart or StackedChart.
- **`useLabReport(load, toCodes, initial?, deps?)`** returns {data, loading, error, retry, range, labs, subtitle, exportSubtitle, onSubmit, onRestart (also clears labs), openLabs, labsDialog}.
- **VL `lib/vl/labs.ts`:** LAB_GROUPS (16 groups, VL-specific), labCodes, labParams(range, codes), and withLab (drops null testing_facility).

## Facility cards
- **VL clinic page:** 12 `FacilityReportCard`s.
- **`FacilityReportCardProps<Row>`:** cardId, title, endpoint, toChart, toExcel(rows, levelLabel), documentation, extraParams?, chart?("stacked"|"combo"|"donut"), stacked?, pieColors?, footer?, extraOptions?, plus DrillProps:
  - `{ drill: true; patientColumns: PatientColumn[]; patientParams?: Params }`
  - or no drill.

  It has **no `controls`**, and no yTitles/axes/initialRange.
- **`useFacilityReport({endpoint, extraParams?, patientParams?})`:** the deps are [endpoint, range, drill, JSON(extraParams)].
  - It calls `getList(endpoint, facilityParams(range, drill, extra))` and runs the rows through `withLocation`, which **drops** rows with a blank requesting_facility.
  - Level params:
    - initial: `facility_type=province, disaggregation=false`
    - province click: `facility_type=province, disaggregation=true, province=[X]`
    - district click: `facility_type=district, disaggregation=true, district=[D]`
    - filter "clinic": `health_facility=<name>`
  - Facility-level click: an admin gets the patients dialog, via `fetchPatients(patientRequestParams(range, action, patientParams))` = `{interval_dates, health_facility, district?, ...patientParams}`. A non-admin sees a footer hint instead.
  - **EID's layout already provides `fetchPatients`** (`apps/eid/lib/eid/patients.ts`: by_facility, per_page=500).
- **Example card:** `VLD/clinic/reports/vl-tat-by-facility-month/` (a 19-line `index.tsx`). For a drill card see `vl-tested-by-facility` (`patientParams`, `PATIENT_COLUMNS`).

## Patients page (VL)
- **Files:** `VLD/patients/reports/vl-patients-search/index.tsx` (about 270 lines; raw `MainCard`; uses Clerk directly).
- **Behaviour:**
  - 4 tabs: by_name, by_facility, by_result_type, by_test_reason.
  - Paging 50/100/500 with Anterior/Próxima.
  - "Exportar página para Excel".
  - Admin gate: unknown shows a skeleton; user sees "Acesso restrito a utilizadores com permissão de Administrador.".
  - **No name masking in VL**; `K/lib/mask-name.ts` maskName is used by TB only.
- **Already in the kit:** `K/lib/report/patients.ts` (PatientRecord, PatientColumn{key,label,format?,badge?}, MAX_PER_PAGE, patientCells, patientsSheet, …), `patients-table.tsx` (PatientsTable, PatientsTableSkeleton), `patients-dialog.tsx`, the admin hooks.
- **VL-specific:** `apps/vl/lib/vl/patients.ts` (endpoint types, result/reason labels, fetchPatients(endpoint, params, page, perPage), formatDateTimePt, 16 PATIENT_COLUMNS, PATIENT_HEADERS, patientToRow), and the actions' `buildSearch`.

## Transport page (VL)
- **`VLD/transport/page.tsx`** (101 lines) is the orchestrator. It uses a 28-week window, a range defaulting to the last full week, and province/district state, and calls `useReport(fetchTransport(...))`. It is laid out as a header (ReportsButton, PeriodButton), then TransportSummary, then TransportMap (2 columns) next to TransportDetail (1 column), plus WeekPicker and ReportsDrawer. Release gate: `notFound()` when production and the page is in UNRELEASED_PAGES.
- **Other files:**
  - `constants.ts`, `actions.ts`: provinceColors, districtColors, toSegments, CHILD_LABEL, offTargetCount, formatShare, toExcel.
  - `docs.tsx`: VL-worded.
  - `components/{transport-summary, transport-map, transport-detail, reports-drawer}.tsx`. transport-detail has one hard-coded VL green hex.
- **`apps/vl/lib/vl/transport/data.ts`:** ENDPOINTS, TatUnit, ChildLevel, TransportQuery, TransportView, NATIONAL="Moçambique", TransportRow, toCounts, toUnits, alignWeeks, childLevelOf, buildView, fetchTransport. **It is app-agnostic except for the `vlGetList` import and its `/hiv/vl` base.**
- **Nextcloud drawer:** VL-only. It is `lib/vl/reports/*`, the `api/reports/cv` route and the NEXTCLOUD_* env vars.
- **Already in the kit:** `K/lib/report/tat.ts`, `geo`, `districts`, `K/lib/weeks.ts`, WeekPicker/PeriodButton, InteractiveSvgMap, PROVINCE_MAPS, DrillBreadcrumb, MapHint, SummaryStrip, DistributionBar, TargetProgress, StatusBadge, WeeklyTrend, SortableTable.

## Controls in cards
- `ReportCard.controls?` renders above error/empty/children; it is the slot to use.
- `LabReportCard` and `FacilityReportCard` **do not forward `controls`**. Each needs a one-line kit change.
- `LineTabs<V>({items, value, onChange, className})`: EID uses `className="-mx-4 mb-5"`.
- SegmentedTabs: inside shadcn `<Tabs>`.
- `TatSegmentSelect({value, onChange})`: `apps/eid/components`.
