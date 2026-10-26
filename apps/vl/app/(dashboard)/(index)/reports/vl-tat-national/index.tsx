"use client";

import { ReportCard } from "@/components/report-card";
import { StackedChart } from "@/components/charts/stacked-chart";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTatNational() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
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
      <StackedChart id={chartDomId(CARD_ID)} model={toChart(rows)} />
    </ReportCard>
  );
}
