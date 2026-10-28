import { eidGetList } from "@/lib/eid/api";
import { bracketSeries } from "@/lib/eid/series";
import { categoryParams, titleFor } from "@/lib/eid/tat-segment";
import type { TatBracketsByMonth } from "@/lib/eid/types";
import { intervalParam, monthLabel, type DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT } from "./constants";

export { titleFor };

/** Segment 0 is the API default, so it sends no `category` (hits the cache seed). */
export const fetchData = (range: DateRange, category: number, token: string | null) =>
  eidGetList<TatBracketsByMonth>(
    ENDPOINT,
    { interval_dates: intervalParam(range), ...categoryParams(category) },
    token,
  );

export const toChart = (rows: TatBracketsByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: bracketSeries(rows),
});

export const toExcel = (rows: TatBracketsByMonth[]): ExcelSheet => chartToSheet(toChart(rows), "Tempo Resposta");
