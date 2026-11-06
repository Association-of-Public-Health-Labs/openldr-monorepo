import { intervalParam } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import type { ChartModel } from "@repo/design_system/lib/report/series";
import { usageGetList } from "@/lib/admin/usage-api";
import { last12Months, pivotMonthly, type ActiveUsersMonth } from "@/lib/admin/usage";
import { ENDPOINT } from "./constants";

/** Always the last 12 months, whatever the page's period. */
export async function fetchData(token: string | null, today: Date = new Date()) {
  const { months, range } = last12Months(today);
  const rows = await usageGetList<ActiveUsersMonth>(ENDPOINT, { interval_dates: intervalParam(range) }, token);
  return { rows, months, range };
}

export type MonthlyData = Awaited<ReturnType<typeof fetchData>>;

export const toChart = ({ rows, months }: MonthlyData): ChartModel => pivotMonthly(rows, months);

export function toExcel(data: MonthlyData): ExcelSheet {
  const chart = toChart(data);
  return {
    header: ["Utilizadores activos", ...chart.labels],
    rows: chart.series.map((s) => [s.name, ...s.data.map((v) => v ?? "")]),
  };
}
