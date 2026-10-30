# EID API: decisions the app plan must follow

From the EID API rewrite (api_openldr_python branch feat/eid-api-rewrite, 2026-10-26). These are the API contracts and rulings the `apps/eid` plan (piece 2) builds on.

## Contracts for the app
- conventional_positive + poc_positive < positive (R8 NULL-analyzer rows) — don't stack them as summing to positive.
- R19 drill contract and keys; rejected_samples key receiving_facility.
- legacy lab "Negativo" bar = total − positive; with ✱7 `negative` counts FinalResult negatives, so total − positive ≠ negative. App plots the stack as positive + (total − positive) labelled Negativo to keep bar height = tested, and docs note it.
- key_indicators facility rows have no parent district column (by-level grouping) — app shows district from the drill trail.
- send exactly R22 strings; TRL cards' first view sends no category.
- EID by_name takes `name` (not VL first_name/surname); facility cards split lab_type on IsPoc (R17) while patients use the full rule (~1% conventional).

## Rulings taken during the API work
- Ruling R1: Task 1 column list comes from the legacy Sequelize model (openldr-api origin/main src/modules/eid/models/EIDMaster.ts, fixed for the rebuilt table and confirmed against prod 2026-10-19), saved at workspace legacy-EIDMaster.ts — why: user cannot be waited on; that model is proven against prod — cost if wrong: a column name mismatch shows as a 500 on dev, caught by the parity run.
- Ruling R2: RESULT_VALUES are provisional from the legacy literals (EIDLiterals.ts and controllers) until the user's `SELECT FinalResult, COUNT(*)` output arrives; must be confirmed before PR 1b is merged — why: same — cost if wrong: positivity/pending wrong on dev until corrected; parity run exposes it.
- Ruling R3: mother identifier = the single `PtvMother` column (schema has no other mother field) — cost if wrong: field shows PTV status not an ID; trivial to rename.
- Ruling R4 (provisional until user confirms mapping): RESULT_VALUES positive = Positivo, Reactive, DTS; negative = Negativo, Not Reactive, Not Detected DBS, NDET; indeterminate = INCONCLUSIVE, Indeterminado, Inconclusive*; pending = NULL/'' plus NDT and 'Nível de detecção baixo' (legacy pending); not-a-result (counted in no class) = INS, INST, Insufficient sample, Repeat Test — cost if wrong: <1% of rows misclassed.
- Ruling R5 (✱8, spec addition): equipment groups add the codes the legacy missed: C6800 += C680A; M2000 += M200C; PANTHER += PNTHC; ALINITY += ALNTB; analyzer codes compared trimmed ('PIMA ', 'MGIT ') — why: C680A alone is 88,623 samples the legacy undercounts; obvious bug — cost if wrong: equipment card numbers rise vs legacy (expected, documented ✱8).
- Ruling R6: PoC rule compares LIMSAnalyzerCode trimmed (prod has 'PIMA ' with trailing space, 5,524 rows the legacy `IN ('MPIMA','PIMA')` misses for IsPoc=No — none here since all PIMA are IsPoc=Yes, so no number change) — cost if wrong: none.
- Ruling R7: Task 1 also renames every removed-column reference in hiv/eid/services/*.py and controllers to the new column (ResultX -> X; ResultSpecimenDatetime -> SpecimenDatetime; ResultReceivedDatetime -> ReceivedDateTime; Requesting/TestingLatitude/Longitude -> *FacilityLatitude/Longitude), behaviour otherwise unchanged, so the app imports and the suite returns to baseline between tasks — why: a red suite across 6 tasks hides regressions — cost if wrong: none; Tasks 4–6 rewrite these services anyway.
- R4 confirmed by user 2026-10-26 ('Go ahead' after the mapping table) — no longer provisional.
- Ruling R8: conventional rule keeps legacy NULL-analyzer exclusion (9,199 IsPoc='No' rows with NULL code are in neither conventional nor PoC; visible under lab_type=all) — why: parity principle — cost if wrong: ~1% of conventional samples missing from conventional views; one-line change; tell user at finish.
- Ruling R9: equipment filter IsPoc='No' (legacy) kept; PBC exclusion applied per legacy route (samples_by_equipment yes, *_by_month only if its legacy route had it) — helper takes exclude_pbc flag — why: spec says legacy code wins over the §4.2 summary — cost if wrong: monthly equipment includes PBC lab rows.
- Ruling R10: rejection `other` counts only rows with a non-empty code outside the 8 buckets (legacy); desc-only rejected rows count in the rejected total but no reason — why: parity — cost if wrong: reasons sum slightly below total.
- Ruling R11: EidParams.facility_type defaults None (lab level defaults to TestingFacilityName; requesting level treats None as province). Carry into Tasks 4–7 dispatches: never test facility_type == "province" to detect the default.
- Ruling R12: spec parity principle overrides the plan's single-rule helpers: tat_filters(variant) with variants summary | lab_tat | lab_tat_samples | facility reproducing each legacy controller's filters exactly; rejection_reason_counts(variant) with "facility" (REJOL→repeat_test, PRTLA→technical_problems) and "default" (both → other) — why: spec binding, parity run would fail otherwise — cost if wrong: none beyond helper complexity.
- Ruling R13: category is 0–5 (spec §4.1, legacy 0–5); Swagger TATCategoryParameter (EID-only) enum becomes 0–5 — done in Task 4 (owns summary tat_samples) — cost if wrong: docs show wrong range until then.
- Ruling R14: /hiv/eid/ prefix also covers transport routes; accepted — their defaults are not the 12-month window, so cache_key returns None for them; same as VL transport — cost if wrong: none.
- Ruling R15: category range 0–5 is binding (spec); the bridge maps new 0–5 to the old service keys as category+1 until Task 4 rewrites them; parse once — why: old Python EID routes 500 in prod, no client depends on 6 — cost if wrong: a caller sending 6 gets 400.
- Ruling R16: no push/PR after Task 3 (plan said open PR 1a here); keep one branch and ask the user at finish whether to open one PR or 1a/1b — why: pushing is an outward-facing step that needs the user's go-ahead; stopping mid-plan costs their time — cost if wrong: PR 1a review starts later.
- Ruling R17: indicators_by_province keeps legacy IsPoc split (parity); production data has every MPIMA/PIMA row IsPoc='Yes' and 19 ALINK + few others IsPoc='Yes', so the lab-type rule would add nothing for PIMA — cost if wrong: map conventional/PoC totals may differ by <0.01% from tabs.
- Accepted: lab_type not applied on conventional-only legacy routes; rejected_by_month total = rejected_condition (consistent with R10); positivity % 1 decimal, 0 when no tested; no null-province exclusion on summary (legacy).
- Ruling R18: PoC tested_samples drills lab → province → district → facility like conventional (spec §4.3), each level with legacy PoC filters; legacy first screen (per province) = lab_type=poc&facility_type=province — cost if wrong: PoC card's first view differs from legacy ordering; same numbers.
- Ruling R19: lab drill uses facility_type + disaggregation=true (VL group_column contract) instead of legacy "filter one level up"; keys testing_facility (lab level) / requesting_facility (other levels); TAT rows carry parent province/district — cost if wrong: app must follow this contract.
- Accepted (as R17): monthly lab routes split lab_type on IsPoc alone (legacy lab/all routes). rejected_samples keyed receiving_facility.
- Ruling R20: facility rejected routes keep the legacy Clinic rule (AnalysisDateTime window, LIMSRejectionCode <> '') over spec §4.2's RegisteredDateTime summary — parity principle — cost if wrong: Província rejected numbers differ from Sumário/Lab rejected (as they did in legacy).
- Accepted: facility lab_type on IsPoc alone (as R17); key_indicators pending keeps legacy status != 'X' (+✱7 FinalResult/NDT); key_indicators grouped by level per spec §4.3/R19 (not legacy triple); tat_days rows carry category; registered accepts lab_type (default all = legacy).
- Ruling R21: no blanket ✱5 tag; parity queries legacy with end date +1 day (both sides cover whole days) so ✱5 needs no tag; any residue (rows stamped exactly midnight of D+1) shows as DIFF for a human to judge — why: a blanket tag let any inflated count pass — cost if wrong: a few false DIFFs to read.
- Ruling R22: add seeds for fixed lab-type cards with exact strings lab_type=conventional / lab_type=poc (lab tested by lab Convencional/PoC, indicator tabs, R18 PoC view); app plan must send exactly these strings.
- Ruling R23: remove ✱2 tag from the --lab checks (legacy route filters correctly given labCodes; ✱2 was a card bug), so they must match exactly.

## From the shared report kit (plan 2a, 2026-10-26)
Plan 2b must start with these, before any EID card is built:
- **Extra params on lab and range cards.** `useRangeReport` and `useLabReport` reload only on range and labs, and `LabReportCard` has no `extraParams` or `extraOptions`. EID's "Tipo de Teste" (`lab_type`) select needs both.
- **Generic code still in VL**, to move into the package with the base path and probe path as parameters:
  - `apps/vl/lib/vl/api.ts` (ApiError, errorMessage, cleanParams, the array-checked getList)
  - `apps/vl/lib/vl/admin.tsx` and `admin-probe.ts`
  - `apps/vl/components/lab-groups-dialog.tsx`, which needs to take its groups as a prop
- **Type checking.** design_system compiles with `strict: false`, so `pnpm --filter=eid exec tsc --noEmit` must be a gate.
- **Error message.** `use-facility-report` can show "fetchPatients em falta" if an app doesn't provide `fetchPatients`, so EID must provide it.
