import { describe, expect, it } from "vitest";
import { apexOrder, buildComboOptions, toApexSeries } from "./combo-options";
import type { Series } from "./series";

const bars: Series[] = [
  { name: "Registadas", color: "#00b000", data: [1, 2] },
  { name: "Testadas", color: "#fb8c00", data: [3, 4] },
];
const tat: Series = { name: "TRL", color: "#000000", type: "line", yAxis: 1, data: [10, 12] };

describe("buildComboOptions", () => {
  it("sets the chart id, colours, categories and per-series stroke widths", () => {
    const o = buildComboOptions({ id: "c1-chart", labels: ["A", "B"], series: [...bars, tat] });
    expect(o.chart?.id).toBe("c1-chart");
    expect(o.colors).toEqual(["#00b000", "#fb8c00", "#000000"]);
    expect(o.xaxis?.categories).toEqual(["A", "B"]);
    expect(o.stroke?.width).toEqual([0, 0, 3]);
  });

  it("builds one y-axis entry per series for dual axes, sharing by seriesName and showing each axis once", () => {
    const o = buildComboOptions({ id: "c", labels: [], series: [...bars, tat], yTitles: ["Amostras", "Dias"] });
    const y = o.yaxis as any[];
    expect(y).toHaveLength(3);
    expect(y.map((a) => [a.seriesName, a.opposite, a.show])).toEqual([
      ["Registadas", false, true],
      ["Registadas", false, false],
      ["TRL", true, true],
    ]);
    expect(y[2].title.text).toBe("Dias");
  });

  it("uses a single y-axis object when no series is on the right", () => {
    const o = buildComboOptions({ id: "c", labels: [], series: bars, stacked: true });
    expect(Array.isArray(o.yaxis)).toBe(false);
    expect(o.chart?.stacked).toBe(true);
  });

  it("hides the legend and markers for sparklines", () => {
    const o = buildComboOptions({ id: "s", labels: [], series: [{ ...tat, yAxis: 0 }], sparkline: true });
    expect(o.chart?.sparkline?.enabled).toBe(true);
    expect(o.legend?.show).toBe(false);
  });

  it("gives each axis its own range and format (counts with pt-PT grouping, % on the right)", () => {
    const o = buildComboOptions({
      id: "c",
      labels: [],
      series: [...bars, tat],
      axes: [{ format: "count" }, { min: 0, max: 100, format: "percent" }],
    });
    const y = o.yaxis as any[];
    expect(y[0].labels.formatter(28633)).toBe((28633).toLocaleString("pt-PT"));
    expect(y[2]).toMatchObject({ min: 0, max: 100 });
    expect(y[2].labels.formatter(91.7)).toBe("91.7%");
    expect(y[0].min).toBeUndefined();
  });

  it("draws a dashed target line on the axis it belongs to", () => {
    const o = buildComboOptions({
      id: "c",
      labels: [],
      series: [...bars, tat],
      target: { value: 95, label: "Meta 95%", axis: 1, color: "#00B000" },
    });
    const line = o.annotations?.yaxis?.[0];
    expect(line).toMatchObject({ y: 95, yAxisIndex: 2, borderColor: "#00B000", strokeDashArray: 4 });
    expect(line?.label?.text).toBe("Meta 95%");
  });

  it("formats data labels as percentages when asked", () => {
    const o = buildComboOptions({ id: "p", labels: [], series: [{ ...tat, yAxis: 0 }], percentLabels: true });
    expect(o.dataLabels?.enabled).toBe(true);
    expect((o.dataLabels?.formatter as (v: number) => string)(42)).toBe("42%");
  });
});

describe("apexOrder", () => {
  it("puts lines first in a stacked chart, so Apex rounds only the top segment of each stack", () => {
    const ordered = apexOrder([...bars, tat], true);
    expect(ordered.map((s) => s.name)).toEqual(["TRL", "Registadas", "Testadas"]);
  });
  it("keeps the order otherwise", () => {
    expect(apexOrder([...bars, tat], false).map((s) => s.name)).toEqual(["Registadas", "Testadas", "TRL"]);
  });
});

describe("hideLegend", () => {
  it("hides the Apex legend when the card draws its own", () => {
    expect(buildComboOptions({ id: "c", labels: [], series: [...bars, tat], hideLegend: true }).legend?.show).toBe(false);
  });
});

describe("toApexSeries", () => {
  it("defaults to column, keeps line types and passes stack groups", () => {
    expect(toApexSeries([{ name: "H", color: "#0", data: [1], group: "Homens" }, tat])).toEqual([
      { name: "H", type: "column", data: [1], group: "Homens" },
      { name: "TRL", type: "line", data: [10, 12] },
    ]);
  });
});
