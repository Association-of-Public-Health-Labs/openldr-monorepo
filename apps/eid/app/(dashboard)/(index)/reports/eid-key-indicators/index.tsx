"use client";

import { useState } from "react";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { IndicatorsTable } from "@repo/design_system/app/molecules/tables/IndicatorsTable";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { Tabs } from "@repo/design_system/components/ui/tabs";
import { SegmentedTabsList, SegmentedTabsTrigger } from "@repo/design_system/components/ui/segmented-tabs";
import { LAB_TYPE_TABS } from "@/lib/eid/series";
import type { LabType } from "@/lib/eid/types";
import { CARD_ID, TITLE } from "./constants";
import { exportSubtitleFor, fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

const DEFAULT_TAB: LabType = "conventional";

export default function EidKeyIndicators() {
  const [labType, setLabType] = useState<LabType>(DEFAULT_TAB);
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
      controls={
        <Tabs value={labType} onValueChange={(v) => setLabType(v as LabType)} className="w-full">
          <SegmentedTabsList className="mx-4 ml-auto">
            {LAB_TYPE_TABS.map((tab) => (
              <SegmentedTabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </SegmentedTabsTrigger>
            ))}
          </SegmentedTabsList>
        </Tabs>
      }
    >
      <IndicatorsTable label={TITLE} columns={["Indicadores", ...table.columns]} rows={table.rows} />
    </ReportCard>
  );
}
