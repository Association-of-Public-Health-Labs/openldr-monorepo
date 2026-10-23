"use client";

import type { MainCardHeaderOptions } from "@repo/design_system/app/molecules/cards/MainCardHeader";
import { useFacilityReport } from "@/hooks/use-facility-report";
import type { Params } from "@/lib/vl/api";
import type { ExcelSheet } from "@/lib/vl/export/excel";
import { chartDomId } from "@/lib/vl/export/chart-id";
import type { PatientFilters } from "@/lib/vl/patients";
import type { ChartModel } from "@/lib/vl/series";
import { ComboChart } from "./charts/combo-chart";
import { Donut } from "@repo/design_system/app/atoms/charts/apex/Donut";
import { StackedChart } from "./charts/stacked-chart";
import { PatientsDialog } from "./patients-dialog";
import { ReportCard } from "./report-card";

export type FacilityReportCardProps<Row> = {
  cardId: string;
  title: string;
  endpoint: string;
  toChart: (rows: Row[]) => ChartModel;
  toExcel: (rows: Row[], levelLabel: string) => ExcelSheet;
  documentation: React.ReactNode;
  drill?: boolean;
  patientFilters?: PatientFilters;
  extraParams?: Params;
  chart?: "stacked" | "combo" | "donut";
  stacked?: boolean;
  /** Slice colours of the donut, in label order. */
  pieColors?: string[];
  footer?: React.ReactNode;
  extraOptions?: MainCardHeaderOptions[];
};

export function FacilityReportCard<Row>(props: FacilityReportCardProps<Row>) {
  const r = useFacilityReport<Row>({
    endpoint: props.endpoint,
    extraParams: props.extraParams,
    patientFilters: props.patientFilters,
  });
  const model = props.toChart(r.rows);
  const id = chartDomId(props.cardId);
  const onClick = props.drill ? r.onChartClick : undefined;
  const hint = props.drill ? r.facilityHint : null;
  const footer =
    props.footer || hint ? (
      <div className="space-y-1 px-4 pb-3 text-xs text-muted-foreground">
        {props.footer}
        {hint && <p>{hint}</p>}
      </div>
    ) : undefined;

  return (
    <>
      <ReportCard
        title={props.title}
        subtitle={r.subtitle}
        exportSubtitle={r.exportSubtitle}
        cardId={props.cardId}
        reportType="facility"
        loading={r.loading}
        error={r.error}
        empty={r.rows.length === 0}
        onRetry={r.retry}
        onSubmit={r.onSubmit}
        onRestart={r.onRestart}
        extraOptions={props.extraOptions}
        excel={() => props.toExcel(r.rows, r.levelLabel)}
        documentation={props.documentation}
        footer={footer}
      >
        {props.chart === "donut" ? (
          <Donut id={id} labels={model.labels} series={model.series[0]?.data ?? []} colors={props.pieColors ?? []} totalLabel="Total de amostras" height={350} />
        ) : props.chart === "combo" ? (
          <ComboChart id={id} labels={model.labels} series={model.series} stacked={props.stacked} onClick={onClick} />
        ) : (
          <StackedChart id={id} model={model} onClick={onClick} />
        )}
      </ReportCard>
      {props.drill && <PatientsDialog state={r.patients} subtitle={r.exportSubtitle} onClose={r.closePatients} />}
    </>
  );
}
