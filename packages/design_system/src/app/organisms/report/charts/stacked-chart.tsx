"use client";

import { Stacked } from "../../../../app/atoms/charts/apex/Stacked";
import type { ChartModel } from "../../../../lib/report/series";

export function StackedChart({
  id,
  model,
  height = 350,
  onClick,
}: {
  id: string;
  model: ChartModel;
  height?: number;
  onClick?: (label: string) => void;
}) {
  return (
    <Stacked
      id={id}
      height={height}
      labels={model.labels}
      series={model.series.map(({ name, data }) => ({ name, data }))}
      colors={model.series.map((s) => s.color)}
      onClick={onClick}
    />
  );
}
