"use client";

import { ConnectivityHeatmap } from "@repo/design_system/app/molecules/charts/ConnectivityHeatmap";
import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { heatmapStats } from "@/lib/monitoring/heatmap";
import type { HostDetail } from "@/lib/monitoring/types";

const CARD_ID = "monitoring-host-heatmap";

export default function HostHeatmap({ detail, loading, error, onRetry }: { detail: HostDetail | null; loading: boolean; error: string | null; onRetry: () => void }) {
  const days = detail?.heatmap ?? [];
  const stats = heatmapStats(days);
  const kpis = [
    { label: "dias sem falhas", value: stats.clean, tone: "text-success" },
    { label: "dias com falhas", value: stats.partial, tone: "text-foreground" },
    { label: "dias totalmente offline", value: stats.offline, tone: stats.offline ? "text-destructive" : "text-foreground" },
    { label: "maior falha seguida", value: `${stats.longestOffline} ${stats.longestOffline === 1 ? "dia" : "dias"}`, tone: "text-foreground" },
  ];
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
            "Por baixo: dias sem falhas, dias com alguma falha, dias totalmente offline e a maior sequência de dias offline.",
            "Registos repetidos da mesma falha contam uma só vez. Uma falha ainda em curso só aparece quando termina.",
            "Conta o dia inteiro (00:00–24:00 UTC), não só o horário laboral; começa no dia em que o site passou a ser monitorizado.",
          ]}
          endpoint="/teamviewer/offline-history/interval-dates-health-facility (DisaStatus), via /api/hosts/[código]"
        />
      }
    >
      <div className="@container flex flex-col gap-5 px-2 pb-2">
        <ConnectivityHeatmap data={days} />
        {/* What the squares add up to, so the card answers "how bad was it?" without hovering. */}
        <div className="grid grid-cols-2 gap-2.5 @[520px]:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-border px-3 py-2.5">
              <p className={`text-xl font-bold tracking-tight ${k.tone}`}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}
