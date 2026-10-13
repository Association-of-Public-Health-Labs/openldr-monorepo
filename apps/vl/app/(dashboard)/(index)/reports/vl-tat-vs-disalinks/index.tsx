"use client";

import { ReportCard } from "@/components/report-card";
import { ComboChart } from "@/components/charts/combo-chart";
import { useReport } from "@/hooks/use-report";
import { chartDomId } from "@/lib/vl/export/chart-id";
import { CARD_ID, SUBTITLE, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTatVsDisalinks() {
  const r = useReport(fetchData, []);
  const rows = r.data ?? [];
  const chart = toChart(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={SUBTITLE}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <ComboChart id={chartDomId(CARD_ID)} labels={chart.labels} series={chart.series} yTitles={["TRL (dias)", "Disalinks"]} />
    </ReportCard>
  );
}
