# HIV Viral Load Dashboard Migration — Design

- **Date:** 2026-10-12
- **Status:** Approved in conversation; awaiting written-spec review
- **Repos:** `api_openldr_python` (pieces 0–1), `openldr-monorepo` (piece 2), Coolify (piece 3)

## 1. Goal

Replace the legacy HIV Viral Load dashboard at `cargaviral.openldr.org.mz` with a new app, `apps/vl`, in `openldr-monorepo`.

- **Legacy stack:** `openldr-frontend` (CRA, 2020) and `openldr-backend` (Node/Express).
- **New app:** it follows the `apps/tb` standard and reads all data from `api_openldr_python`.
- **Numbers:** the new dashboard must show the same numbers as the legacy one. The only allowed differences are documented Node bug fixes, marked ✱.

### Decisions taken

| Topic | Decision |
|---|---|
| App shape | Standalone `apps/vl`, copied from the `apps/tb` setup. The unified `apps/dashboard` branch (`origin/fix/rebuild-dashboard-from-tb-shell`) is not continued. Only its VL `types/` and `api/` modules are reused. |
| Parity target | Match Node's counting rules, but fix clear Node bugs and document each fix. Keep the Python response key names; the frontend adapts to them. |
| Launch scope | The 26 cards live on cargaviral today, plus a Pacientes page. Includes the two ReportData weekly reports. |
| Access | Clerk sign-in for everything, as in TB. Patient data is Admin-only. |
| Rollout | Staging host `vl.openldr.org.mz`, then a side-by-side numbers comparison, then cutover of `cargaviral.openldr.org.mz`. |
| Order | Piece 0 (security) → piece 1 (API parity) → piece 2 (`apps/vl`) → piece 3 (deploy/cutover). Each piece is its own branch and PR. |

### Out of scope

- The legacy COVID-19 dashboard.
- The 7 legacy VL cards that are commented out in the old code.
- AI chat (follow-up).
- Moving the TB/VL shell into a shared package (follow-up).
- Replacing the hard-coded lab list in `LabDialog` (follow-up).

## 2. Current state (verified 2026-10-12)

### Repos

| Repo | Branch / commit |
|---|---|
| `openldr-monorepo` | `main` @ `b8585c1` (Next 15.5.25 patched; TB in production) |
| `api_openldr_python` | `master` @ `8bc3706`. `dev` @ `4e9e932` is ahead with TB Cultura. VL code is identical on both. |
| `openldr-backend` | `master`, in sync with origin |
| `openldr-frontend` | `master`, in sync with origin |

### Legacy frontend

- CRA app with react-router 5, Chart.js and MUI 4.
- Every card fetches its own data and keeps its own filters. Arrays are sent as `dates[0]=…`.
- VL pages are public.
- The clinic-level drill-down sends a client-built SQL `WHERE` clause to `/viralload/all_patients/query/:query`. This is SQL injection and must not be reproduced.

### TB standard (`apps/tb`)

- **Data fetching:** client components; each card fetches with axios. Clerk `getToken()` is sent as the Bearer token straight to `NEXT_PUBLIC_OPENLDR_API`.
- **Report layout:** `app/(dashboard)/<section>/reports/<slug>/{index.tsx, actions.ts, constants.ts, docs.tsx, excel-export-utils.ts, chart-export-utils.ts}`.
- **UI:** `@repo/design_system`, using `MainCard` with `reportType` set to `national` | `lab` | `facility`, Apex chart wrappers, `MapCard` and `TableCard`.
- **Filters:** no global filter state.

### Python API

- 35 VL routes are registered, plus a patients module.
- Of the 27 Node endpoints the live dashboard uses:
  - 3 are missing.
  - About 14 count differently.
  - Most of the rest differ only in key names.
- **Security issue:** `authenticate_request()` (`utilities/controller_helpers.py:102`) decodes the JWT **without verifying its signature**. It is used by every TB, VL and EID reporting endpoint, including both patients modules. Admin checks rely on the `user_id` in that unverified token.

## 3. Piece 0 — JWT verification (api_openldr_python, ships first)

1. `authenticate_request()` accepts only verified tokens:
   - **Clerk RS256:**
     - Keys come from `CLERK_JWTS_URL`, cached in process and refreshed when an unknown `kid` arrives.
     - Validates `iss == CLERK_ISSUER`, `exp` and `nbf`.
     - Reuse/fix `verify_clerk_token` (`utilities/utils.py:736`): drop the debug `print`, add the cache.
   - **API-issued tokens** (`/auth` login, Flask-JWT-Extended): verified with the app secret.
   - **Anything else:** HTTP **401** with `{"message": "Invalid or missing token"}`. No exception text in the response.
2. `get_unverified_payload` is no longer used for authentication.
3. **Tests:**
   - valid Clerk token
   - expired token
   - wrong issuer
   - forged signature
   - unknown `kid`
   - valid API token
   - missing header
   - malformed header
4. **Pre-merge check:** decode a real `tb.openldr.org.mz` session token against the configured `CLERK_ISSUER` / `CLERK_JWTS_URL` on `dev.openldr.org.mz`.
   - Production may use a Clerk *development* instance, so the issuer must match whichever instance the dashboards use.
   - A mismatch would lock TB users out.
5. **Branching:** branch from `dev`, PR to `dev` (assumption, to be confirmed).

## 4. Piece 1 — VL API parity (api_openldr_python)

### 4.1 Changes that apply to all VL endpoints

| Item | Change |
|---|---|
| `interval_dates` | `PROCESS_COMMON_PARAMS_VL` uses `coerce_interval_dates` (`utilities/service_helpers.py:16`). It accepts a single CSV value, repeated params, or a JSON array. Today, repeated params raise IndexError and return a 500. |
| HTTP status | `run_reporting_endpoint` maps service error dicts (`{"status": "error", "code": N}`) to a real HTTP status N. Exception text is logged, not returned. |
| `disaggregation` | Case-insensitive truthy: `true`, `True`, `1`, `yes`. |
| Lab filter | New `lab_code` list param → `TestingFacilityCode IN (...)`. |
| Conventional-lab default | When no `lab_code` and no location filter are given, these lab endpoints default to `TestingFacilityCode LIKE 'P%'`: `tested_samples`, `tat_by_lab`, `tat_by_month`, `rejected_samples*`. `tested_samples_by_month` keeps no default, matching Node, where the default is commented out. |
| Admin gates | Remove the Admin requirement for lab-level filtering (`vl_services_laboratory.py:12-20`). Remove the hidden "Admin + `health_facility` returns patients" branch from the aggregate facility services (`vl_services_facilities.py:22-23`). |
| Keys | Keep the Python names (`not_suppressed`, `requesting_facility`, `testing_facility`, `total`). Add `total` wherever it is missing. |
| Facility null filters | Remove the extra `NOT NULL` filters on district/facility (`vl_services_facilities.py:238-240` and similar). When no location filter is given, exclude only rows with a null or `'null'` `RequestingProvinceName`, as Node does. |

### 4.2 Shared counting rules (one helper each, reused everywhere)

| Measure | Rule |
|---|---|
| Tested | `AnalysisDateTime IS NOT NULL` |
| Suppressed / not suppressed | `ViralLoadResultCategory = 'Suppressed'` / `'Not Suppressed'`. No copies threshold. |
| Rejected | (`LIMSRejectionCode` non-empty **OR** `HIVVL_LIMSRejectionCode` non-empty), filtered and grouped on `CAST(RegisteredDateTime AS DATE)`, with an inclusive end date. ✱ Node's clinic rejection endpoints used AND; fixed to OR. |
| Non-validated | `ViralLoadResultCategory` non-empty AND `AuthorisedDateTime` null or empty |
| TAT | Four `AVG(DATEDIFF(day, …))` segments: `collection_reception`, `reception_registration`, `registration_analysis`, `analysis_validation`. Rows must have a non-empty `ViralLoadResultCategory` and `DATEDIFF(day, SpecimenDatetime, ReceivedDatetime) >= 0`. ✱ No 90-day cap: Node intended one, but a duplicate-key bug meant it never applied. |
| Pregnant / Breastfeeding | Value `IN ('YES','Yes','yes','Sim','SIM','sim')` |
| Age range | Optional `age_range=min,max` → `AgeInYears BETWEEN min AND max` |

Every ✱ is documented in the API `CLAUDE.md` and in the Swagger description of the affected endpoints.

### 4.3 Endpoint changes

**Summary**

| Endpoint | Change |
|---|---|
| `summary/number_of_samples_by_month/` | Date column → `AnalysisDateTime` (filter and grouping) |
| `summary/viral_suppression_by_month/` | Add `total` (rows with non-empty `ViralLoadResultCategory`) |
| `summary/tat_by_month/` | Apply the TAT rule |
| `summary/suppression_by_province_by_month/` | Filter on Requesting* (the same columns it groups by). Add `total`, `routine`, `treatment_failure`, `reason_not_specified`. Count only rows with non-empty `ViralLoadResultCategory`. |
| `summary/samples_history/` | Becomes the monthly indicators table: grouped by `RegisteredDateTime` month, returning `year, month, month_name, registered, tested, suppressed, rejected, non_validated`. |
| `summary/header_indicators_by_month/` | Shape unchanged (single row); `rejected` uses the OR rule |
| **New** `summary/tat_vs_disalinks/` | Serves the static JSON copied from `openldr-backend/src/cache/dash_tat_vs_disalinks.json` |

**Laboratories**

| Endpoint | Change |
|---|---|
| `laboratories/tested_samples/`, `tat_by_lab/`, `tat_by_month/` | Conventional-lab default, `lab_code`, TAT rule |
| `laboratories/rejected_samples/`, `rejected_samples_by_month/` | Rejection rule. Lab = `SUBSTRING(RequestID,7,3)` (`lab_code`). Names come from a separate query on the `dict` bind `Laboratories` table, merged in Python (no cross-database join). Response: `lab_code, testing_facility, total` / `year, month, month_name, total`. |
| **New** `laboratories/weekly_report/` | One row per lab and week. Default window: the current week. |
| **New** `laboratories/weekly_report_national/` | One row per week. Default window: the last 12 weeks. |

For the two weekly reports:
- **Source:** a new `reportData` bind (env `DB_REPORT_DATA`) and a `Resume` model.
- **Parameters:** `interval_dates` (filtering on the start date) and `lab_code`.
- **Returns:** `backlogs, tests, registrations, rejections, capacity` (summed) and `tat` (averaged), plus `week, start, end` (and `lab_code, lab_name` for the per-lab report).
- **Column names:** check them against the real table first. The Node model (`StartDate`, `Registrations`) and the Node queries (`start_date`, `registered`) disagree.

**Facilities**

| Endpoint | Change |
|---|---|
| `facilities/tat_by_month/`, `tat_by_facility/` | TAT rule |
| `facilities/rejected_samples_by_month/`, `rejected_samples_by_facility/` | Rejection rule |
| `facilities/tested_samples_by_gender_by_facility/` | Remove year/month from GROUP BY; add `total` |
| `facilities/tested_samples_by_age_by_facility/`, `tested_samples_by_age_by_month/` | Accept `age_range`; add `suppressed`, `not_suppressed` |
| `facilities/tested_samples_pregnant/`, `tested_samples_breastfeeding/` | Value-list fix (stay monthly) |
| **New** `facilities/tested_samples_pregnant_by_facility/`, `tested_samples_breastfeeding_by_facility/` | Grouped by the facility column (`_get_group_column`). Returns `requesting_facility, total, suppressed, not_suppressed`. |

### 4.4 Patients (`hiv/vl/patients/*`)

- **Bug fixes:**
  - Guard against a null `ReasonForTest` (`utils.py:1337`).
  - Make the `test_reason` list filter work (`vl_services_patients.py:313-326`).
  - Cap `per_page` at 500.
- **New fields:**
  - `nid` = first non-empty of HealthcareNo, REFNO, NATIONALID, UNIQUEID
  - `phone` = first non-empty of TELHOME, TELWORK, MOBILE
  - `final_result` = first non-empty of FinalViralLoadResult, HIVVL_ViralLoadResult, CAPCTM
- **New filters:** `province`, `district`, `lab_code`, `age_range`, `pregnant`, `breastfeeding`, `rejected`, `result_type`.
  - These cover every legacy drill-down using bound parameters only.
- **Access:** Admin-only, through the verified identity from piece 0.

### 4.5 Tests and validation

- **SQL-compilation tests:** compile each service query with the `mssql` dialect. Assert:
  - the date column
  - the rejection OR
  - the TAT filters
  - the conventional-lab default
  - the pregnant/breastfeeding value list
  - the GROUP BY columns
  - `age_range`

  Add unit tests for `process_patients` with null fields and for repeated `interval_dates`.
- **Parity script** `tools/vl_parity_check.py`:
  - For each of the 27 Node endpoints, call Node (running locally against the same DB) and its Python counterpart for fixed windows (one closed 12-month window and one 3-month window).
  - Normalise the keys and report count differences.
  - **Acceptance:** zero differences except the documented ✱ fixes.
- **Docs:** update the API `CLAUDE.md` and the stale migration spec (bind `vlSMS` → `vl`, endpoint count, tests).

## 5. Piece 2 — `apps/vl` (openldr-monorepo)

### 5.1 Shell

- **Package:** `vl` in `apps/vl`; Next 15.5.25; title "Portal de Carga Viral"; Portuguese UI text.
- **Copied from `apps/tb`:**
  - root layout, ClerkProvider, ThemeProvider
  - `(auth)` sign-in/sign-up, `middleware.ts`
  - `config/api.ts`, `themes/`, `components/ui/`
  - `(dashboard)/layout.tsx` with `DashboardLayout`
  - `app/api/send-suggestion`
  - `next.config.ts`
- **Nav:** Sumário `/`, Laboratório `/lab`, Província/Distrito/US `/clinic`, Pacientes `/patients` (shown to Admins only).
- **Not included:** AI chat.
- **Shared packages:** no changes to shared packages (`@repo/design_system*`, `@repo/ai`).
- **Reuse from `origin/fix/rebuild-dashboard-from-tb-shell`:** `apps/dashboard/features/viral-load/{types,api}`, adapted to the piece 1 endpoints and parameters. Its UI is not reused.

### 5.2 Cards

All cards follow the TB report layout.

**Sumário** (`/`, `reportType="national"`, date range)

| Slug | Title | Endpoint(s) | Component |
|---|---|---|---|
| `overview-status-cards` | Nº de amostras · Supressão viral · Tempo de resposta | summary `number_of_samples_by_month`, `viral_suppression_by_month`, `tat_by_month` | StatusCard ×3 with trend |
| `vl-suppression-trend` | Supressão Viral | summary `viral_suppression_by_month` | Line |
| `vl-suppression-map` | Média da Supressão Viral | summary `suppression_by_province_by_month` | MapCard / Provinces |
| `vl-tat-national` | Tempo de Resposta médio Nacional | summary `tat_by_month` | Stacked |
| `vl-tat-vs-disalinks` | TRL vs No. de Disalinks | summary `tat_vs_disalinks` | MixedLineBar |
| `vl-indicators-summary` | Resumo de Indicadores | summary `samples_history` | TableCard (months as columns; rows Registadas, Testadas, CV<1000, Não validadas, Rejeitadas) |

**Laboratório** (`/lab`, `reportType="lab"`, dates + labs → `lab_code`)

| Slug | Title | Endpoint | Component |
|---|---|---|---|
| `vl-weekly-report-by-lab` | Relatório Semanal (por lab) | laboratories `weekly_report` | MixedLineBar |
| `vl-weekly-report-national` | Relatório Semanal | laboratories `weekly_report_national` | StackedWithLine |
| `vl-tested-by-lab` | Amostras Testadas por Lab | laboratories `tested_samples` | Stacked |
| `vl-tested-by-month` | Amostras Testadas por mês | laboratories `tested_samples_by_month` | Stacked |
| `vl-tat-by-lab` | Tempo de Resposta por Lab | laboratories `tat_by_lab` | Stacked (4 segments) |
| `vl-tat-by-month` | Tempo de Resposta por mês | laboratories `tat_by_month` | Stacked (4 segments) |
| `vl-rejected-by-lab` | Amostras Rejeitadas por Lab | laboratories `rejected_samples` | Bar |
| `vl-rejected-by-month` | Amostras Rejeitadas por mês | laboratories `rejected_samples_by_month` | Bar |

**Província/Distrito/US** (`/clinic`, `reportType="facility"`, dates + level + disaggregation)

| Slug | Title | Endpoint | Drill-down |
|---|---|---|---|
| `vl-registered-by-facility` | Amostras Registadas por Província | facilities `registered_samples` | yes |
| `vl-tested-by-facility` | Amostras Testadas por Província | facilities `tested_samples_by_facility` | yes |
| `vl-tested-by-gender-by-facility` | Amostras Testadas por Província/sexo | facilities `tested_samples_by_gender_by_facility` | yes |
| `vl-tested-by-gender-by-month` | Amostras Testadas por Província/mês (sexo) | facilities `tested_samples_by_gender_by_month` | no |
| `vl-tat-by-facility-month` | Tempo de Resposta por Província/mês | facilities `tat_by_month` | no |
| `vl-tat-by-facility` | Tempo de Resposta por Província | facilities `tat_by_facility` | yes |
| `vl-tested-by-age` | Amostras Testadas por idade | facilities `tested_samples_by_age_by_facility` + `age_range` (default 15,49; editable) | yes |
| `vl-tested-pregnant` | Amostras Testadas (Mulheres Grávidas) | facilities `tested_samples_pregnant_by_facility` | yes |
| `vl-tested-breastfeeding` | Amostras Testadas (Mulheres Lactantes) | facilities `tested_samples_breastfeeding_by_facility` | yes |
| `vl-test-reasons` | Amostras Testadas por Motivo | facilities `tested_samples_by_test_reason_by_facility` (summed client-side) | no |
| `vl-rejected-by-facility-month` | Amostras Rejeitadas por Província/mês | facilities `rejected_samples_by_month` | no |
| `vl-rejected-by-facility` | Amostras Rejeitadas por Província | facilities `rejected_samples_by_facility` | yes |

**Pacientes** (`/patients`, Admin only)
- Search tabs: by name, facility, result type and test reason.
- Paged table with Excel export.
- Uses `hiv/vl/patients/*`.

### 5.3 Behaviour

- **Filters:**
  - Each card holds its own state. The default is the last 12 months; the weekly cards default to the current week and the last 12 weeks.
  - Requests send `interval_dates="YYYY-MM-DD,YYYY-MM-DD"` and use `paramsSerializer: { indexes: null }`.
- **Lab selection:** the `LabDialog` list provides `LabCode`s → `lab_code`. Check its coverage against the legacy 16-lab grouping (for example Jose Macamo → PJC, PJV). If it is incomplete, add an app-local mapping; do not edit the shared component.
- **Drill-down:**
  - Province → district → facility, using TB's `getNextFacilityType` / `createFacilityOptions` pattern, with a breadcrumb subtitle.
  - At facility level, Admins get a patient dialog using `patients/by_facility` with the card's own filters (`pregnant`, `breastfeeding`, `age_range`, `rejected`, `result_type`, `interval_dates`), with Excel export.
  - Non-admins stop at facility level.
  - Admin role comes from the API's verified identity (`/auth` user role), not from client-side claims alone.
- **Exports:** every card has Excel (xlsx) and PNG (html2canvas) export, as in TB.
- **Errors and loading:** `MainCardSkeleton` while loading. On an API error, the card shows an inline message and a retry button; the page does not crash.
- **Display:** suppression % = `round(suppressed / total × 100)`, guarded against zero totals. Month labels use 3-letter Portuguese abbreviations.

### 5.4 Build and test

- **Dockerfile:** `apps/vl/Dockerfile` copies TB's (Node 22, corepack, `/app` owned by `node`, `USER node`, built from the repo root, `pnpm turbo run build --filter=vl`, `CMD pnpm --filter=vl start`, port 3000).
- **Vitest unit tests** for each card's `actions.ts`: parameter building and data transforms, including zero-total guards and drill-down level progression.
- **CI gates:** `tsc --noEmit`, lint and `next build` pass for `vl`; TB's build still passes, with no changes to shared packages.

## 6. Piece 3 — Deploy and cutover

1. **Create the app:** a new Coolify app on the openldr instance, configured like TB.
   - Dockerfile build pack, base dir `/`, Dockerfile `/apps/vl/Dockerfile`, branch `main`.
   - Domain `vl.openldr.org.mz`.
2. **Environment variables:** only `NEXT_PUBLIC_OPENLDR_API`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `SUGGESTION_EMAILS`, `DASHBOARD_EMAIL`.
   - `NEXT_PUBLIC_*` at build time; secrets at runtime only.
   - Same Clerk instance as TB.
3. **Side-by-side validation:**
   - Run the parity script and a per-card checklist comparing `vl.openldr.org.mz` with `cargaviral.openldr.org.mz` for the same windows.
   - Differences are allowed only for ✱ items.
   - User sign-off is required.
4. **Cutover:** point `cargaviral.openldr.org.mz` at the Coolify app, then announce that sign-in is now required.
5. **Retire:** retire the legacy `openldr-frontend` deployment and the Node VL backend after a grace period agreed with the user.

## 7. Risks

| Risk | Mitigation |
|---|---|
| JWT verification locks TB users out if the Clerk issuer or keys are misconfigured | Pre-merge check with a real production token on dev; quick rollback by redeploying the previous API image |
| Python `vl` bind is not the same database/instance as Node's `VL_DB` (Node uses the `SQLEXPRESS` instance) | Confirm `DB_VL_DATA` / `CDR_DOMAIN` against Node's `.env` before running the parity script |
| ReportData `Resume` column names unknown | Inspect the real table before writing the model |
| Public users lose access when sign-in becomes mandatory | Communicate before cutover; create Clerk accounts for known users |
| Unknown hosting of the legacy frontend/DNS | Confirm the DNS owner and current host before cutover |

## 8. Follow-ups (not in this work)

- AI chat for VL once `chat-panel` stops hard-coding `localhost:3001`.
- Move the TB/VL shell into a shared package.
- Replace `LabDialog`'s hard-coded list with `/dict/laboratories`.
- Remaining Node endpoints not used by the dashboard (monthly reports, other weekly reports, FSR incompleteness).
- EID dashboard migration (same pattern).
