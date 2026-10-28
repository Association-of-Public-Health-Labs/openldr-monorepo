"use client";

import { useState } from "react";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { IndicatorsTable } from "@repo/design_system/app/molecules/tables/IndicatorsTable";
import { LineTabs } from "@repo/design_system/app/molecules/tabs/LineTabs";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { CARD_ID, DEFAULT_TAB, TABS, TITLE, type IndicatorsTab } from "./constants";
import { exportSubtitleFor, fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

export default function EidKeyIndicators() {
  const [labType, setLabType] = useState<IndicatorsTab>(DEFAULT_TAB);
  // The tab is a dep, so switching it reloads and the request gate drops the slower old response.
  const r = useRangeReport((range, token) => fetchData(range, labType, token), undefined, [labType]);
  const rows = r.data?.rows ?? [];
  const table = toTable(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      exportSubtitle={exportSubtitleFor(r.exportSubtitle, r.data, labType)}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={() => {
        setLabType(DEFAULT_TAB);
        r.onRestart();
      }}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
      // As TB's key indicators: line tabs across the card, above the table (in `controls`, so they stay when a tab is empty).
      controls={<LineTabs<IndicatorsTab> items={TABS} value={labType} onChange={setLabType} className="-mx-4 mb-5" />}
    >
      <IndicatorsTable label={TITLE} columns={["Indicadores", ...table.columns]} rows={table.rows} />
    </ReportCard>
  );
}
