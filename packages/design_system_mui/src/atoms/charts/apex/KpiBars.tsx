import React from "react";
import Chart from "react-apexcharts";
import { formatNumber } from "../../../utils/format-number";

export type KpiBarsProps = {
  /** Wrapper id, for the image export. */
  id?: string;
  /** One label per bar ("Jan 2026"), shown in the tooltip. */
  labels: string[];
  data: number[];
  color: string;
  height?: number;
  /** Tooltip value ("91.7%"); grouped thousands by default. */
  format?: (value: number) => string;
  /** The bar drawn in full colour (default: the last one). */
  highlight?: number;
  /** Bottom of the scale, when every value sits high (rates around 90%) and the bars would all look alike. */
  min?: number;
  /** Larger chart for a detail view: month labels on the x axis, values on the y axis, a dashed grid. */
  showAxes?: boolean;
};

// The highlighted bar in full colour, the others lighter: the eye lands on the month that counts.
const EARLIER_OPACITY = 0.32;

const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// Axis and grid colours of the Minimals charts (themes/minimals-chart).
const AXIS = "#919EAB";
const GRID = "rgba(145, 158, 171, 0.2)";

/** Small column chart for a KPI card: no axes or grid, rounded columns, a tooltip per month. */
export function KpiBars({ id, labels, data, color, height = 64, format = formatNumber, highlight, min, showAxes = false }: KpiBarsProps) {
  const strong = highlight ?? data.length - 1;
  const colors = data.map((_, i) => (i === strong ? color : withAlpha(color, EARLIER_OPACITY)));
  const options = {
    chart: { sparkline: { enabled: true }, animations: { speed: 360 }, fontFamily: "inherit" },
    plotOptions: {
      bar: { columnWidth: "64%", borderRadius: 2, borderRadiusApplication: "end" as const, distributed: true },
    },
    colors,
    states: { hover: { filter: { type: "darken" } }, active: { filter: { type: "none" } } },
    // Sparkline mode already drops the axes; stated explicitly so no axis or grid line can show.
    xaxis: { categories: labels, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min, show: false },
    grid: { show: false },
    legend: { show: false },
    tooltip: {
      theme: "minimals",
      x: { show: true },
      y: { formatter: (v: number) => format(v), title: { formatter: () => "" } },
      marker: { show: false },
    },
  };
  const withAxes = showAxes
    ? {
        ...options,
        chart: { toolbar: { show: false }, zoom: { enabled: false }, animations: { speed: 360 }, fontFamily: "inherit", foreColor: AXIS },
        plotOptions: { bar: { ...options.plotOptions.bar, borderRadius: 4 } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: labels,
          labels: { show: true, style: { colors: AXIS, fontSize: "11px" } },
          axisBorder: { show: false },
          axisTicks: { show: false },
          tooltip: { enabled: false },
        },
        yaxis: { min, show: true, labels: { formatter: (v: number) => format(Math.round(v)), style: { colors: AXIS, fontSize: "11px" } } },
        grid: { show: true, borderColor: GRID, strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
      }
    : options;
  return (
    <div id={id} className="w-full">
      <Chart type="bar" options={withAxes} series={[{ name: "", data }]} height={height} width="100%" />
    </div>
  );
}
