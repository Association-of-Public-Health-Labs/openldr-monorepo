import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { exportSubtitleFor, fetchData, toExcel, toTable } from "./actions";

const rows = [
  { year: 2026, month: 3, month_name: "March", registered: 10, tested: 8, rejected: 1, pending: 1 },
  { year: 2026, month: 4, month_name: "April", registered: 5, tested: 5, rejected: 0, pending: 0 },
];

describe("eid-key-indicators", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });

  it("sends lab_type for the chosen tab", async () => {
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "poc", "t");
    expect(eidGet).toHaveBeenCalledWith("/summary/indicators/", { interval_dates: "2026-01-01,2026-06-30", lab_type: "poc" }, "t");
    await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "conventional", "t");
    expect(eidGet.mock.calls[1][1].lab_type).toBe("conventional");
  });

  it("tags the fetched rows with the lab type they were fetched for", async () => {
    eidGet.mockResolvedValueOnce(rows);
    const data = await fetchData({ start: "2026-01-01", end: "2026-06-30" }, "poc", "t");
    expect(data).toEqual({ labType: "poc", rows });
  });

  it("names the lab type of the applied rows in the export subtitle, not the selected tab", () => {
    expect(exportSubtitleFor("01/01/2026 - 30/06/2026", { labType: "conventional", rows })).toBe("01/01/2026 - 30/06/2026 | Convencional");
    expect(exportSubtitleFor("x", { labType: "poc", rows })).toBe("x | PoC");
    expect(exportSubtitleFor("x", undefined, "poc")).toBe("x | PoC");
  });

  it("puts the 4 indicators in rows and the months in columns", () => {
    const t = toTable(rows);
    expect(t.columns).toEqual(["Mar/26", "Abr/26"]);
    expect(t.rows.map((r) => r.label)).toEqual(["Registadas", "Testadas", "Rejeitadas", "Pendentes"]);
    expect(t.rows[3].values).toEqual([1, 0]);
  });

  it("exports the same table", () => {
    expect(toExcel(rows).header).toEqual(["Indicadores", "Mar/26", "Abr/26"]);
    expect(toExcel(rows).rows[0]).toEqual(["Registadas", 10, 5]);
  });
});
