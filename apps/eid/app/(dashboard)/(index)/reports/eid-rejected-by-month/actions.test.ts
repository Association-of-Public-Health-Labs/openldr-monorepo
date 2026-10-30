import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { REJECTION_REASONS } from "@/lib/eid/series";
import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  {
    year: 2026,
    month: 3,
    month_name: "March",
    repeat_test: 1,
    insufficient_sample: 2,
    request_without_sample: 3,
    technical_problems: 4,
    overlapping_blood: 5,
    duplicate_registration: 6,
    misidentified_sample: 7,
    sample_over_30_days: 8,
    other: 9,
    total: 50,
  },
];

describe("eid-rejected-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("fetches summary/rejected_samples_by_month/ with only the period", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/rejected_samples_by_month/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });

  it("stacks the 9 reasons in order", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.name)).toEqual(REJECTION_REASONS.map((r) => r.label));
    expect(c.series.map((s) => s.data[0])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("ends the Excel with a Total row equal to total, which may exceed the sum of reasons", () => {
    const sheet = toExcel(rows);
    expect(sheet.header).toEqual(["Motivo de rejeição", "Mar/26"]);
    expect(sheet.rows).toHaveLength(10);
    expect(sheet.rows[9]).toEqual(["Total", 50]);
  });
});
