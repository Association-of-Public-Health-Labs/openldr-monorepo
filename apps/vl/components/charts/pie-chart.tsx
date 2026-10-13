"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function PieChart({
  id,
  labels,
  values,
  colors,
  height = 350,
}: {
  id: string;
  labels: string[];
  values: number[];
  colors: string[];
  height?: number;
}) {
  const options: ApexOptions = {
    chart: { id, toolbar: { show: false }, fontFamily: "inherit" },
    labels,
    colors,
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    tooltip: { y: { formatter: (v: number) => String(v) } },
  };
  return (
    <div id={id}>
      <Chart type="pie" options={options} series={values} height={height} width="100%" />
    </div>
  );
}
