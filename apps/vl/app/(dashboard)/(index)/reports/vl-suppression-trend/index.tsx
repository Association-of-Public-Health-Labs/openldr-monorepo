"use client";

import { ReportCard } from "@/components/report-card";
import { ComboChart } from "@/components/charts/combo-chart";
import { LegendTotals } from "@/components/charts/legend-totals";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel, toTotals } from "./actions";
import Docs from "./docs";

export default function VlSuppressionTrend() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const chart = toChart(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      exportSubtitle={r.exportSubtitle}
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
      {/* As Minimals' "Area installed": the legend with the period's totals above the chart, no axis titles. */}
      <LegendTotals items={toTotals(rows)} />
      <ComboChart
        id={chartDomId(CARD_ID)}
        labels={chart.labels}
        series={chart.series}
        stacked
        hideLegend
        height={440}
        axes={[{ format: "count" }, { min: 0, max: 100, format: "percent" }]}
        target={{ value: 95, label: "Meta 95%", axis: 1, color: "#00B000" }}
      />
    </ReportCard>
  );
}
