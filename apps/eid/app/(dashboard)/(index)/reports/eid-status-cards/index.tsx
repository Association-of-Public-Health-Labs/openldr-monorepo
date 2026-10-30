"use client";

import { useState } from "react";
import { CheckCheck, FlaskConical, ClipboardList, XCircle } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@repo/design_system/app/organisms/cards/KpiCard";
import { KpiBars } from "@repo/design_system/app/atoms/charts/apex/KpiBars";
import { KpiDetailDrawer } from "@repo/design_system/app/organisms/cards/KpiDetailDrawer";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatRangePt, lastYear } from "@repo/design_system/lib/report/dates";
import { trendOf } from "@repo/design_system/lib/report/format";
import { EID_PRIMARY } from "@/lib/eid/series";
import { CARD_ID } from "./constants";
import { fetchData, tileDetail, toTiles } from "./actions";

const ICONS = [<FlaskConical key="t" />, <ClipboardList key="r" />, <CheckCheck key="s" />, <XCircle key="j" />];
const COLORS = [EID_PRIMARY, "#00B8D9", "#00B000", "#FF5630"];
const PERIOD = "Últimos 12 meses";

// One tile per row on phones, four from 840px of content, 24px apart.
const ROW = "grid grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1100px]:grid-cols-4";

export default function EidStatusCards() {
  const [range] = useState(lastYear);
  // The tile whose drawer is open; `shown` stays set while the drawer slides out.
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0);
  const { data, loading, error, retry } = useReport((token) => fetchData(range, token), []);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;

  if (loading || !data) {
    return (
      <div className={ROW}>
        {ICONS.map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const tiles = toTiles(data);
  const active = tiles[shown];
  const detail = tileDetail(active, data, formatNumber, range.start);
  return (
    <div id={CARD_ID} className={ROW}>
      {tiles.map((tile, i) => (
        <KpiCard
          key={tile.title}
          title={tile.title}
          icon={ICONS[i]}
          color={COLORS[i]}
          value={formatNumber(tile.value)}
          trend={trendOf(tile.trend, "percent", { lowerIsBetter: tile.id === "rejected" })}
          subtitle={`${tile.percent} · ${PERIOD}`}
          onExpand={() => {
            setShown(i);
            setOpen(true);
          }}
          className="min-w-0"
        >
          <KpiBars
            id={`${CARD_ID}-${i}-chart`}
            labels={tile.labels}
            data={tile.data}
            color={COLORS[i]}
            format={formatNumber}
            highlight={tile.trend?.index}
          />
        </KpiCard>
      ))}
      <KpiDetailDrawer
        id={`${CARD_ID}-detail`}
        open={open}
        onOpenChange={setOpen}
        title={active.title}
        icon={ICONS[shown]}
        color={COLORS[shown]}
        period={PERIOD}
        exportSubtitle={formatRangePt(range)}
        value={formatNumber(active.value)}
        trend={trendOf(active.trend, "percent", { lowerIsBetter: active.id === "rejected" })}
        figures={detail.figures}
        bars={{ labels: active.labels, data: active.data, format: formatNumber, highlight: active.trend?.index }}
        docs={detail.docs}
        sheet={() => detail.sheet}
      />
    </div>
  );
}
