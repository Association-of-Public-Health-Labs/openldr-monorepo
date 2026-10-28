"use client";

import { useState } from "react";
import { Clock, FlaskConical, ShieldCheck } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@repo/design_system/app/organisms/cards/KpiCard";
import { KpiBars } from "@repo/design_system/app/atoms/charts/apex/KpiBars";
import { KpiDetailDrawer } from "@repo/design_system/app/organisms/cards/KpiDetailDrawer";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatRangePt, lastYear } from "@repo/design_system/lib/report/dates";
import { CARD_ID } from "./constants";
import { trendOf, type TrendKind } from "@repo/design_system/lib/report/format";
import { fetchOverview, rateFloor, summarize, tileDetail, type Tile, type TileKey } from "./actions";

const PERIOD = "Últimos 12 meses";

const TILES: {
  key: TileKey;
  title: string;
  icon: React.ReactNode;
  color: string;
  trend: TrendKind;
  format: (v: number) => string;
}[] = [
  { key: "samples", title: "Número de amostras", icon: <FlaskConical />, color: "#00B000", trend: "percent", format: formatNumber },
  { key: "suppression", title: "Supressão viral", icon: <ShieldCheck />, color: "#00B8D9", trend: "points", format: (v) => `${v}%` },
  { key: "tat", title: "Tempo de resposta", icon: <Clock />, color: "#8E33FF", trend: "days", format: (v) => `${v} dias` },
];

// Minimals' summary row: one tile per row on phones, three from 840px of content, 24px apart.
const ROW = "grid grid-cols-1 gap-6 @[840px]:grid-cols-3";

export default function OverviewStatusCards() {
  const [range] = useState(lastYear);
  // The tile whose drawer is open; `shown` stays set while the drawer slides out.
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<TileKey>("samples");
  const { data, loading, error, retry } = useReport((token) => fetchOverview(range, token), []);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;

  if (loading || !data) {
    return (
      <div className={ROW}>
        {TILES.map((t) => (
          <KpiCardSkeleton key={t.key} />
        ))}
      </div>
    );
  }

  const summary = summarize(data);
  const active = TILES.find((t) => t.key === shown) ?? TILES[0];
  const activeTile = summary[active.key];
  const detail = tileDetail(active.key, data, activeTile, active.format, range.start);
  return (
    <div id={CARD_ID} className={ROW}>
      {TILES.map((t) => {
        const tile: Tile = summary[t.key];
        return (
          <KpiCard
            key={t.key}
            title={t.title}
            icon={t.icon}
            color={t.color}
            value={t.format(tile.value)}
            trend={trendOf(tile.trend, t.trend)}
            subtitle={PERIOD}
            onExpand={() => {
              setShown(t.key);
              setOpen(true);
            }}
            className="min-w-0"
          >
            <KpiBars
              id={`${CARD_ID}-${t.key}-chart`}
              labels={tile.labels}
              data={tile.data}
              color={t.color}
              format={t.format}
              // The month the trend speaks of, not the current one (still filling up).
              highlight={tile.trend?.index}
              min={t.key === "suppression" ? rateFloor(tile.data) : undefined}
            />
          </KpiCard>
        );
      })}
      <KpiDetailDrawer
        id={`${CARD_ID}-detail`}
        open={open}
        onOpenChange={setOpen}
        title={active.title}
        icon={active.icon}
        color={active.color}
        period={PERIOD}
        exportSubtitle={formatRangePt(range)}
        value={active.format(activeTile.value)}
        trend={trendOf(activeTile.trend, active.trend)}
        figures={detail.figures}
        bars={{
          labels: activeTile.labels,
          data: activeTile.data,
          format: active.format,
          highlight: activeTile.trend?.index,
          min: active.key === "suppression" ? rateFloor(activeTile.data) : undefined,
        }}
        docs={detail.docs}
        sheet={() => detail.sheet}
      />
    </div>
  );
}
