"use client";

import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatRangePt } from "@repo/design_system/lib/report/dates";
import { emptyMessage, type UsageFilters } from "@/lib/admin/usage";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toBars, toExcel } from "./actions";
import Docs from "./docs";

export default function TopPages({ filters }: { filters: UsageFilters }) {
  const r = useReport((token) => fetchData(filters, token), [filters.range, filters.dashboard]);
  const rows = r.data ?? [];
  const bars = toBars(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={`${filters.label} · visualizações`}
      exportSubtitle={formatRangePt(filters.range)}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={r.loading && !r.data}
      onRetry={r.retry}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      {bars.length === 0 ? (
        <CardMessage tone="empty" message={emptyMessage("páginas vistas")} />
      ) : (
        <ul className="space-y-1">
          {bars.map((b) => (
            <li key={b.key} className="grid grid-cols-[minmax(0,10rem)_1fr_3.5rem] items-center gap-3 py-1 text-sm @[480px]:grid-cols-[minmax(0,14rem)_1fr_4rem]">
              <span className="truncate" title={b.label}>{b.label}</span>
              <span aria-hidden className="block h-2.5">
                <span className="block h-full rounded-r bg-[#00B8D9]" style={{ width: `${b.share}%` }} />
              </span>
              <span className="text-right tabular-nums">{b.views}</span>
            </li>
          ))}
        </ul>
      )}
    </ReportCard>
  );
}
