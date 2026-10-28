import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { facilityParams, INITIAL_DRILL } from "@repo/design_system/lib/report/drill";
import { categoryParams, DEFAULT_CATEGORY, segmentTitle } from "@/lib/eid/tat-segment";
import { TAT_BRACKETS, TAT_SEGMENTS } from "@/lib/eid/series";
import { toChart, toExcel } from "./actions";
import { ENDPOINT, TITLE } from "./constants";

const range = { start: "2026-01-01", end: "2026-06-30" };
const source = () => readFileSync(join(__dirname, "index.tsx"), "utf8");

describe("eid-tat-days-by-month", () => {
  it("uses its endpoint and title", () => {
    expect(ENDPOINT).toBe("/facilities/tat_days_by_month/");
    expect(TITLE).toBe("Tempo de Resposta por Mês (em dias)");
  });
  it("first request equals the cache seed: no lab_type, no category", () => {
    expect(source()).toContain("endpoint={ENDPOINT}");
    expect(facilityParams(range, INITIAL_DRILL, categoryParams(DEFAULT_CATEGORY))).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "province",
      disaggregation: "false",
    });
  });
  it("builds one stack per bar from the shared series", () => {
    const row = { year: 2026, month: 3, category: "analysis_validation", lt_7: 1, between_7_15: 2, between_16_21: 3, gt_21: 4, no_dates: 5 };
    const c = toChart([row] as never);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.name)).toEqual((TAT_BRACKETS).map((s) => s.label));
    expect(toExcel([row] as never).header[0]).toBe("Mês");
  });
  it("category is omitted at segment 0 and sent at 3", () => {
    expect(facilityParams(range, INITIAL_DRILL, categoryParams(0)).category).toBeUndefined();
    expect("category" in facilityParams(range, INITIAL_DRILL, categoryParams(0))).toBe(false);
    expect(facilityParams(range, INITIAL_DRILL, categoryParams(3)).category).toBe(3);
  });
  it("test_reset_sends_no_category: reset returns to the default segment", () => {
    expect(source()).toContain("onRestart={() => setCategory(DEFAULT_CATEGORY)}");
    expect("category" in facilityParams(range, INITIAL_DRILL, categoryParams(DEFAULT_CATEGORY))).toBe(false);
  });
  it("titles carry the segment", () => {
    expect(segmentTitle(TITLE, 2)).toBe(TITLE + " - " + TAT_SEGMENTS[2].label);
  });
});
