# VL Suppression Map Province → District Drill-down Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The VL card "Média da Supressão Viral" colours provinces by suppression band and, on click, shows the province's districts coloured by band, backed by a disaggregation option on the existing VL summary endpoint.

**Architecture:** Backend: `suppression_by_province_service_by_month` groups by district when `disaggregation` is set (via the existing `requesting_group_column`). Shared maps: two additive, opt-in props/exports so areas can be coloured individually (TB unaffected). VL: pure band/rate helpers, card actions for both levels, and a card UI with drill state, breadcrumb and a band legend.

**Tech Stack:** Flask + SQLAlchemy (pytest, SQL-capture tests); Next.js 15 / React 18, Vitest; shared MUI map components (`design_system_mui`).

**Spec:** `docs/superpowers/specs/2026-10-15-vl-suppression-map-drilldown-design.md`

## Global Constraints

- Rate = `suppressed / (suppressed + not_suppressed)`; unrounded for colour, one decimal in text.
- Bands: `< 80` red `#EF5350` "Baixa"; `80–<90` amber `#FFAB00` "Média"; `90–<95` light green `#77ED8B` "Boa"; `≥ 95` dark green `#00B000` "Meta (95%)"; no data grey `#C4CDD5` "Sem dados".
- Endpoint: `/hiv/vl/summary/suppression_by_province_by_month/`; district request adds `facility_type=province&disaggregation=true&province=<P>`. National output unchanged (plus `location` key).
- Rows with a `null` label are dropped on the dashboard.
- Shared map changes are additive and opt-in only; TB must render exactly as before.
- No new dependencies; never plain `pnpm install` (ruling R-d). Python: no new packages.
- This session's git is locked to the monorepo worktree. Backend commits need `ExitWorktree` (action `keep`) first and `EnterWorktree` (path) afterwards. Never push, PR, merge or deploy without asking.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Portuguese UI text.

## Review Focus

1. **A province with no rows at all** (e.g. a new date range where Niassa has no results): national map shows it grey "Sem dados"; clicking it shows its district map all grey, not an error. Pinned in Task 4.
2. **District names with different case/accents in future data** ("Chókwè", "chokwe"): the district still gets its colour. Pinned in Task 4 (normalised matching).
3. **Rate exactly on a band boundary** (80.0, 90.0, 95.0) and rounding (89.96 shows "90.0%" but is band "Média"): colour follows the unrounded rate. Pinned in Task 3.
4. **Date change while a province is open**: the province stays open and its districts reload for the new range. Pinned in Task 5 (hook deps include the province).
5. **Production API before the backend release**: production ignores `disaggregation` and returns the province itself as the only row; the district map must then show all districts grey, never crash. Pinned in Task 4 (unknown labels ignored).

---

## File structure

| File | Responsibility |
|------|----------------|
| `api_openldr_python/hiv/vl/services/vl_services_summary.py` | Group by district when disaggregated; add `location` |
| `api_openldr_python/hiv/vl/controllers/vl_controller_summary.py` | Swagger docstring for the district mode |
| `api_openldr_python/tests/hiv/test_vl_summary_sql.py` | SQL tests for both modes |
| `packages/design_system_mui/src/atoms/maps/InteractiveSvgMap.tsx` | Optional `fillColors` per province |
| `packages/design_system_mui/src/atoms/maps/provinces/*/*.tsx` (11) | Export each province's district code table |
| `packages/design_system/src/app/atoms/maps/Provinces.tsx` | Re-export the code tables |
| `apps/vl/lib/vl/suppression.ts` (+ test) | `suppressionRate`, `suppressionBand`, `SUPPRESSION_BANDS`, `NO_DATA` |
| `apps/vl/app/(dashboard)/(index)/reports/vl-suppression-map/actions.ts` (+ test) | Fetch both levels; map colours; Excel |
| `.../vl-suppression-map/index.tsx` | Drill state, breadcrumb, maps, legend |
| `.../vl-suppression-map/suppression-legend.tsx` | Band legend |
| `.../vl-suppression-map/docs.tsx` | Mention the drill-down and bands |

---

### Task 1: Backend — district mode on the summary map endpoint

**Files:**
- Modify: `api_openldr_python/hiv/vl/services/vl_services_summary.py:173-212`
- Modify: `api_openldr_python/hiv/vl/controllers/vl_controller_summary.py:133-157`
- Test: `api_openldr_python/tests/hiv/test_vl_summary_sql.py`

**Interfaces:**
- Produces: `GET /hiv/vl/summary/suppression_by_province_by_month/?interval_dates=..&facility_type=province&disaggregation=true&province=<P>` → `[{province, location, total, suppressed, not_suppressed, routine, treatment_failure, reason_not_specified, start_date, end_date, facilities}]`, one row per district of P (`province` and `location` both carry the district name). Without `disaggregation`: today's rows, plus `location` (= province).

- [ ] **Step 1: Branch** (outside the worktree). Call `ExitWorktree` with `action: "keep"`, then:

```bash
cd /home/vagner/Documents/Projects/APHL/openldr/api_openldr_python
git fetch origin && git status --short    # must be clean apart from known untracked files
git switch -c feat/vl-suppression-by-district origin/dev
```

- [ ] **Step 2: Write the failing tests** — append to `tests/hiv/test_vl_summary_sql.py`:

```python
def test_map_groups_by_district_when_disaggregated(app):
    args = {**ARGS, "province": ["Gaza"], "facility_type": "province", "disaggregation": "true"}
    _, [sql] = service_sql(app, summary.suppression_by_province_service_by_month, args)
    assert "GROUP BY [VlData].[RequestingDistrictName]" in sql
    assert "[VlData].[RequestingProvinceName] IN ('Gaza')" in sql
    assert "[VlData].[ViralLoadResultCategory] NOT LIKE ''" in sql


def test_map_ignores_facility_type_without_disaggregation(app):
    # Existing callers may send facility_type; without disaggregation the grouping stays by province.
    args = {**ARGS, "facility_type": "district", "district": ["Chokwe"]}
    _, [sql] = service_sql(app, summary.suppression_by_province_service_by_month, args)
    assert "GROUP BY [VlData].[RequestingProvinceName]" in sql
```

Also check how `service_sql` passes args (open `tests/hiv/sql_capture.py`); if `disaggregation` must be a bool string, keep `"true"` (the service parses it with `TRUTHY_VALUES`).

- [ ] **Step 3: Run them to see them fail**

Run: `python -m pytest tests/hiv/test_vl_summary_sql.py -q`
Expected: `test_map_groups_by_district_when_disaggregated` FAILS (GROUP BY RequestingProvinceName); the other passes or fails only if facility_type already changes grouping.

- [ ] **Step 4: Implement** — in `suppression_by_province_service_by_month` replace the body's query/labels:

```python
def suppression_by_province_service_by_month(req_args):
    """Suppression and test reasons per requesting province (map card).

    With ``disaggregation`` (and ``facility_type=province&province=<P>``) the rows are
    the districts of P instead, so the dashboard can drill into a province.
    """
    params = parse_vl_params(req_args)
    group = requesting_group_column(params) if params.disaggregation else VlData.RequestingProvinceName
    filters = [
        date_between(VlData.AnalysisDateTime, params.dates),
        has_result(),
        *requesting_location_filters(params, exclude_null_province=False),
    ]
    try:
        data = (
            VlData.query.with_entities(
                group.label("location"),
                TOTAL_ALL,
                suppressed_count(),
                not_suppressed_count(),
                *test_reason_counts(),
            )
            .filter(and_(*filters))
            .group_by(group)
            .order_by(group)
            .all()
        )
        return [
            dict(
                province=row.location,
                location=row.location,
                total=row.total,
                suppressed=row.suppressed,
                not_suppressed=row.not_suppressed,
                routine=row.routine,
                treatment_failure=row.treatment_failure,
                reason_not_specified=row.reason_not_specified,
                start_date=params.dates[0], end_date=params.dates[1],
                facilities=params.facilities,
            )
            for row in data
        ]
    except Exception as e:
        return _error(e)
```

Import `requesting_group_column` from `hiv.vl.services.vl_common` alongside the existing imports in this file.

- [ ] **Step 5: Update the docstring** in `VlSummarySuppressionByProvinceByMonth.get` — replace the 200 description line with (quoted, see PR #8):

```
            200:
                description: "Suppression counts per RequestingProvinceName; with disaggregation=true and facility_type=province&province=<P>, per RequestingDistrictName of that province"
```

- [ ] **Step 6: Run the whole test suite**

Run: `python -m pytest -q`
Expected: all pass (the existing map tests still pass: national SQL keeps `GROUP BY [VlData].[RequestingProvinceName]`; the label is now `location`, which no existing test asserts). `tests/test_swagger_docstrings.py` must pass.

- [ ] **Step 7: Commit, then return to the worktree**

```bash
git add hiv/vl/services/vl_services_summary.py hiv/vl/controllers/vl_controller_summary.py tests/hiv/test_vl_summary_sql.py
git commit -m "feat(vl): district disaggregation on the suppression map endpoint

/hiv/vl/summary/suppression_by_province_by_month/ groups by district with
facility_type=province&disaggregation=true&province=<P>, mirroring the TB
map endpoint. National output unchanged; rows gain a neutral 'location'.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then `EnterWorktree` with path `/home/vagner/Documents/Projects/APHL/openldr/openldr-monorepo/.claude/worktrees/platform-shell`. Do not push; ask the user.

---

### Task 2: Shared maps — per-area colours (opt-in)

**Files:**
- Modify: `packages/design_system_mui/src/atoms/maps/InteractiveSvgMap.tsx`
- Modify: the 11 files `packages/design_system_mui/src/atoms/maps/provinces/*/<Name>.tsx`
- Modify: `packages/design_system/src/app/atoms/maps/Provinces.tsx`

**Interfaces:**
- Produces:
  - `InteractiveSvgMap` prop `fillColors?: Partial<Record<"mc"|"mp"|"gz"|"ib"|"mn"|"sf"|"tt"|"zb"|"np"|"ns"|"cd", string>>`; when a key is present its path's inline fill uses it, otherwise `pathDefaultBackgroundColor` (today's behaviour).
  - Exports `NIASSA_DISTRICT_CODES`, `CABO_DELGADO_DISTRICT_CODES`, `NAMPULA_DISTRICT_CODES`, `ZAMBEZIA_DISTRICT_CODES`, `TETE_DISTRICT_CODES`, `MANICA_DISTRICT_CODES`, `SOFALA_DISTRICT_CODES`, `INHAMBANE_DISTRICT_CODES`, `GAZA_DISTRICT_CODES`, `MAPUTO_PROVINCIA_DISTRICT_CODES`, `MAPUTO_CIDADE_DISTRICT_CODES`: `Record<string /* code, e.g. MZ0900C1 */, string /* district name */>`, re-exported from `@repo/design_system/app/atoms/maps/Provinces`.

- [ ] **Step 1: Add the prop to `InteractiveSvgMap`** — add `fillColors?: Partial<Record<keyof InteractiveSvgMapProvincesProps, string>>;` to `InteractiveSvgMapProps`, destructure `fillColors`, then replace every province path's `fill: pathDefaultBackgroundColor` with the per-key form. Do it with a script that reads the key from the same `style` expression:

```bash
python3 - <<'EOF'
import re, pathlib
p = pathlib.Path("packages/design_system_mui/src/atoms/maps/InteractiveSvgMap.tsx")
s = p.read_text()
pattern = re.compile(r"style=\{\{opacity: provinces\?\.(\w+)\?\.ratio \|\| 0, fill: pathDefaultBackgroundColor\}\}")
n = len(pattern.findall(s))
s = pattern.sub(lambda m: f"style={{{{opacity: provinces?.{m.group(1)}?.ratio || 0, fill: fillColors?.{m.group(1)} ?? pathDefaultBackgroundColor}}}}", s)
p.write_text(s)
print("paths updated:", n)
EOF
```

Expected: `paths updated: 12` (Maputo Provincia has two paths). If the count differs, inspect before continuing.

- [ ] **Step 2: Export the district code tables** — append one line to each province file, e.g. in `gaza/Gaza.tsx`:

```ts
/** District code (SVG class) → name, for callers that colour districts via `customColors`. */
export const GAZA_DISTRICT_CODES: Readonly<Record<string, string>> = DISTRICT_MAP;
```

(Names per file as listed in Interfaces.) These are re-exported automatically by `design_system_mui/src/index.ts` (`export * from` each file).

- [ ] **Step 3: Re-export from the design system** — in `packages/design_system/src/app/atoms/maps/Provinces.tsx` add the 11 constants to the export list.

- [ ] **Step 4: Verify TB is unchanged and types are clean**

```bash
pnpm --filter=tb exec tsc --noEmit
pnpm --filter=vl exec tsc --noEmit
grep -c "fill: fillColors?" packages/design_system_mui/src/atoms/maps/InteractiveSvgMap.tsx
```

Expected: both 0 errors; count 12. TB passes no `fillColors`, so every fill falls back to `pathDefaultBackgroundColor` exactly as before (checked again in the browser in Task 6).

- [ ] **Step 5: Commit**

```bash
git add packages/design_system_mui/src/atoms/maps packages/design_system/src/app/atoms/maps/Provinces.tsx
git commit -m "feat(maps): opt-in per-area colours for the national and province maps

InteractiveSvgMap takes an optional fillColors per province; each province
map exports its district code table so callers can colour districts via
customColors. Without them nothing changes (TB unaffected).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: VL suppression rate and bands

**Files:**
- Create: `apps/vl/lib/vl/suppression.ts`, `apps/vl/lib/vl/suppression.test.ts`

**Interfaces:**
- Produces:
  - `type SuppressionCounts = { suppressed: number; not_suppressed: number }`
  - `suppressionRate(row: SuppressionCounts | undefined): number | null` — percent, unrounded; `null` when no results.
  - `type SuppressionBand = { id: "low" | "mid" | "good" | "target" | "none"; label: string; color: string }`
  - `SUPPRESSION_BANDS: SuppressionBand[]` (order: target, good, mid, low, none — the legend order)
  - `suppressionBand(rate: number | null): SuppressionBand`
  - `formatRate(rate: number | null): string` — `"91.7%"` or `"—"`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { SUPPRESSION_BANDS, formatRate, suppressionBand, suppressionRate } from "./suppression";

describe("suppressionRate", () => {
  it("is suppressed / (suppressed + not suppressed), unrounded", () => {
    expect(suppressionRate({ suppressed: 151709, not_suppressed: 13719 })).toBeCloseTo(91.7069, 3);
  });
  it("is null with no results", () => {
    expect(suppressionRate({ suppressed: 0, not_suppressed: 0 })).toBeNull();
    expect(suppressionRate(undefined)).toBeNull();
  });
});

describe("suppressionBand", () => {
  it.each([
    [79.9, "low", "#EF5350"],
    [80, "mid", "#FFAB00"],
    [89.96, "mid", "#FFAB00"],
    [90, "good", "#77ED8B"],
    [94.9, "good", "#77ED8B"],
    [95, "target", "#00B000"],
    [100, "target", "#00B000"],
    [null, "none", "#C4CDD5"],
  ] as const)("%s → %s", (rate, id, color) => {
    expect(suppressionBand(rate)).toMatchObject({ id, color });
  });
  it("lists the legend in order, with Portuguese labels", () => {
    expect(SUPPRESSION_BANDS.map((b) => b.label)).toEqual(["Meta (≥95%)", "Boa (90–94%)", "Média (80–89%)", "Baixa (<80%)", "Sem dados"]);
  });
});

describe("formatRate", () => {
  it("shows one decimal or a dash", () => {
    expect(formatRate(89.96)).toBe("90.0%");
    expect(formatRate(null)).toBe("—");
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `pnpm --filter=vl exec vitest run lib/vl/suppression.test.ts`
Expected: FAIL, cannot find module `./suppression`.

- [ ] **Step 3: Implement**

```ts
/** Suppression rate and colour bands for the suppression map (see the map spec §4.2). */
export type SuppressionCounts = { suppressed: number; not_suppressed: number };

export type SuppressionBand = { id: "low" | "mid" | "good" | "target" | "none"; label: string; color: string };

const TARGET: SuppressionBand = { id: "target", label: "Meta (≥95%)", color: "#00B000" };
const GOOD: SuppressionBand = { id: "good", label: "Boa (90–94%)", color: "#77ED8B" };
const MID: SuppressionBand = { id: "mid", label: "Média (80–89%)", color: "#FFAB00" };
const LOW: SuppressionBand = { id: "low", label: "Baixa (<80%)", color: "#EF5350" };
export const NO_DATA: SuppressionBand = { id: "none", label: "Sem dados", color: "#C4CDD5" };

export const SUPPRESSION_BANDS: SuppressionBand[] = [TARGET, GOOD, MID, LOW, NO_DATA];

export function suppressionRate(row: SuppressionCounts | undefined): number | null {
  if (!row) return null;
  const withResult = row.suppressed + row.not_suppressed;
  return withResult > 0 ? (100 * row.suppressed) / withResult : null;
}

/** Band from the unrounded rate. */
export function suppressionBand(rate: number | null): SuppressionBand {
  if (rate === null) return NO_DATA;
  if (rate >= 95) return TARGET;
  if (rate >= 90) return GOOD;
  if (rate >= 80) return MID;
  return LOW;
}

export const formatRate = (rate: number | null): string => (rate === null ? "—" : `${rate.toFixed(1)}%`);
```

- [ ] **Step 4: Run to see it pass**

Run: `pnpm --filter=vl exec vitest run lib/vl/suppression.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/vl/lib/vl/suppression.ts apps/vl/lib/vl/suppression.test.ts
git commit -m "feat(vl): suppression rate and colour bands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: VL card actions for both levels

**Files:**
- Modify: `apps/vl/app/(dashboard)/(index)/reports/vl-suppression-map/actions.ts`, `actions.test.ts`
- Modify: `apps/vl/lib/vl/types.ts` (`SuppressionByProvince` gains `location?: string | null`)

**Interfaces:**
- Consumes: Task 2 code tables (via `@repo/design_system/app/atoms/maps/Provinces`); Task 3 helpers.
- Produces:
  - `fetchProvinces(range, token)`, `fetchDistricts(range, province: string, token)` → `Promise<SuppressionByProvince[]>`
  - `fetchData(range, province: string | null, token)` → one of the two
  - `PROVINCE_NAMES: string[]` (the 11 DB/map names) and `DISTRICT_CODES: Record<string, Record<string,string>>` keyed by those names
  - `toProvinceColors(rows) → { provinces: Partial<Record<ProvinceKey, MapProvince>>, fillColors: Partial<Record<ProvinceKey, string>> }` — every province present (ratio 1), coloured by band, grey without data
  - `toDistrictColors(province, rows) → { districtRatios: Record<string, number>, customColors: Record<string, string> }` — every district of the province (ratio 1), colour by band, grey without data; matching trims and ignores case/accents; rows whose label is null or not a district of the province are ignored
  - `rowFor(rows, name)` — case/accent-insensitive
  - `toExcel(rows, levelLabel: "Província" | "Distrito")` — header `[levelLabel, ...names]`, rows as today plus "Taxa de Supressão (%)" with one decimal

- [ ] **Step 1: Replace `actions.test.ts`** with:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));
vi.mock("@repo/design_system/app/atoms/maps/Provinces", () => ({
  GAZA_DISTRICT_CODES: { MZ0900C1: "Xai-Xai", MZ0900C6: "Chokwe" },
  NIASSA_DISTRICT_CODES: {}, CABO_DELGADO_DISTRICT_CODES: {}, NAMPULA_DISTRICT_CODES: {}, ZAMBEZIA_DISTRICT_CODES: {},
  TETE_DISTRICT_CODES: {}, MANICA_DISTRICT_CODES: {}, SOFALA_DISTRICT_CODES: {}, INHAMBANE_DISTRICT_CODES: {},
  MAPUTO_PROVINCIA_DISTRICT_CODES: {}, MAPUTO_CIDADE_DISTRICT_CODES: {},
}));

import { fetchData, rowFor, toDistrictColors, toExcel, toProvinceColors } from "./actions";

const range = { start: "2025-10-15", end: "2026-10-15" };
const row = (label: string | null, suppressed: number, not_suppressed: number) => ({
  province: label, location: label, total: suppressed + not_suppressed, suppressed, not_suppressed,
  routine: 1, treatment_failure: 2, reason_not_specified: 0,
});

describe("vl-suppression-map actions", () => {
  beforeEach(() => { vlGet.mockReset(); vlGet.mockResolvedValue([]); });

  it("fetches provinces, then a province's districts with the drill params", async () => {
    await fetchData(range, null, "t");
    expect(vlGet).toHaveBeenLastCalledWith("/summary/suppression_by_province_by_month/", { interval_dates: "2025-10-15,2026-10-15" }, "t");
    await fetchData(range, "Gaza", "t");
    expect(vlGet).toHaveBeenLastCalledWith(
      "/summary/suppression_by_province_by_month/",
      { interval_dates: "2025-10-15,2026-10-15", facility_type: "province", disaggregation: "true", province: ["Gaza"] },
      "t",
    );
  });

  it("colours every province by band and greys provinces without data", () => {
    const { provinces, fillColors } = toProvinceColors([row("Gaza", 950, 50), row("Tete", 70, 30), row(null, 1, 1)]);
    expect(fillColors.gz).toBe("#00B000");
    expect(fillColors.tt).toBe("#EF5350");
    expect(fillColors.ns).toBe("#C4CDD5");
    expect(provinces.ns?.ratio).toBe(1);
    expect(Object.keys(fillColors)).toHaveLength(11);
  });

  it("colours every district of the province, matching names loosely", () => {
    const { districtRatios, customColors } = toDistrictColors("Gaza", [row("chókwè ", 85, 15), row(null, 5, 5)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#FFAB00" });
    expect(districtRatios).toEqual({ "Xai-Xai": 1, Chokwe: 1 });
  });

  it("ignores rows that are not districts of the province (production before the API release)", () => {
    const { customColors } = toDistrictColors("Gaza", [row("Gaza", 99, 1)]);
    expect(customColors).toEqual({ MZ0900C1: "#C4CDD5", MZ0900C6: "#C4CDD5" });
  });

  it("finds rows by name ignoring case and accents", () => {
    expect(rowFor([row("Chokwe", 1, 1)], "CHÓKWÈ")?.location).toBe("Chokwe");
  });

  it("exports the level being viewed", () => {
    const sheet = toExcel([row("Chokwe", 85, 15)], "Distrito");
    expect(sheet.header).toEqual(["Distrito", "Chokwe"]);
    expect(sheet.rows.find((r) => r[0] === "Taxa de Supressão (%)")).toEqual(["Taxa de Supressão (%)", "85.0"]);
  });
});
```

- [ ] **Step 2: Run to see it fail**

Run: `pnpm --filter=vl exec vitest run "app/(dashboard)/(index)/reports/vl-suppression-map"`
Expected: FAIL (missing exports).

- [ ] **Step 3: Implement `actions.ts`**

```ts
import {
  CABO_DELGADO_DISTRICT_CODES, GAZA_DISTRICT_CODES, INHAMBANE_DISTRICT_CODES, MANICA_DISTRICT_CODES,
  MAPUTO_CIDADE_DISTRICT_CODES, MAPUTO_PROVINCIA_DISTRICT_CODES, NAMPULA_DISTRICT_CODES, NIASSA_DISTRICT_CODES,
  SOFALA_DISTRICT_CODES, TETE_DISTRICT_CODES, ZAMBEZIA_DISTRICT_CODES,
} from "@repo/design_system/app/atoms/maps/Provinces";
import { vlGetList } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { provinceKey, type ProvinceKey } from "@/lib/vl/geo";
import { NO_DATA, suppressionBand, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { ENDPOINT } from "./constants";

export type MapProvince = { highlighted: boolean; highlightedColor: string; ratio: number };

/** Province names as the API and the national map use them, with their district code tables. */
export const DISTRICT_CODES: Record<string, Readonly<Record<string, string>>> = {
  Niassa: NIASSA_DISTRICT_CODES,
  "Cabo Delgado": CABO_DELGADO_DISTRICT_CODES,
  Nampula: NAMPULA_DISTRICT_CODES,
  Zambezia: ZAMBEZIA_DISTRICT_CODES,
  Tete: TETE_DISTRICT_CODES,
  Manica: MANICA_DISTRICT_CODES,
  Sofala: SOFALA_DISTRICT_CODES,
  Inhambane: INHAMBANE_DISTRICT_CODES,
  Gaza: GAZA_DISTRICT_CODES,
  "Maputo Provincia": MAPUTO_PROVINCIA_DISTRICT_CODES,
  "Maputo Cidade": MAPUTO_CIDADE_DISTRICT_CODES,
};
export const PROVINCE_NAMES = Object.keys(DISTRICT_CODES);

const norm = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

const labelOf = (row: SuppressionByProvince) => row.location ?? row.province;

export const fetchProvinces = (range: DateRange, token: string | null) =>
  vlGetList<SuppressionByProvince>(ENDPOINT, { interval_dates: intervalParam(range) }, token);

export const fetchDistricts = (range: DateRange, province: string, token: string | null) =>
  vlGetList<SuppressionByProvince>(
    ENDPOINT,
    { interval_dates: intervalParam(range), facility_type: "province", disaggregation: "true", province: [province] },
    token,
  );

export const fetchData = (range: DateRange, province: string | null, token: string | null) =>
  province ? fetchDistricts(range, province, token) : fetchProvinces(range, token);

export const rowFor = (rows: SuppressionByProvince[], name: string) =>
  rows.find((row) => labelOf(row) !== null && norm(labelOf(row)) === norm(name));

export function toProvinceColors(rows: SuppressionByProvince[]) {
  const provinces: Partial<Record<ProvinceKey, MapProvince>> = {};
  const fillColors: Partial<Record<ProvinceKey, string>> = {};
  for (const name of PROVINCE_NAMES) {
    const key = provinceKey(name);
    if (!key) continue;
    const color = suppressionBand(suppressionRate(rowFor(rows, name))).color;
    provinces[key] = { highlighted: true, highlightedColor: color, ratio: 1 };
    fillColors[key] = color;
  }
  return { provinces, fillColors };
}

export function toDistrictColors(province: string, rows: SuppressionByProvince[]) {
  const codes = DISTRICT_CODES[province] ?? {};
  const districtRatios: Record<string, number> = {};
  const customColors: Record<string, string> = {};
  for (const [code, district] of Object.entries(codes)) {
    const row = rowFor(rows, district);
    districtRatios[district] = 1;
    customColors[code] = row ? suppressionBand(suppressionRate(row)).color : NO_DATA.color;
  }
  return { districtRatios, customColors };
}

export function toExcel(rows: SuppressionByProvince[], levelLabel: "Província" | "Distrito"): ExcelSheet {
  const kept = rows.filter((r) => labelOf(r) !== null);
  const rate = (r: SuppressionByProvince) => {
    const value = suppressionRate(r);
    return value === null ? "" : value.toFixed(1);
  };
  return {
    header: [levelLabel, ...kept.map((r) => labelOf(r) as string)],
    rows: [
      ["Rotina", ...kept.map((r) => r.routine)],
      ["Falência Terapêutica", ...kept.map((r) => r.treatment_failure)],
      ["Motivo não especificado", ...kept.map((r) => r.reason_not_specified)],
      ["Supressão Viral", ...kept.map((r) => r.suppressed)],
      ["Taxa de Supressão (%)", ...kept.map(rate)],
      ["Amostras Testadas", ...kept.map((r) => r.total)],
    ],
  };
}
```

In `apps/vl/lib/vl/types.ts`, add `location?: string | null;` to `SuppressionByProvince`. Check `provinceKey("Maputo Provincia")` and `provinceKey("Maputo Cidade")` return `mp`/`mc` (they do per `lib/vl/geo.ts`); if any of the 11 names returns undefined, stop and report.

The old exports `toMapProvinces` and the old `toExcel(rows)` signature are replaced; Task 5 updates the only caller.

- [ ] **Step 4: Run to see it pass**

Run: `pnpm --filter=vl exec vitest run "app/(dashboard)/(index)/reports/vl-suppression-map"`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/vl/lib/vl/types.ts "apps/vl/app/(dashboard)/(index)/reports/vl-suppression-map/actions.ts" "apps/vl/app/(dashboard)/(index)/reports/vl-suppression-map/actions.test.ts"
git commit -m "feat(vl): suppression map data for provinces and districts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: VL card UI — drill-down, breadcrumb, band legend

**Files:**
- Modify: `.../vl-suppression-map/index.tsx`, `.../vl-suppression-map/docs.tsx`
- Create: `.../vl-suppression-map/suppression-legend.tsx`

**Interfaces:**
- Consumes: Task 4 (`fetchData`, `toProvinceColors`, `toDistrictColors`, `rowFor`, `toExcel`); Task 3 (`SUPPRESSION_BANDS`, `formatRate`, `suppressionRate`); Task 2 (`fillColors`, province components); `useReport(load, deps)` and `lastYear`/`formatRangePt` from the VL hooks/dates.

- [ ] **Step 1: Legend** — `suppression-legend.tsx`:

```tsx
import { SUPPRESSION_BANDS } from "@/lib/vl/suppression";

export function SuppressionLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#637381]" aria-label="Legenda">
      {SUPPRESSION_BANDS.map((band) => (
        <li key={band.id} className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-sm" style={{ backgroundColor: band.color }} />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Card** — replace `index.tsx`:

```tsx
"use client";

import { useState, type ComponentType } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import {
  CaboDelgado, Gaza, Inhambane, Manica, MaputoCidade, MaputoProvincia, Nampula, Niassa, Sofala, Tete, Zambezia,
} from "@repo/design_system/app/atoms/maps/Provinces";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@repo/design_system/components/ui/breadcrumb";
import { ReportCard } from "@/components/report-card";
import { useReport } from "@/hooks/use-report";
import { formatRangePt, lastYear, type DateRange } from "@/lib/vl/dates";
import { formatRate, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, rowFor, toDistrictColors, toExcel, toProvinceColors } from "./actions";
import { SuppressionLegend } from "./suppression-legend";
import Docs from "./docs";

const PROVINCE_MAPS: Record<string, ComponentType<any>> = {
  Niassa, "Cabo Delgado": CaboDelgado, Nampula, Zambezia, Tete, Manica, Sofala, Inhambane, Gaza,
  "Maputo Provincia": MaputoProvincia, "Maputo Cidade": MaputoCidade,
};

function Tooltip({ name, row }: { name: string; row: SuppressionByProvince | undefined }) {
  if (!row) return <span>{name}: sem dados</span>;
  return (
    <div className="space-y-1 text-xs">
      <strong>{name}</strong>
      <div>Supressão viral: {formatRate(suppressionRate(row))}</div>
      <div>Amostras testadas: {row.total}</div>
      <div>Rotina: {row.routine}</div>
      <div>Falência terapêutica: {row.treatment_failure}</div>
    </div>
  );
}

export default function VlSuppressionMap() {
  const [range, setRange] = useState<DateRange>(lastYear);
  const [province, setProvince] = useState<string | null>(null);
  // The province is a dependency: changing the dates while a province is open reloads its districts.
  const r = useReport((token) => fetchData(range, province, token), [range, province]);
  const rows = r.data ?? [];
  const ProvinceMap = province ? PROVINCE_MAPS[province] : null;

  return (
    <ReportCard
      title={TITLE}
      subtitle={formatRangePt(range)}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={false}
      onRetry={r.retry}
      onSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
      onRestart={() => {
        setRange(lastYear());
        setProvince(null);
      }}
      excel={() => toExcel(rows, province ? "Distrito" : "Província")}
      documentation={<Docs />}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-full px-1 text-xs text-[#637381]">
          {province ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={() => setProvince(null)}>Moçambique</button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{province}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            "Clique sobre a Província para mais detalhes"
          )}
        </div>
        {ProvinceMap ? (
          <ProvinceMap
            key={province}
            {...toDistrictColors(province as string, rows)}
            height="420px"
            showPopover
            legend="Supressão"
            onDistrictClick={() => {}}
            getPopoverContent={(name: string) => <Tooltip name={name} row={rowFor(rows, name)} />}
          />
        ) : (
          (() => {
            const { provinces, fillColors } = toProvinceColors(rows);
            return (
              <InteractiveSvgMap
                width="100%"
                height={420}
                provinces={provinces}
                fillColors={fillColors}
                showPopover
                onClick={(value: { key: string }) => setProvince(value.key)}
                getPopoverContent={(name: string) => <Tooltip name={name} row={rowFor(rows, name)} />}
              />
            );
          })()
        )}
        <SuppressionLegend />
      </div>
    </ReportCard>
  );
}
```

Before writing, check: `lastYear` and `formatRangePt` exports in `apps/vl/lib/vl/dates.ts` (used by `useRangeReport`) and the `ReportCard` prop names in `apps/vl/components/report-card.tsx`; adapt names, not behaviour. `empty={false}`: the map is meaningful without rows (all grey).

- [ ] **Step 3: Docs** — in `docs.tsx` add a short paragraph: provinces and districts are coloured by suppression band (list the five bands), clicking a province opens its districts, "Moçambique" returns.

- [ ] **Step 4: Checks**

```bash
pnpm --filter=vl test 2>&1 | tail -3
pnpm --filter=vl exec tsc --noEmit
pnpm --filter=vl lint
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add "apps/vl/app/(dashboard)/(index)/reports/vl-suppression-map"
git commit -m "feat(vl): suppression map drills from provinces into districts

Provinces and districts coloured by suppression band, breadcrumb back to
Moçambique, Reiniciar and the date filter apply at both levels, band legend.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verification

- [ ] **Step 1: Build** — `pnpm --filter=vl build` and `pnpm --filter=tb build` both succeed (stop the 3002/3003 dev servers during the builds if memory is tight, then restart them detached).
- [ ] **Step 2: TB unchanged** — on TB (3003), the "Relatório de Positividade a Nível Nacional" card: national map shading and the Gaza district map look as before.
- [ ] **Step 3: VL national (production API)** — on 3002, provinces coloured by band; colours match `formatRate` in the tooltip; legend shows the five bands.
- [ ] **Step 4: VL districts** — needs the backend change. Ask the user before pushing `feat/vl-suppression-by-district` and opening the PR to `dev`; once deployed to dev.openldr.org.mz, run VL with `NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz` and check Gaza and Maputo Cidade: every district coloured or grey, sums match the province, breadcrumb back, Reiniciar, date change while drilled in, Excel at both levels, PNG, light and dark. Against production (before the release) a click must show the district map all grey without errors.
- [ ] **Step 5: Report** — results, any deviations, and the next outward steps (API PR/merge/release, push of the dashboard branch), each to be approved by the user.
