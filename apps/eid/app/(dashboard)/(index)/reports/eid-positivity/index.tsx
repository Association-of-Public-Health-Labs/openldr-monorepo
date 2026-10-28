"use client";

import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { ComboChart } from "@repo/design_system/app/organisms/report/charts/combo-chart";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function EidPositivity() {
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
      <ComboChart
        id={chartDomId(CARD_ID)}
        labels={chart.labels}
        series={chart.series}
        height={440}
        yTitles={["Amostras", "Positividade (%)"]}
        axes={[{ format: "count" }, { min: 0, format: "percent" }]}
      />
    </ReportCard>
  );
}
