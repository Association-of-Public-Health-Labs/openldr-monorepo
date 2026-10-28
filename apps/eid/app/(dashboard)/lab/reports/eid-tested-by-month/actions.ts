import type { TestedByMonth } from "@/lib/eid/types";
import { labFetch, testedSeries } from "@/lib/eid/lab-cards";
import { monthLabel } from "@repo/design_system/lib/report/dates";
import type { Params } from "@repo/design_system/lib/report/params";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import { ENDPOINT, TABS, type TestedTab } from "./constants";

export const fetchData = labFetch<TestedByMonth>(ENDPOINT);

export const extraParamsFor = (tab: TestedTab): Params => (tab === "all" ? {} : { lab_type: tab });

/** The legacy suffix on the title: " (Convencional)" / " (PoC)". */
export const titleSuffixFor = (tab: TestedTab): string => (tab === "all" ? "" : ` (${TABS.find((t) => t.value === tab)?.label})`);

export const toChart = (rows: TestedByMonth[]): ChartModel => ({
  labels: rows.map((r) => monthLabel(r.year, r.month)),
  series: testedSeries(rows),
});

export const toExcel = (rows: TestedByMonth[]) => chartToSheet(toChart(rows), "Mês");
