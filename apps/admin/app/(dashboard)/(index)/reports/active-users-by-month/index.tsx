"use client";

import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { ComboChart } from "@repo/design_system/app/organisms/report/charts/combo-chart";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatRangePt } from "@repo/design_system/lib/report/dates";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { emptyMessage } from "@/lib/admin/usage";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function ActiveUsersByMonth() {
  const r = useReport((token) => fetchData(token), []);
  const chart = r.data ? toChart(r.data) : null;
  const hasData = (chart?.series.length ?? 0) > 0;
  return (
    <ReportCard
      title={TITLE}
      subtitle="Últimos 12 meses, por dashboard"
      exportSubtitle={r.data ? formatRangePt(r.data.range) : undefined}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={r.loading && !r.data}
      onRetry={r.retry}
      excel={() => toExcel(r.data!)}
      documentation={<Docs />}
    >
      {chart && hasData ? (
        // Lines are named on their last point as well as in the legend: green and red alone do not separate for red-green colour-blind readers.
        <ComboChart
          id={chartDomId(CARD_ID)}
          labels={chart.labels}
          series={chart.series}
          endLabels
          height={320}
          axes={[{ format: "count", min: 0 }]}
        />
      ) : (
        <CardMessage tone="empty" message={emptyMessage("utilizadores activos")} />
      )}
    </ReportCard>
  );
}
