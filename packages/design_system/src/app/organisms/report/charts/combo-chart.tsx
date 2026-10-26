"use client";

import { lazy, Suspense, useEffect, useState, type ComponentProps } from "react";
import { ChartScroller } from "../../../../app/atoms/charts/apex/ChartScroller";
import { withMinimalsChart, type MinimalsChartKind } from "../../../../app/atoms/charts/apex/minimals";
import { apexOrder, buildComboOptions, toApexSeries, type ComboOptionsInput } from "../../../../lib/report/combo-options";

// react-apexcharts touches `window` on import, so it loads in the browser only (next/dynamic ssr:false, without Next).
const ApexChart = lazy(() => import("react-apexcharts"));

function Chart(props: ComponentProps<typeof ApexChart>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <ApexChart {...props} />
    </Suspense>
  );
}

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

export function ComboChart({ height = 350, onClick, ...props }: ComboChartProps) {
  const input = { ...props, series: apexOrder(props.series, props.stacked) };
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
  const options = kind ? withMinimalsChart(withClick, kind, input.series.length) : withClick;
  const series = toApexSeries(input.series).map((s) => (kind === "area" ? { ...s, type: "area" } : s));
  const type = kind === "area" ? "area" : input.series.some((s) => s.type === "line") ? "line" : "bar";
  const chart = <Chart type={type} options={options} series={series} height={height} width="100%" />;
  return (
    <div id={input.id}>
      {/* Many categories (labs, months) scroll inside the card on narrow screens; sparklines never do. */}
      {input.sparkline ? chart : <ChartScroller categories={input.labels.length}>{chart}</ChartScroller>}
    </div>
  );
}
