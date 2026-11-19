import { describe, it, expect } from "vitest";
import { buildHeatmap, heatmapStats } from "./heatmap";

const range = { startDate: "2025-08-01", endDate: "2025-08-03" };
describe("buildHeatmap", () => {
  it("emits one cell per day at 100% when no outages", () => {
    const cells = buildHeatmap([], range, "2025-01-01");
    expect(cells).toHaveLength(3);
    expect(cells.every(c => c.uptime === 100)).toBe(true);
    expect(cells[0].date).toBe("2025-08-01");
  });
  it("reduces uptime on a day with a 12h outage", () => {
    const logs = [{ id: "1", code: null, name: null, teamviewer_id: null,
      start_date: "2025-08-02T00:00:00Z", end_date: "2025-08-02T12:00:00Z",
      status: "COMPLETED", created_at: "", updated_at: "" }];
    const cells = buildHeatmap(logs, range, "2025-01-01");
    expect(cells[1].uptime).toBe(50);
  });
  it("starts at hostCreatedAt when it is later than range start", () => {
    const cells = buildHeatmap([], range, "2025-08-02");
    expect(cells).toHaveLength(2);
    expect(cells[0].date).toBe("2025-08-02");
  });
});

describe("buildHeatmap with duplicate records", () => {
  const log = (s: string, e: string) => ({ id: s + e, code: null, name: null, teamviewer_id: null,
    start_date: s, end_date: e, status: "COMPLETED", created_at: "", updated_at: "" });
  it("counts overlapping copies of one outage once", () => {
    // The poller logs the same outage several times; three copies of 6 h must still be 6 h (75%).
    const copies = [log("2025-08-02T06:00:00Z", "2025-08-02T12:00:00Z"), log("2025-08-02T06:00:10Z", "2025-08-02T12:00:00Z"), log("2025-08-02T06:00:20Z", "2025-08-02T11:00:00Z")];
    expect(buildHeatmap(copies, range, "2025-01-01")[1].uptime).toBe(75);
  });
});

describe("heatmapStats", () => {
  const cells = (u: number[]) => u.map((uptime, i) => ({ date: `2025-08-${String(i + 1).padStart(2, "0")}`, uptime }));
  it("counts clean, partial and fully offline days and the longest offline run", () => {
    expect(heatmapStats(cells([100, 50, 0, 0, 100, 0, 0, 0, 30]))).toEqual({ clean: 2, partial: 2, offline: 5, longestOffline: 3 });
  });
  it("is all zeros for no days", () => {
    expect(heatmapStats([])).toEqual({ clean: 0, partial: 0, offline: 0, longestOffline: 0 });
  });
});
