"use client";

import { useState } from "react";
import { useLabReport } from "../../../hooks/report/use-report";
import type { DateRange } from "../../../lib/report/dates";
import { chartDomId } from "../../../lib/report/export/chart-id";
import type { ExcelSheet } from "../../../lib/report/export/excel";
import {
  initialLabDrill,
  labDrillClickRow,
  labDrillLevel,
  labDrillParams,
  labTrailLabel,
  rowsForDrill,
  sameLabDrill,
  type LabDrill,
  type LabLevel,
} from "../../../lib/report/lab-drill";
import type { ChartModel } from "../../../lib/report/series";
import type { Params } from "../../../lib/report/params";
import type { MainCardHeaderOptions } from "../../molecules/cards/MainCardHeader";
import { ComboChart } from "./charts/combo-chart";
import { StackedChart } from "./charts/stacked-chart";
import { ReportCard } from "./report-card";

export type LabReportCardProps<Row> = {
  cardId: string;
  title: string;
  fetchData: (range: DateRange, codes: string[], token: string | null, extra: Params) => Promise<Row[]>;
  /** `level` is the drill level of `rows` (`"lab"` without `drill`); one-argument functions are fine. */
  toChart: (rows: Row[], level?: LabLevel) => ChartModel;
  toExcel: (rows: Row[], level?: LabLevel) => ExcelSheet;
  documentation: React.ReactNode;
  chart?: "stacked" | "combo";
  yTitles?: [string, string?];
  initialRange?: () => DateRange;
  /** Extra API params (e.g. a segment); a change reloads the card. */
  extraParams?: Params;
  /** Extra options for the card header menu. */
  extraOptions?: MainCardHeaderOptions[];
  /** Maps the selected lab names to the codes the API takes. */
  toCodes: (labs: string[]) => string[];
  /** Renders the lab-selection dialog (app-specific). */
  labsDialog: (state: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    selected: string[];
    onApply: (names: string[]) => void;
  }) => React.ReactNode;
  /**
   * Lab drill-down (lab → province → district → health facility). A bar click finds the row whose
   * `labelOf` is the bar label; at lab level its `codeOf` is the lab code sent to the API.
   * A click with no matching row does nothing.
   *
   * The drill owns the API params `facility_type`, `province`, `district`, `lab_code` and
   * `disaggregation`: apps must not put them in `extraParams` (the drill's values win).
   *
   * The drill trail is kept when the date range changes; "Reiniciar" or a new lab selection resets it.
   */
  drill?: {
    start: "lab" | "province";
    codeOf: (row: Row) => string | undefined;
    labelOf: (row: Row) => string;
  };
  /** Rendered above the chart (e.g. tabs or a select). */
  controls?: React.ReactNode;
  /** Appended to the title (e.g. " (PoC)"). */
  titleSuffix?: string;
  /** Called by "Reiniciar o relatório", after the range, labs and drill are cleared (e.g. to reset a tab held by the app). */
  onRestart?: () => void;
};

export function LabReportCard<Row>(props: LabReportCardProps<Row>) {
  const extra = props.extraParams ?? {};
  const start = props.drill?.start ?? "lab";
  const [drill, setDrill] = useState<LabDrill>(() => initialLabDrill(start));
  const r = useLabReport(
    async (range, codes, token) => {
      // Without `drill` the card behaves as before: `extra` goes to fetchData unchanged.
      const params = props.drill ? { ...extra, ...labDrillParams(drill, codes) } : extra;
      return { drill, rows: await props.fetchData(range, codes, token, params) };
    },
    props.toCodes,
    props.initialRange,
    [JSON.stringify(extra), JSON.stringify(drill)],
  );
  // useReport keeps the previous data while a new request loads: draw rows only for the current drill.
  const rows = rowsForDrill(r.data, drill);
  const level: LabLevel = props.drill ? labDrillLevel(drill) : "lab";
  const model = props.toChart(rows, level);
  const id = chartDomId(props.cardId);
  const title = props.title + (props.titleSuffix ?? "");
  const trail = props.drill ? labTrailLabel(drill) : "";
  const withTrail = (s: string) => (trail ? `${s} | ${trail}` : s);

  const onClick = props.drill
    ? (label: string) => {
        const { codeOf, labelOf } = props.drill!;
        const next = labDrillClickRow(drill, rows, label, labelOf, codeOf);
        if (next) setDrill(next);
      }
    : undefined;
  const onRestart = () => {
    r.onRestart();
    setDrill(initialLabDrill(start));
    props.onRestart?.();
  };
  const labsDialog = {
    ...r.labsDialog,
    onApply: (names: string[]) => {
      r.labsDialog.onApply(names);
      setDrill(initialLabDrill(start));
    },
  };

  return (
    <>
      <ReportCard
        title={title}
        subtitle={withTrail(r.subtitle)}
        exportSubtitle={withTrail(r.exportSubtitle)}
        cardId={props.cardId}
        reportType="national"
        loading={r.loading || (r.data != null && !sameLabDrill(r.data.drill, drill))}
        error={r.error}
        empty={rows.length === 0}
        onRetry={r.retry}
        onSubmit={r.onSubmit}
        onRestart={onRestart}
        onSelectLabs={r.openLabs}
        excel={() => props.toExcel(rows, level)}
        documentation={props.documentation}
        extraOptions={props.extraOptions}
        controls={props.controls}
      >
        {props.chart === "combo" ? (
          <ComboChart id={id} labels={model.labels} series={model.series} yTitles={props.yTitles} onClick={onClick} />
        ) : (
          <StackedChart id={id} model={model} onClick={onClick} />
        )}
      </ReportCard>
      {props.labsDialog(labsDialog)}
    </>
  );
}
