"use client";

import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { MapLegend } from "@repo/design_system/app/atoms/maps/MapLegend";
import { ReportCard } from "@/components/report-card";
import { useRangeReport } from "@/hooks/use-report";
import { pct } from "@/lib/vl/format";
import { CARD_ID, MAP_COLOR, TITLE } from "./constants";
import { fetchData, rowFor, toExcel, toMapProvinces } from "./actions";
import Docs from "./docs";

export default function VlSuppressionMap() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
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
      <div className="flex flex-col items-center gap-2">
        <InteractiveSvgMap
          width="100%"
          height={420}
          provinces={toMapProvinces(rows)}
          highlightedColor={MAP_COLOR}
          showPopover
          getPopoverContent={(provinceName: string) => {
            const row = rowFor(rows, provinceName);
            if (!row) return <span>{provinceName}: sem dados</span>;
            return (
              <div className="space-y-1 text-xs">
                <strong>{provinceName}</strong>
                <div>Supressão viral: {pct(row.suppressed, row.total)}%</div>
                <div>Amostras testadas: {row.total}</div>
                <div>Rotina: {row.routine}</div>
                <div>Falência terapêutica: {row.treatment_failure}</div>
              </div>
            );
          }}
        />
        <MapLegend baseColor={MAP_COLOR} size="small" />
      </div>
    </ReportCard>
  );
}
