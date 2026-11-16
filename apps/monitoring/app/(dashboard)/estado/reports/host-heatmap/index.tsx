"use client";

import { ConnectivityHeatmap } from "@repo/design_system/app/molecules/charts/ConnectivityHeatmap";
import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import type { HostDetail } from "@/lib/monitoring/types";

const CARD_ID = "monitoring-host-heatmap";

export default function HostHeatmap({ detail, loading, error, onRetry }: { detail: HostDetail | null; loading: boolean; error: string | null; onRetry: () => void }) {
  const days = detail?.heatmap ?? [];
  return (
    <ReportCard
      title="Conectividade diária"
      subtitle="Últimos 12 meses"
      exportSubtitle={detail?.host.name ?? undefined}
      cardId={CARD_ID}
      loading={loading}
      error={error}
      empty={!loading && !error && days.length === 0}
      onRetry={onRetry}
      excel={() => ({ header: ["Data", "Conectividade (%)"], rows: days.map((d) => [d.date, d.uptime]) })}
      documentation={
        <CardDocs
          overview="Um quadrado por dia: quanto mais escuro, mais tempo o site esteve online nesse dia."
          reading={[
            "Cada coluna é uma semana (segunda a domingo); o cursor mostra a data e a % do dia online.",
            "Conta o dia inteiro (00:00–24:00 UTC), não só o horário laboral; começa no dia em que o site passou a ser monitorizado.",
          ]}
          endpoint="/teamviewer/offline-history/interval-dates-health-facility (DisaStatus), via /api/hosts/[código]"
        />
      }
    >
      <div className="px-2 pb-2">
        <ConnectivityHeatmap data={days} />
      </div>
    </ReportCard>
  );
}
