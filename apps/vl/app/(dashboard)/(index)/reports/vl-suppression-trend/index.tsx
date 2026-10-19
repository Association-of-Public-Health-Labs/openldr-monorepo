"use client";

import { ReportCard } from "@/components/report-card";
import { ComboChart } from "@/components/charts/combo-chart";
import { useRangeReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlSuppressionTrend() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const chart = toChart(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <ComboChart
        id={chartDomId(CARD_ID)}
        labels={chart.labels}
        series={chart.series}
        stacked
        height={460}
        yTitles={["Amostras testadas", "Taxa de supressão"]}
        axes={[{ format: "count" }, { min: 0, max: 100, format: "percent" }]}
        target={{ value: 95, label: "Meta 95%", axis: 1, color: "#00B000" }}
      />
    </ReportCard>
  );
}
