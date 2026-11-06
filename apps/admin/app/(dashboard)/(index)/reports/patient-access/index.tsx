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

export default function PatientAccessLog({ filters }: { filters: UsageFilters }) {
  const r = useReport((token) => fetchData(filters, token), [filters.range, filters.dashboard]);
  const table = r.data ? toTable(r.data) : [];
  return (
    <ReportCard
      title={TITLE}
      subtitle={`${filters.label} · quem abriu nomes e registos de pacientes`}
      exportSubtitle={formatRangePt(filters.range)}
      cardId={CARD_ID}
      loading={r.loading}
      error={r.error}
      empty={r.loading && !r.data}
      onRetry={r.retry}
      excel={() => toExcel(r.data ?? { rows: [], users: {} })}
      documentation={<Docs />}
    >
      {table.length === 0 ? (
        <CardMessage tone="empty" message={emptyMessage("consultas a dados de pacientes")} />
      ) : (
        <UsageTable columns={[{ label: "Nome" }, { label: "Dashboard" }, { label: "Consultas", align: "right" }, { label: "Última consulta", align: "right" }]}>
          {table.map((a) => (
            <TableRow key={a.key}>
              <TableCell className={`${CELL} font-semibold`}>{a.name}</TableCell>
              <TableCell className={CELL}>{a.dashboard}</TableCell>
              <TableCell className={`${CELL} text-right tabular-nums`}>{a.accesses}</TableCell>
              <TableCell className={`${CELL} text-right whitespace-nowrap`}>{a.lastAccess}</TableCell>
            </TableRow>
          ))}
        </UsageTable>
      )}
    </ReportCard>
  );
}
