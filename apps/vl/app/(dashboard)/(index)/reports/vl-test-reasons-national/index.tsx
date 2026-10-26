"use client";

import { Donut } from "@repo/design_system/app/atoms/charts/apex/Donut";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, PIE_COLORS, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestReasonsNational() {
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
      excel={() => toExcel(rows, "Nacional")}
      documentation={<Docs />}
    >
      <Donut id={chartDomId(CARD_ID)} labels={chart.labels} series={chart.series[0]?.data ?? []} colors={PIE_COLORS} totalLabel="Total de amostras" height={350} />
    </ReportCard>
  );
}
