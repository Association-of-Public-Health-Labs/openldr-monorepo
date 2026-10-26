"use client";

import { DistributionBar } from "@repo/design_system/app/atoms/progress/DistributionBar";
import { TargetProgress } from "@repo/design_system/app/atoms/progress/TargetProgress";
import { StatusBadge } from "@repo/design_system/app/atoms/badges/StatusBadge";
import { OVERLINE, SummaryStrip, SummaryStripItem } from "@repo/design_system/app/molecules/metrics/SummaryStrip";
import { formatNumber } from "@repo/design_system/lib/format-number";
import type { TransportView } from "@/lib/vl/transport/data";
import { statusOf, TARGET, TARGET_DAYS, totalOf, withinTarget } from "@repo/design_system/lib/report/tat";
import { CHILD_LABEL, formatShare, offTargetCount, toSegments } from "../actions";

const BONE = "animate-pulse rounded-md bg-[rgba(145,158,171,0.2)]";

/** Headline figures of the area being viewed, as the mockup's strip under its header. */
export function TransportSummary({ view, place }: { view: TransportView | null; place: string }) {
  if (!view) {
    return (
      <SummaryStrip>
        {[0, 1, 2, 3, 4].map((i) => (
          <SummaryStripItem key={i} grow={i === 1}>
            <span className={`${BONE} h-7 w-20`} />
            <span className={`${BONE} h-3 w-28`} />
          </SummaryStripItem>
        ))}
      </SummaryStrip>
    );
  }

  const { area, children, childLevel } = view;
  const share = withinTarget(area.counts);
  const status = statusOf(area.counts);
  const off = offTargetCount(children);

  return (
    <SummaryStrip>
      <SummaryStripItem>
        <span className="text-base leading-6 font-bold text-[#1C252E] dark:text-white">{place}</span>
        <StatusBadge label={status.label} color={status.color} className="self-start" />
      </SummaryStripItem>
      <SummaryStripItem grow>
        <div className="flex items-center gap-4">
          <span className="text-[32px] leading-10 font-bold text-[#1C252E] tabular-nums dark:text-white">{formatShare(share)}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className={OVERLINE}>
              % transportadas &lt;{TARGET_DAYS} dias · <span className="text-[#637381] normal-case dark:text-[#C4CDD5]">alvo {Math.round(TARGET * 100)}%</span>
            </span>
            <TargetProgress value={share} target={TARGET} />
          </div>
        </div>
      </SummaryStripItem>
      <SummaryStripItem label="Distribuição TAT (dias)">
        <DistributionBar variant="micro" segments={toSegments(area.counts)} className="mt-1" />
      </SummaryStripItem>
      <SummaryStripItem value={formatNumber(totalOf(area.counts))} label="Amostras" />
      <SummaryStripItem value={off} alert={off > 0} label={CHILD_LABEL[childLevel].offTarget} />
      <SummaryStripItem value={formatNumber(area.noReceptionDate)} label="Sem data de recepção" />
    </SummaryStrip>
  );
}
