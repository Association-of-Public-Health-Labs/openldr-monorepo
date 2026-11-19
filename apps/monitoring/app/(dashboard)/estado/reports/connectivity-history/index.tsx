"use client";

import { useMemo, useState } from "react";
import { SortableTable, type SortableColumn } from "@repo/design_system/app/molecules/tables/SortableTable";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "@repo/design_system/lib/report/dates";
import type { HistoryRow } from "@/lib/monitoring/types";
import { CARD_ID, STATE_TABS, TITLE } from "./constants";
import { fetchData, formatMaputo, toExcel, type StateFilter } from "./actions";
import Docs from "./docs";

const time = (iso: string | null) => (iso ? Date.parse(iso) : 0);

export default function ConnectivityHistory({ code, hostName }: { code: string | null; hostName: string }) {
  const [range, setRange] = useState<DateRange>(() => lastYear());
  const [state, setState] = useState<StateFilter>("Todos");
  const report = useReport(() => (code ? fetchData(code, state, range) : Promise.resolve([])), [code, state, range]);
  const rows = report.data ?? [];

  const columns = useMemo<SortableColumn<HistoryRow>[]>(() => [
    { key: "id", header: "ID", cell: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}</span>, sortValue: (r) => r.id, secondary: true },
    {
      key: "state", header: "Estado", sortValue: (r) => r.state,
      cell: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.state === "Pendente" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>{r.state}</span>
      ),
    },
    { key: "wentOffline", header: "Ficou offline", cell: (r) => formatMaputo(r.wentOffline), sortValue: (r) => time(r.wentOffline) },
    { key: "wentOnline", header: "Ficou online", cell: (r) => formatMaputo(r.wentOnline), sortValue: (r) => time(r.wentOnline) },
    { key: "duration", header: "Tempo offline", align: "right", cell: (r) => r.offlineDurationLabel, sortValue: (r) => r.offlineDurationMs ?? 0 },
    { key: "createdAt", header: "Criado em", cell: (r) => formatMaputo(r.createdAt), sortValue: (r) => time(r.createdAt), secondary: true },
    { key: "updatedAt", header: "Actualizado", cell: (r) => formatMaputo(r.updatedAt), sortValue: (r) => time(r.updatedAt), secondary: true },
  ], []);

  return (
    <ReportCard
      title={TITLE}
      subtitle={formatPeriodPt(range)}
      exportSubtitle={`${hostName} | ${formatRangePt(range)} | ${state}`}
      cardId={CARD_ID}
      reportType="national"
      loading={report.loading}
      error={report.error}
      // The table shows its own empty message.
      empty={false}
      onRetry={report.retry}
      onSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
      onRestart={() => {
        setRange(lastYear());
        setState("Todos");
      }}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
      controls={<SegmentedSwitch<StateFilter> items={STATE_TABS} value={state} onChange={setState} rootClassName="w-full" className="mx-4 ml-auto" />}
    >
      <SortableTable
        id={`${CARD_ID}-table`}
        label={`${TITLE}: ${hostName}`}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        defaultSort={{ key: "wentOffline", direction: "desc" }}
        search={{ placeholder: "Procurar pelo ID", text: (r) => r.id }}
        loading={report.loading}
        emptyMessage="Sem dados para o período e filtros seleccionados."
        maxHeight={480}
      />
    </ReportCard>
  );
}
