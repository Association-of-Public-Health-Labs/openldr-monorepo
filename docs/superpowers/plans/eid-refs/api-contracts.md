# EID API contracts (api_openldr_python origin/dev, read 2026-10-28)

Verify against `git -C /home/vagner/Documents/Projects/APHL/openldr/api_openldr_python show origin/dev:hiv/eid/services/<file>` when in doubt.

All routes need a JWT. All are GET and return a bare JSON array, except the patients routes. Errors: 400 for an invalid param, 403 for a non-admin on patients, 5xx with a generic message.

## Common params (lab and facility routes)
- `interval_dates`: "start,end", YYYY-MM-DD. The end day is inclusive.
- `province[]`, `district[]`: repeatable lists.
- `health_facility`: a single string.
- `facility_type`: lab | province | district | health_facility.
- `disaggregation`: truthy only for true/1/yes.
- `lab_code[]`: filters TestingFacilityCode, except the receiving-lab routes noted below.
- `lab_type`: all (default) | conventional | poc.
- `category`: 0–5, default 0. The TAT segment index, in this order:
  0. collection_hub_reception
  1. hub_reception_hub_registration
  2. hub_registration_lab_reception
  3. lab_reception_lab_registration
  4. lab_registration_analysis
  5. analysis_validation

Response-key shorthands:
- **TAT6:** the 6 segment keys above.
- **REJ9:** repeat_test, insufficient_sample, request_without_sample, technical_problems, overlapping_blood, duplicate_registration, misidentified_sample, sample_over_30_days, other.
- **EQ:** CAPCTM, ALINITY, M2000, C6800, PANTHER, MPIMA, MANUAL.
- **BR:** lt_7, between_7_15, between_16_21, gt_21, no_dates.
- **YM:** year, month, month_name.

## Laboratories /hiv/eid/laboratories/
Date columns: A = AnalysisDateTime, R = RegisteredDateTime.

| path | params | grouping | keys | date | notes |
|---|---|---|---|---|---|
| tested_samples_by_month/ | dates, location, lab_type, lab_code | month | YM,total,positive,negative | A | lab_type split on IsPoc alone; rejected rows excluded |
| registered_samples_by_month/ | same | month | YM,total,conventional,poc | R | lab_code filters **ReceivingFacilityCode** |
| tested_samples/ | + facility_type, disaggregation | lab chain | testing_facility (lab level) OR requesting_facility; total,positive,negative | A | full conventional/poc rule; all = conventional OR poc |
| tat/ | facility_type, disaggregation, lab_code; **no lab_type** | lab chain | [province,][district,] testing_facility/requesting_facility + TAT6 | A | conventional only; 0 reported as 1 |
| tat_samples/ | lab_code, category | per testing lab only | testing_facility, category (segment name), BR | A | no drill |
| rejected_samples/ | lab_code | receiving_facility | receiving_facility, REJ9, total | R | lab_code = ReceivingFacilityCode (✱2); IsPoc 'No'; REJOL/PRTLA count as other |
| rejected_samples_by_month/ | same | month | YM, REJ9, total | R | ✱2 |
| samples_by_equipment/ | lab_code | testing_facility | testing_facility, tested, EQ | A | status F, IsPoc No, excludes PBC; ✱8 |
| samples_by_equipment_by_month/ | lab_code | month | YM, tested, EQ | A | no PBC exclusion |
| sample_routes*/ | — | — | — | — | not used by any card |

### Lab drill chain (tested_samples/, tat/)
The chain is lab → province → district → health_facility. `disaggregation=true` moves one level down.

| clicked bar | request | returns |
|---|---|---|
| a lab | `facility_type=lab&lab_code=<code>&disaggregation=true` | provinces |
| a province | `facility_type=province&province=<X>&disaggregation=true` | districts |
| a district | `facility_type=district&district=<D>&disaggregation=true` | health facilities |

- `facility_type=lab` ignores province and district.
- A lab bar is labelled with `testing_facility` (a name), but the drill needs the lab **code**. Map name → code with the app's lab list.
- The PoC first view is `lab_type=poc&facility_type=province` (cache seed, R18).

## Facilities /hiv/eid/facilities/
Requesting chain: province → district → health_facility. The key is `requesting_facility`.

| clicked | request | returns |
|---|---|---|
| a province | `facility_type=province&province=<X>&disaggregation=true` | districts |
| a district | `facility_type=district&district=<D>&disaggregation=true` | facilities |
| a facility | `facility_type=health_facility&health_facility=<F>` | one row |

- `health_facility` + `disaggregation` wraps back to province, as in VL.
- The by-month routes take no disaggregation; `facility_type` only picks the filter column.
- `lab_code` filters TestingFacilityCode.

| path | extra | keys | date | notes |
|---|---|---|---|---|
| registered_samples/ (+_by_month) | lab_type | requesting_facility\|YM, conventional, poc, total | R | |
| tested_samples/ (+_by_month) | lab_type | …, conventional, poc, total, positive, negative | A | rejected not dropped |
| tested_samples_by_gender/ (+_by_month) | lab_type | …, male_positive, male_negative, female_positive, female_negative | A | |
| tat_avg/ (+_by_month) | **no lab_type** | …, TAT6 | A | conventional only; 0 reported as 1 |
| tat_days/ (+_by_month) | category; **no lab_type** | …, category, BR | A | conventional only |
| rejected_samples/ | **no lab_type** | …, REJ9, total | A | IsPoc No and code <> ''; REJOL/PRTLA count as other |
| rejected_samples_by_month/ | **no lab_type** | YM, REJ9, total | A | "facility" variant: REJOL → repeat_test, PRTLA → technical_problems |
| key_indicators/ | lab_type | registered, tested, rejected, pending, positive, positivity | A or R | used by the Sumário map |
| tested_samples_by_age/ | — | — | — | no card |

The facility lab_type split is on IsPoc alone (R17).

## Patients /hiv/eid/patients/{by_facility,by_name,by_result_type}/ (Admin only, never cached)
Params:
- `interval_dates`
- `province[]`, `district[]`, `health_facility`: read directly, whatever `facility_type` is
- `lab_code[]`
- `lab_type`: all | conventional | poc, using the full rule
- `result_type[]`: positive | negative | indeterminate | rejected | pending. Required on by_result_type, optional elsewhere; values are ORed together.
- `name`: required on by_name. A partial, case-insensitive match on "FIRSTNAME SURNAME".
- `page`: default 1
- `per_page`: default 50, capped at 500
- `date_basis`: registration (default) | registered | analysis
- `rejected`: true → AnalysisDateTime window, IsPoc No, LIMSRejectionCode != '' (the facility rule, R20)

Envelope: `{status:"success", page, per_page, total_count, total_pages, data:[...]}`.

Row keys (17): `request_id, name, sex, age_in_days, requesting_province, requesting_district, requesting_facility, testing_facility, specimen_date, registered_date, analysis_date, authorised_date, lab_type ("poc"|"conventional"|null), result (raw FinalResult), rejection_reason, caregiver_phone, mother_ptv_id`.
- The dates are ISO strings or null.
- `caregiver_phone` and `mother_ptv_id` are third-party contact data: never log them.

Non-admins get a 403.

## Transport /hiv/eid/transport/ (ReportData.EIDTransportTATPerWeek; Sunday–Saturday weeks)
Params:
- `interval_dates`
- `province[]`, `district[]`, `health_facility`
- `type_of_test`: Convencional | Point-of-care, or omitted for all

COUNTS = `samples_with_collection_date, lt_7, between_7_15, between_16_21, gt_21, no_reception_date, total_tested, no_collection_date`. The brackets are days from collection to lab reception.

| path | extra | keys |
|---|---|---|
| tat_by_location/ | facility_type province (default) \| district \| health_facility; `lab` is a 400 | province: province, start_date, end_date, COUNTS. district: + district. health_facility: + district, health_facility, facility_code |
| tat_by_week/ | — | start_date, end_date, COUNTS. Default: the last 28 complete weeks |

The default window for tat_by_location is the last complete week.

## Cache seeds (YEAR window; params case-sensitive; send exactly these)
**Laboratories:**
- tested_samples/ with {}, with `lab_type=conventional`, and with `lab_type=poc&facility_type=province`
- tested_samples_by_month/, registered_samples_by_month/, tat_samples/ (no category), tat/, samples_by_equipment_by_month/, samples_by_equipment/, rejected_samples_by_month/, rejected_samples/: all with {}

**Facilities:** every route, including the _by_month ones, with `facility_type=province&disaggregation=false`:
- registered_samples(+_by_month)
- tested_samples(+_by_month)
- rejected_samples(+_by_month)
- tested_samples_by_gender(+_by_month)
- tat_avg(+_by_month)
- tat_days(+_by_month)

Note: `"false"` is not `"False"`; they are different cache keys.

**Never cached:** any request with province, district, health_facility or lab_code; facility_type=health_facility; patients; transport; key_indicators.
