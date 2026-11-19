"use client";

import { Donut } from "@repo/design_system/app/atoms/charts/apex/Donut";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { OFFLINE_COLOR, ONLINE_COLOR } from "@/lib/monitoring/colors";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toDonut, toExcel } from "./actions";
import Docs from "./docs";

const PERIOD = "Últimos 12 meses";

export default function NationalConnectivity() {
  const { data, loading, error, retry } = useReport(() => fetchData(), []);
  const chart = data ? toDonut(data) : null;
  return (
    <ReportCard
      title={TITLE}
      subtitle={PERIOD}
      cardId={CARD_ID}
      loading={loading}
      error={error}
      empty={!loading && !error && !data?.categories.length}
      onRetry={retry}
      excel={() => (data ? toExcel(data) : { header: [], rows: [] })}
      documentation={<Docs />}
    >
      {chart && (
        <Donut id={chartDomId(CARD_ID)} labels={chart.labels} series={chart.series} colors={[ONLINE_COLOR, OFFLINE_COLOR]} totalLabel="% do tempo" height={350} />
      )}
    </ReportCard>
  );
}
