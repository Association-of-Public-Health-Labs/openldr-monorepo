"use client";

import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { TableCell, TableRow } from "@repo/design_system/components/ui/table";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatRangePt } from "@repo/design_system/lib/report/dates";
import { UsageTable, CELL } from "@/components/usage-table";
import { emptyMessage, type UsageFilters } from "@/lib/admin/usage";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

export default function ByDashboard({ filters }: { filters: UsageFilters }) {
  const r = useReport((token) => fetchData(filters, token), [filters.range]);
  const rows = r.data ?? [];
  const table = toTable(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={filters.label}
      exportSubtitle={formatRangePt(filters.range)}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={r.loading && !r.data}
      onRetry={r.retry}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      {table.length === 0 ? (
        <CardMessage tone="empty" message={emptyMessage("utilização")} />
      ) : (
        <UsageTable columns={[{ label: "Dashboard" }, { label: "Activos", align: "right" }, { label: "Sessões", align: "right" }, { label: "Por utilizador", align: "right" }]}>
          {table.map((d) => (
            <TableRow key={d.id}>
              <TableCell className={CELL}>
                <span aria-hidden className="mr-2 inline-block size-2.5 rounded-[3px]" style={{ background: d.color }} />
                {d.name}
              </TableCell>
              <TableCell className={`${CELL} text-right tabular-nums`}>{d.activeUsers}</TableCell>
              <TableCell className={`${CELL} text-right tabular-nums`}>{d.sessions}</TableCell>
              <TableCell className={`${CELL} text-right tabular-nums`}>{d.perUser}</TableCell>
            </TableRow>
          ))}
        </UsageTable>
      )}
    </ReportCard>
  );
}
