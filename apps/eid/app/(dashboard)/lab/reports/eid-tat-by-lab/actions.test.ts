import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { TAT_SEGMENTS } from "@/lib/eid/series";
import { codeOf, fetchData, labelOf, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const seg = (n: number) => ({
  collection_hub_reception: n,
  hub_reception_hub_registration: n + 1,
  hub_registration_lab_reception: n + 2,
  lab_reception_lab_registration: n + 3,
  lab_registration_analysis: n + 4,
  analysis_validation: n + 5,
});
const lab = { testing_facility: "Lab A", testing_facility_code: "P01", ...seg(1) };
const province = { requesting_facility: "Gaza", ...seg(2) };
const district = { requesting_facility: "Chókwè", province: "Gaza", ...seg(3) };
const facility = { requesting_facility: "US 1", province: "Gaza", district: "Chókwè", ...seg(4) };

describe("eid-tat-by-lab", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t");
    expect(eidGet).toHaveBeenCalledWith("/laboratories/tat/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the chosen lab codes, and the drill's lab_code instead of doubling it", async () => {
    await fetchData(range, ["P01", "P02"], "t", {});
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01", "P02"]);
    await fetchData(range, ["P01", "P02"], "t", { facility_type: "lab", disaggregation: "true", lab_code: ["P01"] });
    expect(eidGet.mock.calls[1][1]).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      facility_type: "lab",
      disaggregation: "true",
      lab_code: ["P01"],
    });
  });
  it("labelOf and codeOf at each level", () => {
    expect(labelOf(lab)).toBe("Lab A");
    expect(codeOf(lab)).toBe("P01");
    expect(labelOf(province)).toBe("Gaza");
    expect(labelOf(district)).toBe("Chókwè");
    expect(labelOf(facility)).toBe("US 1");
    expect(codeOf(facility)).toBeUndefined();
  });
  it("stacks the 6 segments, skipping nameless rows", () => {
    const c = toChart([lab, { testing_facility: null, ...seg(0) }, { ...lab, testing_facility: "Lab B", ...seg(10) }]);
    expect(c.labels).toEqual(["Lab A", "Lab B"]);
    expect(c.series.map((s) => s.name)).toEqual(TAT_SEGMENTS.map((s) => s.label));
    expect(c.series[0].data).toEqual([1, 10]);
  });
  it("null segments plot as 0", () => {
    expect(toChart([{ ...lab, analysis_validation: null }]).series[5].data).toEqual([0]);
  });
  it("Excel: one row per bar, corner follows the level, no extra columns at lab level", () => {
    const x = toExcel([lab], "lab");
    expect(x.header).toEqual(["Laboratório", ...TAT_SEGMENTS.map((s) => s.label)]);
    expect(x.rows).toEqual([["Lab A", 1, 2, 3, 4, 5, 6]]);
    expect(toExcel([province], "province").header[0]).toBe("Província");
    expect(toExcel([province]).header[0]).toBe("Laboratório");
  });
  it("Excel adds Província/Distrito columns when the rows carry them", () => {
    const d = toExcel([district], "district");
    expect(d.header.slice(0, 2)).toEqual(["Distrito", "Província"]);
    expect(d.rows[0].slice(0, 2)).toEqual(["Chókwè", "Gaza"]);
    const f = toExcel([facility], "health_facility");
    expect(f.header.slice(0, 3)).toEqual(["Unidade Sanitária", "Província", "Distrito"]);
    expect(f.rows[0].slice(0, 3)).toEqual(["US 1", "Gaza", "Chókwè"]);
  });
});
