import React, { useRef } from "react";
import Chart from "react-apexcharts";
import { withMinimalsChart } from "../../../themes/minimals-chart";

export type TargetTrendProps = {
  id?: string;
  /** One label per point ("2–8 Nov"). */
  labels: string[];
  /** Percentages 0–100; null where there is no data (the line breaks). */
  values: (number | null)[];
  /** Target percentage, a dashed line. */
  target: number;
  /** Points highlighted with a band (the period being viewed). */
  selected?: { from: number; to: number };
  /** Extra tooltip line per point ("105 amostras"). */
  detail?: (index: number) => string;
  color?: string;
  height?: number;
  /** The point under the cursor, null when it leaves the chart (e.g. to highlight that week elsewhere). */
  onHover?: (index: number | null) => void;
  /** Where the points lie, in px from the chart's left edge: first point and the span to the last. */
  onPlotArea?: (area: { left: number; width: number }) => void;
};

/** A share over time against its target, as a Minimals area chart ("Yearly sales"). */
export function TargetTrend({ id, labels, values, target, selected, detail, color = "#00B000", height = 160, onHover, onPlotArea }: TargetTrendProps) {
  // Read at event time: a new callback must not count as new options (Apex would redraw).
  const hover = useRef(onHover);
  hover.current = onHover;
  const plotArea = useRef(onPlotArea);
  plotArea.current = onPlotArea;
  const reportPlot = (chart: { w?: { globals?: { translateX?: number; gridWidth?: number } } }) => {
    const g = chart?.w?.globals;
    if (g && typeof g.translateX === "number" && typeof g.gridWidth === "number") plotArea.current?.({ left: g.translateX, width: g.gridWidth });
  };
  // Apex fails to draw an area with no point at all ("parser Error"): an area with no samples in any week.
  if (!values.some((v) => typeof v === "number" && Number.isFinite(v))) {
    return (
      <div id={id} className="flex items-center justify-center text-xs text-[#919EAB]" style={{ height }}>
        Sem dados nas semanas apresentadas
      </div>
    );
  }
  const options = {
    chart: {
      id,
      sparkline: { enabled: false },
      parentHeightOffset: 0,
      animations: { dynamicAnimation: { enabled: false } },
      events: {
        mouseMove: (_event: unknown, _chart: unknown, config: { dataPointIndex?: number }) => {
          const index = config?.dataPointIndex ?? -1;
          hover.current?.(index >= 0 ? index : null);
        },
        mouseLeave: () => hover.current?.(null),
        mounted: reportPlot,
        updated: reportPlot,
      },
    },
    colors: [color],
    xaxis: {
      categories: labels,
      // Two labels are enough on a small card: first and last week.
      labels: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { min: 0, max: 100, tickAmount: 2, labels: { formatter: (v: number) => `${Math.round(v)}` } },
    grid: { padding: { left: 0, right: 8, top: -8, bottom: -12 } },
    dataLabels: { enabled: false },
    legend: { show: false },
    annotations: {
      yaxis: [
        {
          y: target,
          borderColor: "#919EAB",
          strokeDashArray: 4,
          label: { text: `alvo ${target}%`, position: "right", textAnchor: "end", offsetY: -2, borderWidth: 0, style: { background: "transparent", color: "#919EAB", fontSize: "10px" } },
        },
      ],
      xaxis: selected
        ? [{ x: labels[selected.from], x2: labels[selected.to], fillColor: color, opacity: 0.12, borderColor: "transparent" }]
        : [],
    },
    markers: { size: 0, hover: { size: 5 } },
    tooltip: {
      x: { show: true },
      y: {
        formatter: (v: number | null, opts: { dataPointIndex: number }) =>
          v === null || v === undefined ? "Sem dados" : `${Math.round(v)}%${detail ? ` · ${detail(opts.dataPointIndex)}` : ""}`,
        title: { formatter: () => "<15 dias:" },
      },
    },
  };
  const styled: Record<string, any> = withMinimalsChart(options, "area");
  // Apex breaks on missing weeks ("parser Error": a NaN in an SVG path), common in small
  // districts: its area fill around gaps and its animation from one series to another with a
  // different shape. So a plain line with a marker per week when weeks are missing, and a fresh
  // chart (no morphing) whenever the data changes.
  const gaps = values.some((v) => v === null);
  const chartOptions = gaps ? { ...styled, fill: { type: "solid", opacity: 1 }, markers: { ...styled.markers, size: 3 } } : styled;
  return (
    <div id={id}>
      <Chart key={`${gaps ? "line" : "area"}:${values.join(",")}:${labels.length}:${selected?.from}-${selected?.to}`} type={gaps ? "line" : "area"} options={chartOptions} series={[{ name: "<15 dias", data: values }]} height={height} width="100%" />
    </div>
  );
}
