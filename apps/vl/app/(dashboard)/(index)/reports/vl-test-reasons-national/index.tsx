"use client";

import { Donut } from "@repo/design_system/app/atoms/charts/apex/Donut";
import { ReportCard } from "@/components/report-card";
import { useRangeReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
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
