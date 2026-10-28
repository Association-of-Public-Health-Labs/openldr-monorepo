"use client";

import { CheckCheck, FlaskConical, ClipboardList, XCircle } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@repo/design_system/app/organisms/cards/KpiCard";
import { KpiBars } from "@repo/design_system/app/atoms/charts/apex/KpiBars";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { lastYear } from "@repo/design_system/lib/report/dates";
import { trendOf } from "@repo/design_system/lib/report/format";
import { EID_PRIMARY } from "@/lib/eid/series";
import { CARD_ID } from "./constants";
import { fetchData, toTiles } from "./actions";

const ICONS = [<FlaskConical key="t" />, <ClipboardList key="r" />, <CheckCheck key="s" />, <XCircle key="j" />];
const COLORS = [EID_PRIMARY, "#00B8D9", "#00B000", "#FF5630"];

// One tile per row on phones, four from 840px of content, 24px apart.
const ROW = "grid grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1100px]:grid-cols-4";

export default function EidStatusCards() {
  const { data, loading, error, retry } = useReport((token) => fetchData(lastYear(), token), []);

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

  return (
    <div id={CARD_ID} className={ROW}>
      {toTiles(data).map((tile, i) => (
        <KpiCard
          key={tile.title}
          title={tile.title}
          icon={ICONS[i]}
          color={COLORS[i]}
          value={formatNumber(tile.value)}
          trend={trendOf(tile.trend, "percent")}
          subtitle={`${tile.percent} · Últimos 12 meses`}
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
    </div>
  );
}
