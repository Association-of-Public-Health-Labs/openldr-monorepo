import { beforeEach, describe, expect, it, vi } from "vitest";

const vlGet = vi.fn();
vi.mock("@/lib/vl/api", () => ({ vlGet: (...a: unknown[]) => vlGet(...a), vlGetList: (...a: unknown[]) => vlGet(...a) }));

import { fetchData, toChart, toExcel } from "./actions";

const rows = [
  { semester: "17S1", disalinks: 28, tat: 46 },
  { semester: "17S2", disalinks: 67, tat: 20 },
];

describe("vl-tat-vs-disalinks", () => {
  beforeEach(() => {
    vlGet.mockReset();
    vlGet.mockResolvedValue([]);
  });
  it("fetches the static endpoint without date params", async () => {
    await fetchData("t");
    expect(vlGet).toHaveBeenCalledWith("/summary/tat_vs_disalinks/", {}, "t");
  });
  it("draws TAT on the left axis and Disalinks on the right", () => {
    const c = toChart(rows);
    expect(c.labels).toEqual(["17S1", "17S2"]);
    expect(c.series.map((s) => [s.name, s.yAxis, s.data])).toEqual([
      ["TAT", 0, [46, 20]],
      ["#Disalinks", 1, [28, 67]],
    ]);
  });
  it("exports the legacy rows", () => {
    expect(toExcel(rows)).toEqual({
      header: ["", "17S1", "17S2"],
      rows: [["Tempo de Resposta", 46, 20], ["# Disalinks", 28, 67]],
    });
  });
});
