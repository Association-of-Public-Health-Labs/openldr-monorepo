"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function TopUsers({ filters }: { filters: UsageFilters }) {
  const r = useReport((token) => fetchData(filters, token), [filters.range, filters.dashboard]);
  const router = useRouter();
  const table = r.data ? toTable(r.data) : [];
  return (
    <ReportCard
      title={TITLE}
      subtitle={`${filters.label} · clique para abrir o utilizador`}
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
        <CardMessage tone="empty" message={emptyMessage("utilizadores")} />
      ) : (
        <UsageTable columns={[{ label: "Nome" }, { label: "Dashboards" }, { label: "Sessões", align: "right" }, { label: "Último acesso", align: "right" }]}>
          {table.map((u) => (
            <TableRow key={u.id} className="cursor-pointer hover:bg-[rgba(145,158,171,0.04)]" onClick={() => router.push(u.href)}>
              <TableCell className={CELL}>
                <Link href={u.href} onClick={(e) => e.stopPropagation()} className="focus-visible:ring-ring/50 rounded font-semibold outline-none hover:underline focus-visible:ring-[3px]">
                  {u.name}
                </Link>
                {u.email && <span className="text-muted-foreground block text-xs">{u.email}</span>}
              </TableCell>
              <TableCell className={CELL}>
                {u.tags.map((t) => (
                  <span key={t} className="mr-1 inline-block rounded-md bg-[#F4F6F8] px-1.5 py-px text-[11px] font-semibold text-[#454F5B] dark:bg-[#28323D] dark:text-[#C4CDD5]">{t}</span>
                ))}
              </TableCell>
              <TableCell className={`${CELL} text-right tabular-nums`}>{u.sessions}</TableCell>
              <TableCell className={`${CELL} text-right whitespace-nowrap`}>{u.lastVisit}</TableCell>
            </TableRow>
          ))}
        </UsageTable>
      )}
    </ReportCard>
  );
}
