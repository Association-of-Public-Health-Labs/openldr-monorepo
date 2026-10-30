# EID Pacientes and Transporte Pages (Plan 2e) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the EID `/patients` page (admin-only patient search) and the `/transport` page (collection → lab-reception TAT, weekly, on a map). Both reuse VL's pages through the kit, without copying them. They stay hidden until the user reviews them.

**Architecture:**
- **Patients:** VL's 270-line search card moves into the kit as `PatientsSearchCard`, configured by a list of search modes, columns and a page fetcher. VL then renders it with its current 4 modes and is unchanged; EID renders it with 3 modes.
- **Transport:** VL's transport data layer and components are app-agnostic except for the `vlGetList` import. They move into the kit and fetch through `ReportServices.getList`, which every app's layout already provides. Labels and an optional reports drawer are props. The Nextcloud drawer stays VL-only.
- **EID:** adds the `type_of_test` switch.

**Tech Stack:** Next 15.5, React 18, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-eid-dashboard-migration-design.md` (§4.5 Patients, §5.2 Pacientes and Transporte). Also read `docs/superpowers/plans/eid-refs/{api-contracts,vl-patterns}.md` and the 2a plan's note that the transport components were deferred to this plan.

**Depends on:** plan 2d Task 1 (`PATIENT_COLUMNS`, ruling C5). The branch is `feat/eid-pages`.

## Global Constraints

- Every plan 2b, 2c and 2d Global Constraint applies.
- **VL's patients and transport pages must behave the same after the move.** That covers:
  - the same tabs, labels, paging, Excel output and admin gate
  - the same map, detail, summary, weekly trend, period button and reports drawer

  VL's existing tests move with their code word for word (only import lines change), and the VL test count + the moved test count = the baseline.
- **Patients:** the requests send only bound parameters; `per_page` is at most 500; contact fields are never logged.
- **Transport:** EID sends `type_of_test` only when the user picks a type; the default is all.

## Rulings (my calls; reversible)

- **P1. Kit `PatientsSearchCard`** (`packages/design_system/src/app/organisms/report/patients-search-card.tsx`):
  - Props: `{ cardId, title, documentation, modes: SearchMode[], columns: PatientColumn[], fetchPage(endpoint, params, page, perPage, token): Promise<PatientsPage>, toSheetRow(row): unknown[], sheetHeaders: string[], perPageOptions?: number[] }`.
  - `SearchMode = { id, label, fields: Field[], build(values, range): { endpoint, params } | { error } }`, where `Field` is a text input or a select with options.
  - It reads the admin status and token from `ReportServices`, so there is no Clerk import.
  - The generic `PatientsPage` envelope type moves to `K/lib/report/patients.ts`.
- **P2. EID modes:**
  - **Por Nome:** field "Nome", sends `name` to `by_name`.
  - **Por US:** fields Província, Distrito, US (text), plus "Tipo de laboratório" (Todos/Convencional/PoC), sends to `by_facility`.
  - **Por Resultado:** "Resultado" with Positivo / Negativo / Indeterminado / Rejeitada / Pendente → `positive|negative|indeterminate|rejected|pending`, sends to `by_result_type`.

  Every mode also has "Data de referência": Registo (default, sends no `date_basis`) or Análise (`date_basis=analysis`).
- **P3. EID columns** are `PATIENT_COLUMNS` from plan 2d (full names, C5). The page Excel is admin-only by construction (the page is admin-gated), so it carries the full name and the contacts.
- **P4. Kit transport.**
  - Move `apps/vl/lib/vl/transport/data.ts` to `K/lib/report/transport/data.ts`; `fetchTransport` takes `getList` as an argument instead of importing `vlGetList`.
  - Move `actions.ts` and the three components (`transport-summary`, `transport-map`, `transport-detail`) to `K/app/organisms/report/transport/`, with a `labels` prop for the VL-worded strings.
  - Replace the hard-coded VL green with `var(--primary)`, or pass it as a prop if VL's look depends on it. VL must look the same.
  - The page orchestration becomes `TransportView({ labels, docs, extraParams?, headerExtra?, ... })`. VL passes its `ReportsButton`/drawer as `headerExtra`.
- **P5. EID transport:**
  - The page renders `TransportView` with EID labels: "Colheita à recepção no laboratório", and "diagnóstico precoce infantil" wording in the docs.
  - A `LineTabs` Todos / Convencional / Point-of-care in `headerExtra` sends `type_of_test` = `Convencional` | `Point-of-care`, as the API values; the "Point-of-care" tab is labelled PoC.
  - The docs name `ReportData.EIDTransportTATPerWeek` and `/hiv/eid/transport/*`.

## Review Focus

1. **A non-admin who types `/patients` in the address bar.** They see "Acesso restrito a utilizadores com permissão de Administrador.", and no search request is sent. This is a kit card test on the pure gate helper: `test_user_status_blocks_search`.
2. **An empty name or a blank required field.** The card shows a Portuguese validation message and sends no request (`build` returns an error). EID test: `test_name_mode_requires_name`.
3. **Paging after editing the inputs** reuses the last submitted search (VL behaviour). The test moves with the code.
4. **The transport national cache.** VL's module-level cache of the national weekly series is keyed per window. Once it is in the kit, two apps must not share entries (VL and EID never run in one bundle, but key it by base path anyway). Test: `test_national_cache_keyed_by_endpoint`.
5. **The transport type switch while loading.** The rows are tagged with their `type_of_test`, so a stale response is not drawn under the new tab. Task 4 test.

---

### Task 1: Kit `PatientsSearchCard`, moved from VL

**Files:**
- Create `packages/design_system/src/app/organisms/report/patients-search-card.tsx`.
- Create `K/lib/report/patients-search.ts`, the pure part (+ test): the mode/field types, `pageSummary`, paging state, and the gate helper.
- Modify `K/lib/report/patients.ts`: the `PatientsPage` type, and `formatDateTimePt` if it is still VL-only.
- Modify `apps/vl/app/(dashboard)/patients/reports/vl-patients-search/{index,actions}.tsx?`: VL's 4 modes expressed as `SearchMode[]`, with its `buildSearch` logic reused inside `build`.

**Interfaces:** produces the P1 props and types.

- [ ] **Step 1: Record the baseline** test counts of VL and design_system.
- [ ] **Step 2: Move the generic logic and tests** (`git mv` where a whole file moves). Write the failing kit tests:
  - `test_user_status_blocks_search`
  - `test_build_error_sends_nothing`
  - `test_paging_reuses_last_search`
  - `test_page_summary`, if not already moved
- [ ] **Step 3: Implement** the kit card and port VL onto it. VL's UI text, tabs, paging and export must be identical.
- [ ] **Step 4: Run the gates.** Counts as in Global Constraints; VL builds. Then compare VL's `/patients` in the dev server: the same tabs and labels (curl the page, plus a manual note).
- [ ] **Step 5: Commit** `refactor(design-system): patients search card shared with VL`.

### Task 2: EID Pacientes page

**Files:**
- Create `apps/eid/app/(dashboard)/patients/reports/eid-patients-search/{constants,actions,actions.test,docs,index}`.
- Modify `apps/eid/app/(dashboard)/patients/page.tsx`.
- Modify `apps/eid/lib/eid/patients.ts`: `fetchPage(endpoint, params, page, perPage, token)` for the three endpoints, next to the existing `fetchPatients`; and `toSheetRow`.

- [ ] **Step 1: Write the failing tests:**
  - `test_name_mode_requires_name`
  - name mode → `/patients/by_name/` with `{interval_dates, name}`
  - US mode with Convencional → `lab_type: "conventional"`, and Todos sends none
  - result mode "Pendente" → `result_type: ["pending"]`
  - Análise → `date_basis: "analysis"`
  - `per_page` is capped at 500
  - the sheet row has the full name and both contacts
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the card, page and docs.** The docs explain the result classes from `FinalResult` (✱7), the date basis, and that contacts are confidential.
- [ ] **Step 4: Run the gates and commit** `feat(eid): Pacientes page`.

### Task 3: Kit transport view, moved from VL

**Files:**
- `git mv` the VL files per P4 into the kit, with their tests.
- Create `K/app/organisms/report/transport/transport-view.tsx`.
- Modify `apps/vl/app/(dashboard)/transport/page.tsx` to render `TransportView` with VL labels and the drawer.

The Nextcloud files (`apps/vl/lib/vl/reports/*`, `api/reports/cv`, `reports-drawer.tsx`) stay in VL.

- [ ] **Step 1: Record the baseline counts.** Move the files and tests. Add the failing `test_national_cache_keyed_by_endpoint`.
- [ ] **Step 2: Implement.** `fetchTransport(getList, endpoints, query, token)`. VL passes `/transport/tat_by_location/` and `/transport/tat_by_week/` (relative to its base), and the kit reads `getList` from `ReportServices`.
- [ ] **Step 3: Run the gates.** The VL counts hold, and the VL `/transport` page renders the same. Check it in the dev server, with a note for the user's visual check.
- [ ] **Step 4: Commit** `refactor(design-system): transport view shared with VL`.

### Task 4: EID Transporte page

**Files:**
- Modify `apps/eid/app/(dashboard)/transport/page.tsx`.
- Create `apps/eid/app/(dashboard)/transport/{constants,docs}.tsx` and `actions.test.ts`.

The EID response keys are the same COUNTS keys (`api-contracts.md`). `total_tested` is always present.

- [ ] **Step 1: Write the failing tests:**
  - the default requests send no `type_of_test`
  - the PoC tab sends `type_of_test: "Point-of-care"`
  - a response tagged with the other type is ignored (Review Focus 5)
  - the EID labels in the summary strip
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the page (P5) and docs.**
- [ ] **Step 4: Run all gates and the dev-server check** for `/patients` and `/transport`. All four new pages stay in `UNRELEASED_PAGES` until the user reviews them.
- [ ] **Step 5: Commit** `feat(eid): Transporte page`.
