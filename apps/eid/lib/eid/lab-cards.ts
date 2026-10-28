import { eidGetList } from "@/lib/eid/api";
import { EID_PRIMARY, EID_SECONDARY } from "@/lib/eid/series";
import type { TestedByLab } from "@/lib/eid/types";
import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import type { LabLevel } from "@repo/design_system/lib/report/lab-drill";
import type { Params } from "@repo/design_system/lib/report/params";
import { num } from "@repo/design_system/lib/report/format";
import { chartToSheet, type ChartModel, type Series } from "@repo/design_system/lib/report/series";

/** Excel corner cell per drill level. */
export const LEVEL_LABELS: Record<LabLevel, string> = {
  lab: "Laboratório",
  province: "Província",
  district: "Distrito",
  health_facility: "Unidade Sanitária",
};

/**
 * Request builder of the lab cards. `extra` (the card's params plus, with a drill, the drill's) goes after
 * `interval_dates`. The chosen lab codes are added unless the drill already sent `lab_code`
 * (it includes the chosen labs, or the clicked lab's code).
 */
export const labFetch =
  <Row>(endpoint: string) =>
  (range: DateRange, codes: string[], token: string | null, extra: Params = {}) =>
    eidGetList<Row>(endpoint, { interval_dates: intervalParam(range), ...extra, ...(extra.lab_code || codes.length === 0 ? {} : { lab_code: codes }) }, token);

/** Positivo = positive, Negativo = total − positive (never below 0; ✱7). */
export const testedSeries = (rows: { total: number; positive: number }[]): Series[] => [
  { name: "Positivo", color: EID_PRIMARY, data: rows.map((r) => num(r.positive)) },
  { name: "Negativo", color: EID_SECONDARY, data: rows.map((r) => Math.max(0, num(r.total) - num(r.positive))) },
];

/** The bar label: the lab at lab level (`testing_facility`), the requesting province/district/facility below. */
export const labelOf = (r: TestedByLab): string => r.requesting_facility || r.testing_facility || "";
export const codeOf = (r: TestedByLab): string | undefined => r.testing_facility_code || undefined;

export const toTestedChart = (all: TestedByLab[]): ChartModel => {
  // A row with no name would be a null category, which crashes ApexCharts.
  const rows = all.filter((r) => labelOf(r));
  return { labels: rows.map(labelOf), series: testedSeries(rows) };
};

export const toTestedExcel = (rows: TestedByLab[], level: LabLevel = "lab") => chartToSheet(toTestedChart(rows), LEVEL_LABELS[level]);
