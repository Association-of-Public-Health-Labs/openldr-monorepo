import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { TAT_BRACKETS } from "@/lib/eid/series";
import { fetchData, titleFor, toChart, toExcel } from "./actions";

const range = { start: "2026-01-01", end: "2026-06-30" };
const rows = [
  { year: 2026, month: 3, month_name: "March", category: "lab_registration_analysis" as const, lt_7: 5, between_7_15: 4, between_16_21: 3, gt_21: 2, no_dates: 1 },
];

describe("eid-tat-brackets", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("sends no category for the default segment 0", async () => {
    await fetchData(range, 0, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/tat_samples/", { interval_dates: "2026-01-01,2026-06-30" }, "t");
    expect("category" in eidGet.mock.calls[0][1]).toBe(false);
  });

  it("sends category for another segment", async () => {
    await fetchData(range, 3, "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/tat_samples/", { interval_dates: "2026-01-01,2026-06-30", category: 3 }, "t");
  });

  it("titles the card with the segment label", () => {
    expect(titleFor(4)).toBe("TRL - Registo à Análise");
    expect(titleFor(0)).toBe("TRL - Colheita na US a Recepção no Hub");
  });

  it("stacks 5 brackets in order", () => {
    const c = toChart(rows);
    expect(c.series.map((s) => s.name)).toEqual(TAT_BRACKETS.map((b) => b.label));
    expect(c.series.map((s) => s.data[0])).toEqual([5, 4, 3, 2, 1]);
  });

  it("exports one row per bracket", () => {
    expect(toExcel(rows).header).toEqual(["Tempo Resposta", "Mar/26"]);
    expect(toExcel(rows).rows).toHaveLength(5);
  });
});
