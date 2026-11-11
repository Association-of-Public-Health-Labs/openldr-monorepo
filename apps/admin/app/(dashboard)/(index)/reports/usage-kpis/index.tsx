"use client";

import { Activity, Moon, MousePointerClick, Users } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@repo/design_system/app/organisms/cards/KpiCard";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import type { UsageFilters } from "@/lib/admin/usage";
import { CARD_ID } from "./constants";
import { fetchData, toTiles, type TileKey } from "./actions";

const TILES: { key: TileKey; title: string; icon: React.ReactNode; color: string }[] = [
  { key: "active", title: "Utilizadores activos", icon: <Users />, color: "#00B8D9" },
  { key: "sessions", title: "Sessões", icon: <MousePointerClick />, color: "#8E33FF" },
  { key: "perUser", title: "Sessões por utilizador", icon: <Activity />, color: "#22C55E" },
  { key: "inactive", title: "Utilizadores inactivos", icon: <Moon />, color: "#FFAB00" },
];

// One tile per row on phones, two from 640px of content, four from 1100px, 24px apart.
const ROW = "grid grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1100px]:grid-cols-4";

export default function UsageKpis({ filters }: { filters: UsageFilters }) {
  const { data, loading, error, retry } = useReport((token) => fetchData(filters, token), [filters.range, filters.dashboard]);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;
  if (!data) {
    return (
      <div className={ROW}>
        {TILES.map((t) => (
          <KpiCardSkeleton key={t.key} />
        ))}
      </div>
    );
  }

  const tiles = toTiles(data, filters.label);
  return (
    <div id={CARD_ID} aria-busy={loading} className={ROW}>
      {TILES.map((t) => {
        const tile = tiles.find((x) => x.key === t.key)!;
        return (
          <KpiCard key={t.key} title={t.title} icon={t.icon} color={t.color} value={tile.value} trend={tile.trend} subtitle={tile.subtitle} className="min-w-0" />
        );
      })}
    </div>
  );
}
