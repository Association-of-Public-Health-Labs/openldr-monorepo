# EID Província/Distrito/US Page (Plan 2d) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the EID `/clinic` page: the 12 legacy facility cards on `/hiv/eid/facilities/*`, using the kit's `FacilityReportCard` drill (province → district → facility → patients for admins). The page stays hidden until the user reviews it.

**Architecture:**
- Every card is a thin `FacilityReportCard` in a VL card folder, the same way VL's `/clinic` is built.
- The patients dialog reuses the existing `fetchPatients` in `apps/eid/lib/eid/patients.ts`, with EID patient columns and per-card `patientParams`.
- The in-card selects (lab type, TAT segment) use the `controls` slot that plan 2c adds to `FacilityReportCard`.

**Tech Stack:** Next 15.5, React 18, TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-10-26-eid-dashboard-migration-design.md` (§4.3 Província/Distrito/US, §4.5, §5.2). Also read:
- `docs/superpowers/plans/eid-refs/{api-contracts,legacy-cards,vl-patterns}.md`
- the handoff notes (R17, R20)

**Depends on:** plan 2c Task 2 (`controls` on `FacilityReportCard`). The branch is `feat/eid-pages`.

## Global Constraints

- Every plan 2b and 2c Global Constraint applies.
- **Default requests equal the seeds:** every `facilities/*` card, including the by-month ones, first sends exactly `{interval_dates, facility_type: "province", disaggregation: "false"}`. The kit's initial drill already sends this. No `lab_type` and no `category` by default.
- **Contact data:** `caregiver_phone` and `mother_ptv_id` appear only in the admin patients dialog and its Excel. Never `console.log` patient rows.

## Rulings (my calls; reversible)

- **C1. Charts.** Registered and tested (cards 1–4) are **grouped**, not stacked, as in the legacy. Use `chart="combo"` without `stacked`, and check in the kit that `ComboChart` renders grouped columns when `stacked` is false.
  - Series: Convencional, PoC.
  - The tested cards also put Positivas/Negativas in the Excel only.
- **C2. Gender cards (7, 8).** `chart="combo" stacked` with two groups (Masculino, Feminino), as VL's gender card (`apps/vl/lib/vl/series.ts` `genderSeries`).
  - Series: "Masculinos Positivos" #008FFB, "Masculinos Negativos" #7ac6ff (group "Masculino"); "Femininos Positivos" #FF4560, "Femininos Negativos" #FF7A91 (group "Feminino"). These are the legacy colours.
  - Validate them with the `dataviz` validator. If they fail, keep the hue family and adjust the lightness, and note it.
  - The control is `LineTabs` Todos / Convencional / PoC in `controls`. Todos sends no `lab_type`.
  - The title gets " - <label>", as in the legacy.
- **C3. TAT days cards (11, 12).** `TatSegmentSelect` in `controls`. No `category` at 0; reset to 0.
- **C4. Patients dialog** on the drill cards (1, 3, 5, 7, 9, 11):
  - `PATIENT_COLUMNS` live in `apps/eid/lib/eid/patients.ts`.
  - Columns: Nº da requisição, Nome (masked, per C5), Sexo, Idade (dias), Província, Distrito, US, Laboratório, Data de colheita, Registo, Análise, Validação, Tipo (Convencional/PoC), Resultado, Motivo de rejeição, Contacto do cuidador, PTV da mãe.
  - Per-card `patientParams`:
    - registered: `{}` (`date_basis` registration is the default)
    - tested and gender: `{date_basis: "analysis"}`
    - rejected: `{rejected: "true"}` (R20)
    - TAT cards: `{date_basis: "analysis"}`
    - the gender and tested cards also send the selected `lab_type` when it isn't Todos
- **C5. Name masking (spec §5.2, "Names are masked").** The dialog and the Pacientes table show `maskName(name)` (`packages/design_system/src/lib/mask-name.ts`, as TB). The admin-only Excel export carries the full name and the contacts (spec §4.5). **The user is asked to confirm this at plan review.**
- **C6. Rejected cards (5, 6)** use the facility rule (R20):
  - AnalysisDateTime window, rejection code only
  - the by-province card counts REJOL and PRTLA as Outros
  - the by-month card uses the "facility" variant (REJOL → Repetir Teste, PRTLA → Problemas Técnicos)

  The docs state both, and that the numbers differ from the Sumário and Lab rejected cards.

## Review Focus

1. **A facility-level click by a non-admin:** the footer shows "A lista de pacientes está disponível apenas para Administradores." and no request is sent. This is kit behaviour; add one EID test that `PATIENT_COLUMNS` has no contact column missing a label (cheap) and rely on the kit tests for the gate.
2. **The lab-type tab plus a drill level.** Switch to PoC at district level. The reload keeps the drill level, and the patients dialog sends `lab_type=poc`. Task 3 test: `test_gender_patient_params_follow_tab`.
3. **Rows with no place name.** The kit `withLocation` drops them, so the province totals can exceed the sum of the districts. The docs of the by-facility cards say so. This is a documentation check in each Task's docs step.
4. **Default requests match the seeds:** one exact-params test per card.
5. **Category reset:** reset after choosing a segment sends no `category` (Task 4 test).

---

### Task 1: EID patient columns and row types

**Files:**
- Modify `apps/eid/lib/eid/patients.ts` (+ create `patients.test.ts`):
  - `EidPatientRow`, with the 17 keys from `eid-refs/api-contracts.md`
  - `PATIENT_COLUMNS: PatientColumn[]` (kit type, C4 order and labels)
  - `formatDatePt` for the ISO dates, or the kit helper if one exists (grep `formatDateTimePt` in the kit first; if it is VL-only, move it to `K/lib/report/patients.ts` with its test)
  - `lab_type` → "Convencional"/"PoC"/"—"
  - the masked name for display (C5)
- Modify `apps/eid/lib/eid/types.ts`: the facility row types from `api-contracts.md`:
  - `RegisteredByFacility`, `TestedByFacility`, `RejectedByFacility`, `GenderByFacility`, `TatAvgByFacility`, `TatDaysByFacility`
  - plus their by-month variants

- [ ] **Step 1: Write the failing tests:**
  - the column keys and labels in C4 order
  - the name column shows the masked value
  - dates are formatted `dd/mm/aaaa`, and null shows "—"
  - `lab_type` "poc" shows "PoC"
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the gates and commit** `feat(eid): patient columns and facility row types`.

### Task 2: Registered and tested facility cards (legacy 1–4)

**Files:** `apps/eid/app/(dashboard)/clinic/reports/`:
- `eid-registered-by-facility/`: "Amostras Registadas/Província", drill
- `eid-registered-by-month/`: "Amostras Registadas/Mês"
- `eid-tested-by-facility/`: "Amostras Testadas/Província", drill
- `eid-tested-by-month/`: "Amostras Testadas/Mês"

- [ ] **Step 1: Write the failing tests:**
  - each card's exact endpoint
  - `toChart`: 2 grouped series Convencional/PoC from `conventional`/`poc`; labels `requesting_facility`, or `monthLabel` for the by-month cards
  - `toExcel` uses `levelLabel` as the corner
  - the tested cards' Excel adds Positivas and Negativas rows
  - `patientParams` per C4
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards (C1) and docs.** The docs cover: the date basis (registration or analysis), the IsPoc split (R17), ✱7 on the tested positives, and Review Focus 3.
- [ ] **Step 4: Run the gates and commit** `feat(eid): Província registered and tested cards`.

### Task 3: Rejected and gender facility cards (legacy 5–8)

**Files:** `clinic/reports/`:
- `eid-rejected-by-facility/`: "Amostras Rejeitadas/Província", drill
- `eid-rejected-by-month/`: "Amostras Rejeitadas/Mês"
- `eid-gender-by-facility/`: "Amostras Testadas por Sexo/Província", drill, C2
- `eid-gender-by-month/`: "Amostras Testadas por Sexo/Mês", C2

Reuse `rejectionSeries` from `@/lib/eid/series`. Put the gender series in `@/lib/eid/series` as `genderSeries(rows)`.

- [ ] **Step 1: Write the failing tests:**
  - the default params (seeds), and the Todos tab sends no `lab_type`
  - the title suffix " - PoC"
  - `genderSeries`: 4 series with groups, in C2 order, null → 0
  - the rejected Excel Total row (R10)
  - `test_gender_patient_params_follow_tab`
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards and docs (C6).**
- [ ] **Step 4: Run the gates and commit** `feat(eid): Província rejected and gender cards`.

### Task 4: TAT facility cards (legacy 9–12) and the page

**Files:**
- `clinic/reports/eid-tat-avg-by-facility/`: "Tempo de Resposta por província (média)", drill; the lower-case "p" is the legacy title, kept verbatim
- `clinic/reports/eid-tat-avg-by-month/`: "Tempo de Resposta por Mês (média)"
- `clinic/reports/eid-tat-days-by-facility/`: "Tempo de Resposta por Província (em dias)", drill, C3
- `clinic/reports/eid-tat-days-by-month/`: "Tempo de Resposta por Mês (em dias)", C3

**Page:** modify `apps/eid/app/(dashboard)/clinic/page.tsx`: a 2-column grid in legacy order 1–12. `/clinic` stays in `UNRELEASED_PAGES`.

- [ ] **Step 1: Write the failing tests:**
  - the default params (seeds)
  - `tatSeries`/`bracketSeries` from `@/lib/eid/series`
  - `category` omitted at 0, sent at 3
  - `test_reset_sends_no_category`: pure state helper
  - titles with the segment
- [ ] **Step 2: Run them.** They FAIL.
- [ ] **Step 3: Implement the cards, docs and page.** The docs cover the `facility_tat_avg` and `facility_tat_days` filter variants as they are in `eid_common.py`, conventional only, 0 reported as 1 on the average cards.
- [ ] **Step 4: Run all gates and the dev-server check** (`/clinic` responds, and there are no compile errors).
- [ ] **Step 5: Commit** `feat(eid): Província TAT cards and page`.
