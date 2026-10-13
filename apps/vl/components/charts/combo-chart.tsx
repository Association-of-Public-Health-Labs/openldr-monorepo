"use client";

import dynamic from "next/dynamic";
import { buildComboOptions, toApexSeries, type ComboOptionsInput } from "@/lib/vl/combo-options";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ComboChartProps = ComboOptionsInput & {
  height?: number;
  onClick?: (label: string) => void;
};

export function ComboChart({ height = 350, onClick, ...input }: ComboChartProps) {
  const base = buildComboOptions(input);
  const options = onClick
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
  const type = input.series.some((s) => s.type === "line") ? "line" : "bar";
  return (
    <div id={input.id}>
      <Chart type={type} options={options} series={toApexSeries(input.series)} height={height} width="100%" />
    </div>
  );
}
