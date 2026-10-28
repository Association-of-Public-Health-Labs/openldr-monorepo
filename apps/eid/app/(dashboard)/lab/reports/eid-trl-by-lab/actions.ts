import { bracketSeries } from "@/lib/eid/series";
import { categoryParams, titleFor } from "@/lib/eid/tat-segment";
import { uniqueLabLabels } from "@/lib/eid/lab-labels";
import { labFetch, LEVEL_LABELS } from "@/lib/eid/lab-cards";
import type { TatBracketsByLab } from "@/lib/eid/types";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export { titleFor };

/** Segment 0 is the API default, so the first request is the cache seed {interval_dates}. */
export const extraParamsFor = categoryParams;

export const fetchData = labFetch<TatBracketsByLab>(ENDPOINT);

export const toChart = (all: TatBracketsByLab[]): ChartModel => {
  // A row with no name would be a null category, which crashes ApexCharts.
  const rows = all.filter((r) => r.testing_facility);
  return { labels: uniqueLabLabels(rows, (r) => r.testing_facility as string, (r) => r.testing_facility_code), series: bracketSeries(rows) };
};

export const toExcel = (rows: TatBracketsByLab[]) => chartToSheet(toChart(rows), LEVEL_LABELS.lab);
