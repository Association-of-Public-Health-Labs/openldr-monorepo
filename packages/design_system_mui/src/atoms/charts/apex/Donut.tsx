import React, { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { withMinimalsChart } from "../../../themes/minimals-chart";
import { formatNumber } from "../../../utils/format-number";

export type DonutProps = {
  /** Wrapper id, for the image export. */
  id?: string;
  labels: string[];
  series: number[];
  colors: string[];
  /** Chart height (the legend comes below); capped at the chart's width. */
  height?: number;
  /** Centre caption over the total ("Total"). */
  totalLabel?: string;
};

// Slices under this share get no label on the ring (too thin to hold one); the legend lists them all.
const MIN_LABEL_PERCENT = 4;

/** "7.1%"; under 0.1% → "<0.1%", so a tiny slice never reads as nothing. */
export function donutPercent(value: number, total: number): string {
  if (!total || !value) return "0%";
  const p = (value / total) * 100;
  return p < 0.1 ? "<0.1%" : `${p.toFixed(1)}%`;
}

/**
 * Donut after the Minimals "Current download" card: the total in the centre (the hovered slice while
 * hovering), percentages on the slices big enough for them, and a legend with every category's count
 * and percentage, so the very small slices stay readable.
 */
export function Donut({ id, labels, series, colors, height = 300, totalLabel = "Total" }: DonutProps) {
  const total = series.reduce((sum, v) => sum + (v || 0), 0);
  // The ring is as wide as the card allows: on a narrow card a tall chart would only add empty bands
  // above and below it, so the height never exceeds the width.
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const chartHeight = width ? Math.min(height, width) : height;

  const options = {
    chart: { id, type: "donut", sparkline: { enabled: false } },
    labels,
    colors,
    legend: { show: false },
    stroke: { width: 2 },
    dataLabels: {
      enabled: true,
      formatter: (percent: number) => (percent >= MIN_LABEL_PERCENT ? `${percent.toFixed(1)}%` : ""),
      dropShadow: { enabled: false },
      style: { fontSize: "12px", fontWeight: 600 },
    },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (v: number) => `${formatNumber(v)} (${donutPercent(v, total)})` },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { show: true, fontSize: "14px", fontWeight: 500, color: "var(--chart-legend)", offsetY: -4 },
            value: { show: true, fontSize: "24px", fontWeight: 700, color: "var(--chart-legend)", offsetY: 4, formatter: (v: string) => formatNumber(Number(v)) },
            total: { show: true, label: totalLabel, fontSize: "14px", fontWeight: 500, color: "#919EAB", formatter: () => formatNumber(total) },
          },
        },
      },
    },
  };

  return (
    <div id={id} ref={frame} data-slot="donut-chart">
      {/* @ts-ignore react-apexcharts option types */}
      <Chart options={withMinimalsChart(options, "pie")} series={series} type="donut" height={chartHeight} width="100%" />
      <ul
        aria-label="Legenda"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "4px 32px", padding: "16px 24px 0", margin: 0, listStyle: "none" }}
      >
        {labels.map((label, i) => (
          <li key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: "22px" }}>
            <span aria-hidden style={{ width: 12, height: 12, borderRadius: "50%", background: colors[i], flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--chart-legend)", fontWeight: 500 }}>{label}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--chart-legend)", fontWeight: 600 }}>{formatNumber(series[i])}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "#919EAB", minWidth: 48, textAlign: "right" }}>{donutPercent(series[i], total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
