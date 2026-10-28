import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { codeOf, fetchData, labelOf, toChart, toExcel } from "./actions";
import { EXTRA_PARAMS } from "./constants";

const range = { start: "2026-01-01", end: "2026-06-30" };
const lab = { testing_facility: "Lab A", testing_facility_code: "P01", total: 10, positive: 3, negative: 7 };
const province = { requesting_facility: "Gaza", total: 4, positive: 6, negative: 0 };

describe("eid-tested-by-lab-conventional", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", EXTRA_PARAMS);
    expect(eidGet).toHaveBeenCalledWith("/laboratories/tested_samples/", { interval_dates: "2026-01-01,2026-06-30", lab_type: "conventional" }, "t");
  });
  it("sends the chosen lab codes", async () => {
    await fetchData(range, ["P01"], "t", EXTRA_PARAMS);
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("keeps the drill's lab_code instead of doubling it", async () => {
    await fetchData(range, ["P01", "P02"], "t", { ...EXTRA_PARAMS, facility_type: "lab", disaggregation: "true", lab_code: ["P01"] });
    expect(eidGet.mock.calls[0][1]).toEqual({
      interval_dates: "2026-01-01,2026-06-30",
      lab_type: "conventional",
      facility_type: "lab",
      disaggregation: "true",
      lab_code: ["P01"],
    });
  });
  it("plots Positivo = positive and Negativo = total - positive, floored at 0", () => {
    const c = toChart([lab, province]);
    expect(c.labels).toEqual(["Lab A", "Gaza"]);
    expect(c.series.map((s) => [s.name, s.data])).toEqual([
      ["Positivo", [3, 6]],
      ["Negativo", [7, 0]],
    ]);
  });
  it("labels and codes: testing_facility at lab level, requesting_facility below", () => {
    expect(labelOf(lab)).toBe("Lab A");
    expect(codeOf(lab)).toBe("P01");
    expect(labelOf(province)).toBe("Gaza");
    expect(codeOf(province)).toBeUndefined();
    expect(codeOf({ ...lab, testing_facility_code: null })).toBeUndefined();
  });
  it("leaves out rows with no name", () => {
    expect(toChart([{ testing_facility: null, total: 1, positive: 0, negative: 1 }, lab]).labels).toEqual(["Lab A"]);
  });
  it("Excel corner follows the level", () => {
    expect(toExcel([lab], "lab").header[0]).toBe("Laboratório");
    expect(toExcel([province], "province").header[0]).toBe("Província");
    expect(toExcel([province], "district").header[0]).toBe("Distrito");
    expect(toExcel([province], "health_facility").header[0]).toBe("Unidade Sanitária");
    expect(toExcel([lab]).header[0]).toBe("Laboratório");
  });
});
