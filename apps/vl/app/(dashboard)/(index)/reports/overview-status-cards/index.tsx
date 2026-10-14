"use client";

import { StatusCard } from "@repo/design_system/app/organisms/cards/StatusCard";
import { StatusCardSkeleton } from "@repo/design_system/app/molecules/skeletons/StatusCardSkeleton";
import { CardMessage } from "@/components/card-message";
import { ComboChart } from "@/components/charts/combo-chart";
import { useReport } from "@/hooks/use-report";
import { lastYear } from "@/lib/vl/dates";
import { CARD_ID } from "./constants";
import { fetchOverview, summarize, type Tile } from "./actions";

const TILES: { key: "samples" | "suppression" | "tat"; title: string; color: string; format: (v: number) => string }[] = [
  { key: "samples", title: "Número de amostras", color: "#00b000", format: (v) => v.toLocaleString("pt-PT") },
  { key: "suppression", title: "Supressão Viral das amostras", color: "#ef5350", format: (v) => `${v}%` },
  { key: "tat", title: "Tempo de Resposta", color: "#6B53C6", format: (v) => `${v} dias` },
];

export default function OverviewStatusCards() {
  const { data, loading, error, retry } = useReport((token) => fetchOverview(lastYear(), token), []);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-4 md:flex-row">
        {TILES.map((t) => (
          <StatusCardSkeleton key={t.key} sx={{ width: "100%" }} />
        ))}
      </div>
    );
  }

  const summary = summarize(data);
  return (
    <div id={CARD_ID} className="flex flex-col gap-4 md:flex-row">
      {TILES.map((t) => {
        const tile: Tile = summary[t.key];
        return (
          <section key={t.key} className="min-w-[220px] flex-1">
            <StatusCard title={t.title} value={t.format(tile.value)} subtitle="Últimos 12 meses">
              <ComboChart
                id={`${CARD_ID}-${t.key}-chart`}
                labels={tile.labels}
                series={[{ name: t.title, type: "line", color: t.color, data: tile.data }]}
                sparkline
                height={70}
              />
            </StatusCard>
          </section>
        );
      })}
    </div>
  );
}
