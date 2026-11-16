import { describe, it, expect } from "vitest";
import { buildHeatmap } from "./heatmap";

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
