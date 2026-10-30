"use client";

import { useState } from "react";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { StackedChart } from "@repo/design_system/app/organisms/report/charts/stacked-chart";
import { useRangeReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { TatSegmentSelect } from "@/components/tat-segment-select";
import { CARD_ID, DEFAULT_CATEGORY } from "./constants";
import { fetchData, titleFor, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function EidTatBrackets() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  // The segment is a dep, so changing it reloads and the request gate drops the slower old response.
  const r = useRangeReport((range, token) => fetchData(range, category, token), undefined, [category]);
  const rows = r.data ?? [];
  return (
    <ReportCard
      title={titleFor(category)}
      subtitle={r.subtitle}
      exportSubtitle={r.exportSubtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={() => {
        setCategory(DEFAULT_CATEGORY);
        r.onRestart();
      }}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
      controls={<TatSegmentSelect value={category} onChange={setCategory} />}
    >
      <StackedChart id={chartDomId(CARD_ID)} model={toChart(rows)} />
    </ReportCard>
  );
}
