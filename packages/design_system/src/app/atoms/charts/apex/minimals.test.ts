import { describe, expect, it } from "vitest";
// The module itself, not the MUI barrel (which touches `window`).
import { mergeChartOptions, withMinimalsChart } from "../../../../../../design_system_mui/src/themes/minimals-chart";

describe("withMinimalsChart", () => {
  it("rounds the top corners of columns (both sides), on the top segment of a stack", () => {
    const { plotOptions } = withMinimalsChart({ plotOptions: { bar: { borderRadius: 1, columnWidth: "70%" } } }, "stacked");
    expect(plotOptions.bar).toMatchObject({ borderRadius: 4, borderRadiusApplication: "end", borderRadiusWhenStacked: "last", columnWidth: "40%" });
  });

  it("keeps the chart's data, events, colours and formatters", () => {
    const click = () => {};
    const formatter = (v: number) => `${v}%`;
    const out = withMinimalsChart(
      { chart: { id: "c", events: { click } }, colors: ["#f00"], xaxis: { categories: ["a"] }, yaxis: { labels: { formatter } } },
      "bar",
    );
    expect(out.chart).toMatchObject({ id: "c", events: { click }, toolbar: { show: false } });
    expect(out.colors).toEqual(["#f00"]);
    expect(out.xaxis.categories).toEqual(["a"]);
    expect(out.yaxis.labels.formatter).toBe(formatter);
    expect(out.yaxis.labels.style.fontSize).toBe("11px");
  });

  it("styles every y axis of a dual-axis chart", () => {
    const out = withMinimalsChart({ yaxis: [{ opposite: false }, { opposite: true }] }, "mixed");
    expect(out.yaxis).toHaveLength(2);
    for (const axis of out.yaxis) expect(axis.labels.style.colors).toBe("#919EAB");
    expect(out.yaxis[1].opposite).toBe(true);
  });

  it("draws line charts as smooth lines over a fading fill, with a shared tooltip", () => {
    const out = withMinimalsChart({ stroke: { width: 4 } }, "area");
    expect(out.stroke).toMatchObject({ width: 2.5, curve: "smooth" });
    expect(out.fill.gradient).toMatchObject({ opacityFrom: 0.4, opacityTo: 0 });
    expect(out.tooltip).toMatchObject({ shared: true, intersect: false });
  });

  it("keeps the line widths of a mixed chart", () => {
    expect(withMinimalsChart({ stroke: { width: [0, 4] } }, "mixed").stroke.width).toEqual([0, 4]);
  });

  it("legend on the top right with small round markers (pies keep it at the bottom)", () => {
    expect(withMinimalsChart({ legend: { position: "bottom" } }, "bar").legend).toMatchObject({ position: "top", horizontalAlign: "right", markers: { size: 7 } });
    expect(withMinimalsChart({}, "pie").legend).toMatchObject({ position: "bottom", horizontalAlign: "center" });
  });

  it("merges without changing its inputs", () => {
    const base = { a: { b: 1 } };
    expect(mergeChartOptions(base, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } });
    expect(base).toEqual({ a: { b: 1 } });
  });
});
