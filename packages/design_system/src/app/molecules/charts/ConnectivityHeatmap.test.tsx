import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConnectivityHeatmap, heatmapWeeks, monthLabels } from "./ConnectivityHeatmap";

const days = (start: string, n: number, uptime = 90) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), uptime };
  });

describe("ConnectivityHeatmap", () => {
  it("draws one titled cell per day", () => {
    const html = renderToStaticMarkup(<ConnectivityHeatmap data={days("2026-11-02", 14)} />);
    expect(html.match(/data-cell="day"/g)).toHaveLength(14);
    expect(html).toContain('title="02/11/2026: 90%"');
  });

  it("says so when there is no data", () => {
    expect(renderToStaticMarkup(<ConnectivityHeatmap data={[]} />)).toContain("Sem dados para o período e filtros seleccionados.");
  });

  it("puts each day in a Monday-first week column", () => {
    // 2026-11-01 is a Sunday: it ends the first week; Monday 2026-11-02 starts the second.
    const weeks = heatmapWeeks(days("2026-11-01", 2));
    expect(weeks).toHaveLength(2);
    expect(weeks[0].cells[6]?.date).toBe("2026-11-01");
    expect(weeks[1].cells[0]?.date).toBe("2026-11-02");
  });

  it("keeps square 12 px days and scrolls sideways when the weeks don't fit", () => {
    const html = renderToStaticMarkup(<ConnectivityHeatmap data={days("2026-11-02", 14)} />);
    expect(html).toContain("repeat(2, 12px)");
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("size-3");
  });

  it("labels each month once, dropping one that would collide with the previous label", () => {
    // Nov has one week, so its label gives way to "Dez" one column later; "Jan" is far enough.
    expect(monthLabels([{ month: 10 }, { month: 11 }, { month: 11 }, { month: 11 }, { month: 0 }])).toEqual(["", "Dez", "", "", "Jan"]);
  });
});
