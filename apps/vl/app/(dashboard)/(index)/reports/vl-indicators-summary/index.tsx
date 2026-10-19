"use client";

import { ReportCard } from "@/components/report-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/design_system/components/ui/table";
import { useRangeReport } from "@/hooks/use-report";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, toExcel, toTable } from "./actions";
import Docs from "./docs";

export default function VlIndicatorsSummary() {
  const r = useRangeReport(fetchData);
  const rows = r.data ?? [];
  const table = toTable(rows);
  return (
    <ReportCard
      title={TITLE}
      subtitle={r.subtitle}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      empty={rows.length === 0}
      onRetry={r.retry}
      onSubmit={r.onSubmit}
      onRestart={r.onRestart}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* The indicator names stay in view while the months scroll (phones). */}
              <TableHead className="sticky left-0 z-10 bg-white dark:bg-[#1d232a]">Indicadores</TableHead>
              {table.columns.map((c) => (
                <TableHead key={c} className="text-right">{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="sticky left-0 z-10 bg-white whitespace-nowrap font-medium dark:bg-[#1d232a]">{row.label}</TableCell>
                {row.values.map((v, i) => (
                  <TableCell key={table.columns[i]} className="text-right">{v.toLocaleString("pt-PT")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ReportCard>
  );
}
