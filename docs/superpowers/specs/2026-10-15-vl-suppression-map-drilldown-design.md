# VL "Média da Supressão Viral" — Province → District Map — Design

**Date:** 2026-10-15
**Status:** Draft for review
**Repos:** `api_openldr_python` (backend), `openldr-monorepo` (`apps/vl`, branch `feat/platform-shell`)
**Reference:** TB card "Relatório de Positividade a Nível Nacional" (`apps/tb/app/(dashboard)/(index)/reports/mtb-map-card/`)

## 1. Goal

The VL card "Média da Supressão Viral" shows viral-load suppression per
province on the national map (as today). Clicking a province shows that
province's map split by district, each district coloured by its
suppression rate. Navigation mirrors the TB positivity card.

This is a requested behaviour change to one card; every other card is
unchanged.

## 2. Findings (verified against production, 2025-10-15 … 2026-10-15)

- Province names returned by the API match the national map exactly
  ("Maputo Provincia", "Maputo Cidade", "Zambezia", …); one row has
  province `null`.
- All 161 district names on the shared province maps
  (`packages/design_system_mui/src/atoms/maps/provinces/*`) match
  `VlData.RequestingDistrictName` exactly. Gaza also returns one row with
  district `null`.
- District counts already exist on
  `/hiv/vl/facilities/tested_samples_by_facility/` with
  `facility_type=province&disaggregation=true&province=<P>`; for Gaza,
  Maputo Cidade and Nampula the districts sum exactly to the province
  figures of `/hiv/vl/summary/suppression_by_province_by_month/` when the
  rate is `suppressed / total_not_null` (= suppressed + not_suppressed).
  That endpoint lacks `routine` and `treatment_failure`.
- `/hiv/vl/summary/suppression_by_province_by_month/` always groups by
  `RequestingProvinceName` and ignores `disaggregation`.
- Suppression is ~88–95% almost everywhere, so TB's opacity-by-rate
  colouring would show almost no variation.

## 3. Backend (`api_openldr_python`)

### 3.1 Change

`/hiv/vl/summary/suppression_by_province_by_month/` honours
`disaggregation`, mirroring the TB endpoint pattern:

| Request | Grouped by | Rows |
|---|---|---|
| no location params (today) | `RequestingProvinceName` | one per province |
| `province=<P>` (today) | `RequestingProvinceName` | that province |
| `facility_type=province&disaggregation=true&province=<P>` (new) | `RequestingDistrictName` | one per district of P |

The grouping column comes from the existing
`requesting_group_column(params)` helper in
`hiv/vl/services/vl_common.py` (the same logic TB's `GET_COLUMN_NAME`
uses). Filters, counts and `has_result()` are unchanged, so the district
rows sum to the province row.

### 3.2 Response

Same fields as today (`province, total, suppressed, not_suppressed,
routine, treatment_failure, reason_not_specified, start_date, end_date,
facilities`). For compatibility `province` keeps carrying the group label
(a district name when disaggregated), and a new field `location` carries
the same value with a neutral name.

### 3.3 Out of scope

District → facility drill (TB does not do it either); any other endpoint.

### 3.4 Tests and docs

- SQL test: with `disaggregation=true&province=Gaza` the query groups by
  `RequestingDistrictName` and filters `RequestingProvinceName IN ('Gaza')`.
- Regression test: without the new params the SQL and output keys are
  unchanged (existing tests in `tests/hiv/test_vl_summary_sql.py` keep
  passing, adjusted only for the added `location` key).
- A `null` group label is returned as `null` (the dashboard skips it).
- Swagger docstring documents `facility_type` and `disaggregation`
  (quoted strings — see the Flasgger YAML issue fixed in PR #8).

### 3.5 Rollout

PR to `dev` → deploy to dev.openldr.org.mz → verify → dev → master release
(asked for separately) before the dashboard change ships. The dashboard
must not depend on the new parameters in production until master has
them.

## 4. Dashboard (`apps/vl`, card `reports/vl-suppression-map/`)

### 4.1 Behaviour

- National level (default): provinces coloured by band (§4.2); header text
  "Clique sobre a Província para mais detalhes".
- Click a province → fetch its districts (§3) and show that province's
  district map; header shows a breadcrumb "Moçambique › <Província>";
  "Moçambique" returns to the national level.
- Clicking a district does nothing (as TB).
- "Reiniciar o relatório" also returns to the national level.
- The date filter applies to both levels; changing it while a province is
  open reloads that province.
- Loading and error states use the card's existing ones.

### 4.2 Colour bands

Rate = `suppressed / (suppressed + not_suppressed)`, unrounded for the
colour, shown with one decimal.

| Rate | Band | Colour |
|---|---|---|
| < 80% | Baixa | red `#EF5350` |
| 80% – < 90% | Média | amber `#FFAB00` |
| 90% – < 95% | Boa | light green `#77ED8B` |
| ≥ 95% | Meta (95%) | dark green `#00B000` |
| no data (0 with result, or missing) | Sem dados | grey `#C4CDD5` |

Same bands at both levels. The legend lists the five entries and replaces
the 0–100% gradient on this card only.

### 4.3 Tooltip

Same content as today at both levels: name, rate, samples with result,
routine, treatment failure.

### 4.4 Exports

- Excel exports the level being viewed (provinces, or the districts of the
  open province), with the same columns as today.
- PNG export unchanged.

### 4.5 Data handling

- Rows with a `null` label are dropped at both levels.
- A district on the map with no row is "Sem dados" (grey).
- Names are matched exactly (verified 161/161); matching still trims and
  compares case- and accent-insensitively, so a future data spelling change
  degrades to "Sem dados" for that district instead of breaking the map.

### 4.6 Code shape

- `apps/vl/lib/vl/suppression.ts` (new): `suppressionRate(row)`,
  `suppressionBand(rate)` → `{ band, label, color }`.
- `reports/vl-suppression-map/actions.ts`: `fetchProvinces`,
  `fetchDistricts(province)`, `toProvinceMap`, `toDistrictMap`, `toExcel`.
- `reports/vl-suppression-map/index.tsx`: drill state
  (`selectedProvince | null`), breadcrumb, national map or the province's
  district map, band legend.
- The national map and the 11 province maps are reused from the design
  system. If a map component can only shade by opacity (no per-area
  colour), the smallest change is an optional per-area colour prop added
  to that shared component, with no change to its existing behaviour;
  this will be shown to the user before it is made.

## 5. Testing

- Unit: `suppressionBand` at 79.9 / 80 / 89.9 / 90 / 94.9 / 95 / no data;
  `suppressionRate` with zero results; national and district transforms
  (null label dropped, unmatched district grey); drill params; Excel at
  both levels.
- Backend: §3.4.
- Browser: national and district maps for at least Gaza and Maputo Cidade,
  colours checked against the numbers, breadcrumb back, Reiniciar, date
  change while drilled in, both exports, light and dark mode.

## 6. Success criteria

1. National map: provinces coloured by band, legend shown, tooltips as today.
2. Clicking any of the 11 provinces shows its district map with every
   district coloured by band (or grey without data).
3. Breadcrumb and Reiniciar return to the national map.
4. District rows sum to the province figure (same rate definition).
5. National output of the endpoint is unchanged for existing callers.
6. All tests, type-checks, lint and builds pass.
