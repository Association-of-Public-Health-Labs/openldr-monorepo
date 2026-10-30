import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { TAT_SEGMENTS } from "@/lib/eid/series";
import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  {
    year: 2026,
    month: 3,
    month_name: "March",
    collection_hub_reception: 4,
    hub_reception_hub_registration: 1,
    hub_registration_lab_reception: 2,
    lab_reception_lab_registration: 3,
    lab_registration_analysis: 6,
    analysis_validation: null,
  },
];

describe("eid-tat-by-month", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("fetches summary/tat/ with only the period", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/tat/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
  });

  it("stacks the 6 segments in API order, null as 0", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["Mar/26"]);
    expect(c.series.map((s) => s.name)).toEqual(TAT_SEGMENTS.map((s) => s.label));
    expect(c.series.map((s) => s.data[0])).toEqual([4, 1, 2, 3, 6, 0]);
  });

  it("exports one row per segment", () => {
    expect(toExcel(rows).header).toEqual(["Tempo Resposta", "Mar/26"]);
    expect(toExcel(rows).rows).toHaveLength(6);
  });
});
