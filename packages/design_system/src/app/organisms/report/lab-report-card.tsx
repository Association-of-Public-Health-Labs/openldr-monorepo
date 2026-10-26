"use client";

import { useLabReport } from "../../../hooks/report/use-report";
import type { DateRange } from "../../../lib/report/dates";
import { chartDomId } from "../../../lib/report/export/chart-id";
import type { ExcelSheet } from "../../../lib/report/export/excel";
import type { ChartModel } from "../../../lib/report/series";
import { ComboChart } from "./charts/combo-chart";
import { StackedChart } from "./charts/stacked-chart";
import { ReportCard } from "./report-card";

export type LabReportCardProps<Row> = {
  cardId: string;
  title: string;
  fetchData: (range: DateRange, codes: string[], token: string | null) => Promise<Row[]>;
  toChart: (rows: Row[]) => ChartModel;
  toExcel: (rows: Row[]) => ExcelSheet;
  documentation: React.ReactNode;
  chart?: "stacked" | "combo";
  yTitles?: [string, string?];
  initialRange?: () => DateRange;
  /** Maps the selected lab names to the codes the API takes. */
  toCodes: (labs: string[]) => string[];
  /** Renders the lab-selection dialog (app-specific). */
  labsDialog: (state: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    selected: string[];
    onApply: (names: string[]) => void;
  }) => React.ReactNode;
};

export function LabReportCard<Row>(props: LabReportCardProps<Row>) {
  const r = useLabReport(props.fetchData, props.toCodes, props.initialRange);
  const rows = r.data ?? [];
  const model = props.toChart(rows);
  const id = chartDomId(props.cardId);
  return (
    <>
      <ReportCard
        title={props.title}
        subtitle={r.subtitle}
        exportSubtitle={r.exportSubtitle}
        cardId={props.cardId}
        reportType="national"
        loading={r.loading}
        error={r.error}
        empty={rows.length === 0}
        onRetry={r.retry}
        onSubmit={r.onSubmit}
        onRestart={r.onRestart}
        onSelectLabs={r.openLabs}
        excel={() => props.toExcel(rows)}
        documentation={props.documentation}
      >
        {props.chart === "combo" ? (
          <ComboChart id={id} labels={model.labels} series={model.series} yTitles={props.yTitles} />
        ) : (
          <StackedChart id={id} model={model} />
        )}
      </ReportCard>
      {props.labsDialog(r.labsDialog)}
    </>
  );
}
