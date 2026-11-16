"use client";

import { Donut } from "@repo/design_system/app/atoms/charts/apex/Donut";
import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { chartDomId } from "@repo/design_system/lib/report/export/chart-id";
import { OFFLINE_COLOR, ONLINE_COLOR } from "@/lib/monitoring/colors";
import type { HostDetail } from "@/lib/monitoring/types";

const CARD_ID = "monitoring-host-connectivity";

export default function HostConnectivity({ detail, loading, error, onRetry }: { detail: HostDetail | null; loading: boolean; error: string | null; onRetry: () => void }) {
  const series: [number, number] = [detail?.uptimePct ?? 0, detail?.downtimePct ?? 0];
  return (
    <ReportCard
      title="Conectividade do site"
      subtitle="Últimos 12 meses"
      exportSubtitle={detail?.host.name ?? undefined}
      cardId={CARD_ID}
      loading={loading}
      error={error}
      empty={!loading && !error && !detail}
      onRetry={onRetry}
      excel={() => ({ header: ["Estado", "Tempo (%)"], rows: [["Online", series[0]], ["Offline", series[1]]] })}
      documentation={
        <CardDocs
          overview="Parte do tempo, nos últimos 12 meses, em que o site esteve online e offline."
          legend={[
            { label: "Online", color: ONLINE_COLOR, description: "Tempo com ligação." },
            { label: "Offline", color: OFFLINE_COLOR, description: "Tempo sem ligação, segundo o TeamViewer." },
          ]}
          reading={[
            "É a média da conectividade diária do calendário ao lado, desde que o site começou a ser monitorizado (dias inteiros, não só o horário laboral).",
            "Uma ausência ainda aberta conta até ao momento da consulta.",
          ]}
          endpoint="/teamviewer/offline-history/interval-dates-health-facility (DisaStatus), via /api/hosts/[código]"
        />
      }
    >
      {detail && (
        <Donut id={chartDomId(CARD_ID)} labels={["Online", "Offline"]} series={series} colors={[ONLINE_COLOR, OFFLINE_COLOR]} totalLabel="% do tempo" height={320} />
      )}
    </ReportCard>
  );
}
