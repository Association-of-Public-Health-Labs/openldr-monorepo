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
};

// The highlighted bar in full colour, the others lighter: the eye lands on the month that counts.
const EARLIER_OPACITY = 0.32;

const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Small column chart for a KPI card: no axes or grid, rounded columns, a tooltip per month. */
export function KpiBars({ id, labels, data, color, height = 64, format = formatNumber, highlight, min }: KpiBarsProps) {
  const strong = highlight ?? data.length - 1;
  const colors = data.map((_, i) => (i === strong ? color : withAlpha(color, EARLIER_OPACITY)));
  const options = {
    chart: { sparkline: { enabled: true }, animations: { speed: 360 }, fontFamily: "inherit" },
    plotOptions: {
      bar: { columnWidth: "64%", borderRadius: 2, borderRadiusApplication: "end" as const, distributed: true },
    },
    colors,
    states: { hover: { filter: { type: "darken" } }, active: { filter: { type: "none" } } },
    xaxis: { categories: labels },
    yaxis: { min },
    legend: { show: false },
    tooltip: {
      theme: "minimals",
      x: { show: true },
      y: { formatter: (v: number) => format(v), title: { formatter: () => "" } },
      marker: { show: false },
    },
  };
  return (
    <div id={id} className="w-full">
      <Chart type="bar" options={options} series={[{ name: "", data }]} height={height} width="100%" />
    </div>
  );
}
