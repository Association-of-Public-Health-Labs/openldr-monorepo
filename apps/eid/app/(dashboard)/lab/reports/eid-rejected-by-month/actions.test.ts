import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const rows = [{ year: 2026, month: 3, month_name: "March", repeat_test: 1, insufficient_sample: 2, request_without_sample: 3, technical_problems: 4, overlapping_blood: 5, duplicate_registration: 6, misidentified_sample: 7, sample_over_30_days: 8, other: 9, total: 50 }];

describe("lab eid-rejected-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", {});
    expect(eidGet).toHaveBeenCalledWith("/laboratories/rejected_samples_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });
  it("sends the chosen lab codes", async () => {
    await fetchData(range, ["P01"], "t", {});
    expect(eidGet.mock.calls[0][1].lab_code).toEqual(["P01"]);
  });
  it("stacks the 9 reasons by month", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("Excel Total row is the API total, which may exceed the sum of reasons (R10)", () => {
    const s = toExcel(rows);
    expect(s.header).toEqual(["Motivo de rejeição", "Mar/26"]);
    expect(s.rows[9]).toEqual(["Total", 50]);
  });
});
