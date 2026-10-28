# EID Laboratório Page (Plan 2c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the EID `/lab` page: the 10 legacy lab cards on `/hiv/eid/laboratories/*`. It has a lab filter that sends lab codes and a lab → province → district → facility drill-down. The page stays hidden (`UNRELEASED_PAGES`) until the user reviews it.

**Architecture:**
- **API first (Task 1):** the EID API cannot list EID labs and PoC sites with their codes, and its lab-level rows carry only the lab name. A small API change adds both.
- **Shared kit (Task 2):** `LabReportCard` gains an optional lab drill-down (a pure chain helper in `lib/report/lab-drill.ts`) and forwards `controls`. `FacilityReportCard` forwards `controls` too, for plan 2d.
- **EID app (Tasks 3–6):** a lab list and an `EidLabReportCard` wrapper (as VL's `VlLabReportCard`), then the cards in VL card folders.

**Tech Stack:** Flask + SQLAlchemy (mssql), pytest; Next 15.5, React 18, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-eid-dashboard-migration-design.md` (§4.3 Laboratório, §5.2, Appendix A). Also read:
- `docs/superpowers/specs/2026-10-26-eid-api-handoff-notes.md` (R18, R19, R22, ✱2)
- the reference notes in `docs/superpowers/plans/eid-refs/`: `api-contracts.md`, `legacy-cards.md`, `vl-patterns.md`
- plan 2b's rulings (E1–E8) in `docs/superpowers/plans/2026-10-28-eid-app-shell-summary.md`, which still apply

**Repos and branches:**
- **API:** api_openldr_python, a new worktree `.worktrees/eid-lab-codes` from `origin/dev`, branch `feat/eid-lab-codes`. One PR to `dev`; merging auto-deploys dev.openldr.org.mz.
- **Monorepo:** worktree `.claude/worktrees/eid-app`, branch `feat/eid-pages` (stacked on `feat/eid-app`).

## Global Constraints

- **All plan 2b Global Constraints apply unchanged:**
  - Portuguese text; legacy titles verbatim (`eid-refs/legacy-cards.md`)
  - no duplicated generic code; package rules
  - VL and TB unchanged; lockfile rules
  - R22 strings
  - the gates list
  - the commit trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Default requests must equal the cache seeds exactly** (`eid-refs/api-contracts.md`, "Cache seeds"). No `lab_type`, `category` or `facility_type` unless the seed has it. The PoC tested card's first view is `lab_type=poc&facility_type=province`.
- **TAT segment and bracket labels come from `apps/eid/lib/eid/series.ts`.** They are the Sumário labels; the legacy's "à"/"a" spellings are not copied.
- **Lab tested cards** plot Positivo = `positive` and Negativo = `total − positive` (handoff contract; ✱7). The docs say so.
- **API gates (Task 1):**
  - `python -m pytest tests/ -q`: the 22 failures already on `origin/dev` are the baseline; no new failures
  - plus the new SQL-compile tests
- **The API PR is opened only with the user's go-ahead.** The app tasks that need the new fields (Tasks 4–5 drill-downs and the lab list) run against dev only after it is merged and deployed. Until then they are developed against mocked tests.

## Rulings (my calls; reversible)

- **L1. EID lab list.** A new route, `GET /hiv/eid/laboratories/labs/`, returns `[{code, name, lab_type: "conventional"|"poc"}]`.
  - Distinct `TestingFacilityCode`/`TestingFacilityName` in EIDMaster, code not null, ordered by name.
  - `lab_type` comes from `conventional_condition` / `poc_condition`. A code seen under both appears once per type.
  - `/dict/laboratories/` reads TBMaster, so it is not EID's list.
- **L2. Lab codes on lab-level rows.** These rows gain a code key:
  - `testing_facility_code` on `tested_samples/` and `tat/` (lab level only, grouped by code + name), and on `tat_samples/` and `samples_by_equipment/`
  - `receiving_facility_code` on `rejected_samples/`

  Existing keys are unchanged, so the parity script is unaffected.
- **L3. Lab filter dialog.** It is the kit `LabGroupsDialog`, with one group per lab: `{name, codes:[code]}`. The list is loaded once per session from L1.
  - Cards whose API applies the conventional rule show conventional labs only.
  - The PoC card shows PoC sites only.
  - `all` cards show both: conventional first, then PoC sites with a " (PoC)" suffix on the name.
  - `toCodes` maps names to codes.
- **L4. Lab drill-down** (cards 1, 2, 5). It uses the API lab chain (R19), driven by the kit helper in Task 2:
  - lab bar → `facility_type=lab&lab_code=<code>&disaggregation=true`
  - province bar → `facility_type=province&province=[X]&disaggregation=true`
  - district bar → `facility_type=district&district=[D]&disaggregation=true`
  - The facility level is the end: no patients dialog on lab cards, matching VL lab cards.
  - The subtitle shows the trail ("… | Lab X → Gaza → Chókwè").
  - "Reiniciar o relatório" returns to the first level.
  - When the user has chosen labs, drill requests also send those `lab_code`s, so the drill stays inside the chosen labs.
  - A lab bar's code comes from the row's `testing_facility_code` (L2).
- **L5. PoC card first level is province** (R18 and the seed). The chain is province → district → facility. Its lab filter lists PoC sites.
- **L6. "Amostras Testadas/Mês" control.** `LineTabs` Todos / Convencional / PoC in `controls`, the same component as the Sumário key indicators (user request, 2026-10-28):
  - Todos sends no `lab_type`.
  - The title gets the legacy suffix " (Convencional)" or " (PoC)".
- **L7. TRL card.** `TatSegmentSelect` in `controls`, with the E4 rules: no `category` at 0; reset to 0.
- **L8. Rejected lab cards** apply the lab filter to the receiving lab (✱2; the API filters `ReceivingFacilityCode`). The docs say so.

## Review Focus

1. **Drill click before the lab list has loaded, or a lab bar with no code** (an old API without L2). The click must do nothing and show no error, rather than send `lab_code=undefined`. Task 2 test: `test_lab_click_without_code_is_ignored`.
2. **Lab filter plus drill-down.** Choose 2 labs, drill into a province, then reset. Reset clears the labs and the trail; the drill sends the chosen `lab_code`s. Task 2 test: `test_drill_keeps_selected_lab_codes`, and a reset test.
3. **Stale level.** Drilling quickly lab → province while the first request is in flight must never draw lab rows under the province level. The rows are tagged with their level and the view checks it, as `rowsForView` does in plan 2b. Task 2 test: `test_rows_of_previous_level_are_ignored`.
4. **Default requests match the seeds.** Every card's first request params equal its seed. One test per card asserts the exact params object (Tasks 4–6).
5. **Names with accents at the province and district levels.** Clicked labels go back to the API verbatim, using the row's own name, never a map key. Task 2 test: `test_click_sends_row_name_verbatim`.

---

### Task 1: API: EID lab list and lab codes on lab rows (api_openldr_python)

**Files:**
- Modify `hiv/eid/services/eid_services_laboratory.py`: the new `laboratory_labs_service`, plus code keys per L2.
- Modify `hiv/eid/controllers/eid_controller_laboratory.py` and `hiv/eid/routes.py`: register `/hiv/eid/laboratories/labs/` through `run_reporting_endpoint`, with Swagger docs.
- Modify `tools/report_cache_seeds.py`: add `(f"{_EID}/laboratories/labs/", YEAR, {})`, only if the route takes the window; otherwise skip, and say so.
- Tests: `tests/test_eid_laboratory_sql.py`, the existing mssql SQL-compile test file for EID labs (find it with `ls tests | grep eid`).

**Interfaces:**
- Produces:
  - `GET /hiv/eid/laboratories/labs/` → `[{code: str, name: str, lab_type: "conventional"|"poc"}]`
  - lab-level rows of `tested_samples/` and `tat/` gain `testing_facility_code`
  - `tat_samples/` and `samples_by_equipment/` rows gain `testing_facility_code`
  - `rejected_samples/` rows gain `receiving_facility_code`

- [ ] **Step 1: Write the failing SQL-compile tests:**
  - `test_labs_lists_distinct_codes_by_lab_type`: the compiled SQL selects `TestingFacilityCode` and `TestingFacilityName`, filters the code `IS NOT NULL`, and has both lab-type conditions.
  - `test_tested_samples_lab_level_groups_by_code`
  - `test_tat_lab_level_groups_by_code`
  - `test_rejected_samples_returns_receiving_code`
  - `test_tested_samples_province_level_has_no_code`: the key is absent below lab level.
- [ ] **Step 2: Run them.** `python -m pytest tests/test_eid_laboratory_sql.py -q` must FAIL.
- [ ] **Step 3: Implement.**
  - Group by code + name at lab level only.
  - Keep row order by name.
  - Swagger must describe the new keys.
- [ ] **Step 4: Run the full suite.** No new failures beyond the 22-test baseline.
- [ ] **Step 5: Commit** `feat(eid): laboratories/labs list and lab codes on lab-level rows`. **Stop here.** The controller asks the user before pushing or opening the PR to `dev`.

### Task 2: Kit: lab drill-down and `controls` forwarding

**Files:**
- Create `packages/design_system/src/lib/report/lab-drill.ts` (+ `lab-drill.test.ts`).
- Modify `packages/design_system/src/app/organisms/report/lab-report-card.tsx`: optional drill, `controls`, `titleSuffix?`.
- Modify `packages/design_system/src/hooks/report/use-report.ts`: only if `useLabReport` needs a `drill` dep; prefer passing it through `deps`.
- Modify `packages/design_system/src/app/organisms/report/facility-report-card.tsx`: forward `controls?: React.ReactNode` to `ReportCard` (for plan 2d).

**Interfaces:**
- Produces:
  - `type LabLevel = "lab" | "province" | "district" | "health_facility"`
  - `type LabDrill = { start: "lab" | "province"; trail: { level: LabLevel; name: string; code?: string }[] }`
  - `initialLabDrill(start): LabDrill`
  - `labDrillLevel(d): LabLevel`, the level of the rows shown
  - `labDrillParams(d, codes: string[]): Params`, following L4: with an empty trail, `{}` when start is `lab`, or `{facility_type: "province"}` when start is `province`, plus `lab_code: codes` when codes are non-empty
  - `labDrillClick(d, label: string, code?: string): LabDrill | null`. It returns null at `health_facility`, and at lab level when there is no code.
  - `labTrailLabel(d): string`, joined with " → "
  - `LabReportCardProps` gains:
    - `drill?: { start: "lab" | "province"; codeOf: (row: Row) => string | undefined; labelOf: (row: Row) => string }`
    - `controls?: React.ReactNode`

  With `drill` set, the card passes an `onClick` to the chart, tags the fetched rows with their `LabDrill` and checks the tag before drawing (Review Focus 3), and appends `labTrailLabel` to the subtitle and export subtitle. `fetchData`'s `extra` argument receives `labDrillParams(...)` merged into `extraParams`.
  - `FacilityReportCardProps` gains `controls?: React.ReactNode`.

- [ ] **Step 1: Write the failing tests** in `lab-drill.test.ts`:
  - `test_lab_start_sends_nothing`
  - `test_province_start_sends_facility_type_province`
  - `test_lab_click_drills_by_code` → `{facility_type:"lab", lab_code:["PMB"], disaggregation:"true"}`
  - `test_province_click` and `test_district_click`, per L4
  - `test_lab_click_without_code_is_ignored`
  - `test_facility_level_click_is_ignored`
  - `test_drill_keeps_selected_lab_codes`: codes `["PMB","PJV"]` at province level send `lab_code` with both
  - `test_click_sends_row_name_verbatim` ("Zambézia")
  - `test_rows_of_previous_level_are_ignored`: a pure `rowsForDrill(tagged, current)`
  - `test_trail_label`

  Use the same boolean string encoding as the kit's `drill.ts` (`"true"`).
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement** `lab-drill.ts` and the card changes. Reset clears the labs (existing behaviour) and the drill.
- [ ] **Step 4: Run all gates.** VL lab cards are unaffected (no `drill` prop); the VL and TB builds pass.
- [ ] **Step 5: Commit** `feat(design-system): lab drill-down and controls on lab and facility cards`.

### Task 3: EID lab list, the `EidLabReportCard` wrapper, and lab types

**Files:**
- Create `apps/eid/lib/eid/labs.ts` (+ test):
  - `type EidLab = { code: string; name: string; lab_type: "conventional" | "poc" }`
  - `fetchLabs(token)`, which caches the promise per module
  - `labsFor(labs, kind: "conventional" | "poc" | "all"): { name: string; codes: string[] }[]`, per L3
  - `toLabCodes(groups, names)`
- Create `apps/eid/components/eid-lab-report-card.tsx`: wraps the kit `LabReportCard` the way `apps/vl/components/vl-lab-report-card.tsx` does, with a `labKind` prop. It loads the labs through `useReport`, and the dialog lists `labsFor(labs, labKind)`.
- Modify `apps/eid/lib/eid/types.ts`: lab row types, with keys from `eid-refs/api-contracts.md` and the L2 code keys as optional:
  - `TestedByLab`, `TestedByMonth`, `RegisteredByMonth`, `TatByLab`, `TatBracketsByLab`, `RejectedByLab`, `EquipmentByLab`

**Interfaces:**
- Produces:
  - `EidLabReportCard<Row>(props: Omit<LabReportCardProps<Row>, "toCodes" | "labsDialog"> & { labKind: "conventional" | "poc" | "all" })`
  - `fetchLabs`, `labsFor`

- [ ] **Step 1: Write the failing tests:**
  - `labsFor` filters by kind
  - `all` lists conventional first and suffixes PoC names with " (PoC)"
  - `toLabCodes` maps names to codes and ignores unknown names
  - `fetchLabs` calls `/laboratories/labs/` once across two calls
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement.** While the labs are loading or failed, the dialog shows an empty list with "Não foi possível carregar a lista de laboratórios." on failure, and the cards still load.
- [ ] **Step 4: Run the gates and commit** `feat(eid): lab list and lab report card`.

### Task 4: Tested and registered lab cards (legacy cards 1, 2, 3, 6)

**Files:** `apps/eid/app/(dashboard)/lab/reports/`:
- `eid-tested-by-lab-conventional/`: "Amostras Testadas por lab/Convencional", drill start `lab`, `labKind` conventional, sends `lab_type: "conventional"`
- `eid-tested-by-lab-poc/`: "Amostras Testadas por lab/PoC", drill start `province`, `labKind` poc, sends `lab_type: "poc"`
- `eid-tested-by-month/`: "Amostras Testadas/Mês" (L6), `labKind` all
- `eid-registered-by-month/`: "Amostras Registadas/Mês", series Convencional/PoC, `labKind` all; ✱ the lab filter applies to the receiving lab

Each folder has `constants`, `actions` (+ test), `docs` and `index`.

**Interfaces:**
- Consumes: `EidLabReportCard`, the kit drill (Task 2), `LineTabs`, the `@/lib/eid/types` lab types.

- [ ] **Step 1: Write the failing tests:**
  - Exact first-request params per seed:
    - conventional: `{interval_dates, lab_type:"conventional"}`
    - PoC: `{interval_dates, lab_type:"poc", facility_type:"province"}`
    - by month: `{interval_dates}`
    - registered: `{interval_dates}`
  - The tested `toChart`: Positivo = positive, Negativo = total − positive (never negative; floor 0).
  - `labelOf`/`codeOf` read `testing_facility`/`testing_facility_code` at lab level and `requesting_facility` below.
  - By month: the Todos tab sends no `lab_type`; the title suffix is " (PoC)".
  - Excel headers follow the level label (Laboratório / Província / Distrito / Unidade Sanitária).
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards and docs.** The docs cover: the counting rule (analysed, not rejected), the lab-type rule per route (full rule on the per-lab cards, IsPoc on the monthly cards), ✱7, Negativo = Testadas − Positivas, and the drill levels.
- [ ] **Step 4: Run the gates and commit** `feat(eid): Laboratório tested and registered cards`.

### Task 5: TAT lab cards (legacy cards 4, 5)

**Files:** `lab/reports/eid-trl-by-lab/` ("TRL - <segmento>", L7; x = lab; 5 bracket series) and `lab/reports/eid-tat-by-lab/` ("Tempo de Resposta (Convencional)", 6 segments, drill start `lab`). Both use `labKind` conventional.

- [ ] **Step 1: Write the failing tests:**
  - first-request params `{interval_dates}` for both (seeds)
  - TRL sends `category` only when it isn't 0
  - `titleFor`
  - TAT drill `labelOf` at each level
  - TAT rows below lab level carry `province`/`district`, which the Excel adds as extra columns
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards and docs.** The docs describe the `lab_tat` and `lab_tat_samples` filter variants as they actually are in `eid_common.py` (`tat_filters`), with 0 reported as 1 on the lab TAT card.
- [ ] **Step 4: Run the gates and commit** `feat(eid): Laboratório TAT cards`.

### Task 6: Equipment and rejected lab cards (legacy cards 7–10), and the page

**Files:**
- `lab/reports/eid-equipment-by-month/` and `lab/reports/eid-equipment-by-lab/` ("Amostras Testadas por Equipamento (Lab)")
- `lab/reports/eid-rejected-by-month/` and `lab/reports/eid-rejected-by-lab/` ("Amostras Rejeitadas por Lab", x = `receiving_facility`)

All use `labKind` conventional.

**Reuse:** the Sumário equipment and rejected cards already have the same chart model. If a toChart/toExcel is identical, import it from `@/lib/eid/series` (`rejectionSeries`, `equipmentSeries`) rather than copying it.

**Page:** modify `apps/eid/app/(dashboard)/lab/page.tsx`. It is a 2-column grid in legacy order 1–10. `/lab` stays in `UNRELEASED_PAGES`.

- [ ] **Step 1: Write the failing tests:**
  - first-request params `{interval_dates}` (seeds)
  - the rejected Excel "Total" row can exceed the sum of reasons (R10)
  - equipment has a "Testadas" row
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards, docs and page.** The docs cover:
  - ✱2/L8: the receiving lab
  - ✱8: the equipment codes
  - the PBC exclusion on the per-lab equipment card only
  - REJOL and PRTLA counted as Outros
- [ ] **Step 4: Run all gates.** Then start the dev server against dev and confirm `/lab` responds with no compile errors. The lab list and the drill-down are checked by the user once the Task 1 API is merged and deployed to dev; until then, record them in the report as pending.
- [ ] **Step 5: Commit** `feat(eid): Laboratório equipment and rejected cards, Laboratório page`.
