import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { TAT_BRACKETS } from "@/lib/eid/series";
import { extraParamsFor, fetchData, titleFor, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const row = (name: string | null, n: number) => ({
  testing_facility: name,
  testing_facility_code: "P01",
  category: "lab_registration_analysis",
  lt_7: n,
  between_7_15: n + 1,
  between_16_21: n + 2,
  gt_21: n + 3,
  no_dates: n + 4,
});

describe("eid-trl-by-lab", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed", async () => {
    await fetchData(range, [], "t", extraParamsFor(0));
    expect(eidGet).toHaveBeenCalledWith("/laboratories/tat_samples/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
    expect("category" in eidGet.mock.calls[0][1]).toBe(false);
  });
  it("sends category only when it is not 0", async () => {
    await fetchData(range, [], "t", extraParamsFor(3));
    expect(eidGet.mock.calls[0][1]).toEqual({ interval_dates: "2026-01-01,2026-06-30", category: 3 });
  });
  it("sends the chosen lab codes", async () => {
    await fetchData(range, ["P01"], "t", extraParamsFor(2));
    expect(eidGet.mock.calls[0][1]).toEqual({ interval_dates: "2026-01-01,2026-06-30", category: 2, lab_code: ["P01"] });
  });
  it("titles the card with the segment label", () => {
    expect(titleFor(4)).toBe("TRL - Registo à Análise");
    expect(titleFor(0)).toBe("TRL - Colheita na US a Recepção no Hub");
  });
  it("one bar per lab, 5 brackets, skipping nameless rows", () => {
    const c = toChart([row("Lab A", 1), row(null, 9), row("Lab B", 10)]);
    expect(c.labels).toEqual(["Lab A", "Lab B"]);
    expect(c.series.map((s) => s.name)).toEqual(TAT_BRACKETS.map((b) => b.label));
    expect(c.series[0].data).toEqual([1, 10]);
  });
  it("exports with Laboratório in the corner", () => {
    expect(toExcel([row("Lab A", 1)]).header).toEqual(["Laboratório", "Lab A"]);
  });
});
