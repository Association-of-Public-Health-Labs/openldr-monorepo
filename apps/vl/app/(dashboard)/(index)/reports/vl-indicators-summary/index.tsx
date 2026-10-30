"use client";

import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { IndicatorsTable } from "@repo/design_system/app/molecules/tables/IndicatorsTable";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

export default function VlIndicatorsSummary() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const table = toTable(rows);
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
      <IndicatorsTable label={TITLE} columns={["Indicadores", ...table.columns]} rows={table.rows} />
    </ReportCard>
  );
}
