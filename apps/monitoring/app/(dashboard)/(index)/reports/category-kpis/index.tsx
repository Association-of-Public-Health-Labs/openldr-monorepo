"use client";

import { FlaskConical, Globe, Link2, Stethoscope } from "lucide-react";
import { KpiCard, KpiCardSkeleton } from "@repo/design_system/app/organisms/cards/KpiCard";
import { KpiBars } from "@repo/design_system/app/atoms/charts/apex/KpiBars";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { CARD_ID } from "./constants";
import { fetchData, toTiles, type TileId } from "./actions";

const ICONS: Record<TileId, React.ReactNode> = {
  all: <Globe />,
  Disalab: <FlaskConical />,
  Disapoc: <Stethoscope />,
  Disalink: <Link2 />,
};

// One tile per row on phones, two on tablets, four on wide screens, 24px apart (as EID).
const ROW = "grid grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1100px]:grid-cols-4";

export default function CategoryKpis() {
  const { data, loading, error, retry } = useReport(() => fetchData(), []);

  if (error) return <CardMessage tone="error" message={error} onRetry={retry} />;
  if (loading || !data) {
    return (
      <div className={ROW}>
        {[0, 1, 2, 3].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const tiles = toTiles(data.summary, data.trend);
  return (
    <div id={CARD_ID} className={ROW}>
      {tiles.map((tile) => (
        <KpiCard key={tile.id} title={tile.title} icon={ICONS[tile.id]} color={tile.color} value={tile.value} subtitle={tile.subtitle} className="min-w-0">
          {tile.data.length > 0 && (
            <KpiBars
              id={`${CARD_ID}-${tile.id}-chart`}
              labels={tile.labels}
              data={tile.data}
              color={tile.color}
              min={0}
              format={(v) => `${v}% online`}
            />
          )}
        </KpiCard>
      ))}
    </div>
  );
}
