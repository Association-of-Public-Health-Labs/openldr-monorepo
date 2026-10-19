"use client";

import dynamic from "next/dynamic";
import { withMinimalsChart, type MinimalsChartKind } from "@repo/design_system/app/atoms/charts/apex/minimals";
import { buildComboOptions, toApexSeries, type ComboOptionsInput } from "@/lib/vl/combo-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ComboChartProps = ComboOptionsInput & {
  height?: number;
  onClick?: (label: string) => void;
};

// Minimals look: line-only charts are drawn as areas ("Yearly sales"); sparklines keep their plain line.
function kindOf(input: ComboOptionsInput): MinimalsChartKind | null {
  if (input.sparkline) return null;
  const lines = input.series.filter((s) => s.type === "line").length;
  if (lines === input.series.length) return "area";
  if (lines > 0) return "mixed";
  return input.stacked ? "stacked" : "bar";
}

export function ComboChart({ height = 350, onClick, ...input }: ComboChartProps) {
  const base = buildComboOptions(input);
  const withClick = onClick
    ? {
        ...base,
        chart: {
          ...base.chart,
          events: {
            dataPointSelection: (_e: unknown, _ctx: unknown, cfg: { dataPointIndex: number }) => {
              const label = input.labels[cfg?.dataPointIndex];
              if (label) onClick(label);
            },
          },
        },
      }
    : base;
  const kind = kindOf(input);
  const options = kind ? withMinimalsChart(withClick, kind) : withClick;
  const series = toApexSeries(input.series).map((s) => (kind === "area" ? { ...s, type: "area" } : s));
  const type = kind === "area" ? "area" : input.series.some((s) => s.type === "line") ? "line" : "bar";
  return (
    <div id={input.id}>
      <Chart type={type} options={options} series={series} height={height} width="100%" />
    </div>
  );
}
