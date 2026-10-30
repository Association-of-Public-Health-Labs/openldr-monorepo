import { cvSeries } from "@/lib/vl/series";
import { chartToSheet, type ChartModel } from "@repo/design_system/lib/report/series";
import type { AgeByFacility, TestedByFacility } from "@/lib/vl/types";

/** The API returns one row per location and age group; the card shows one bar per location. */
export function sumByFacility(rows: AgeByFacility[]): TestedByFacility[] {
  const byName = new Map<string, TestedByFacility>();
  for (const r of rows) {
    const acc = byName.get(r.requesting_facility) ?? { requesting_facility: r.requesting_facility, total: 0, suppressed: 0, not_suppressed: 0 };
    acc.total += r.total ?? 0;
    acc.suppressed += r.suppressed ?? 0;
    acc.not_suppressed += r.not_suppressed ?? 0;
    byName.set(r.requesting_facility, acc);
  }
  return [...byName.values()];
}

export function toChart(rows: AgeByFacility[]): ChartModel {
  const summed = sumByFacility(rows);
  return { labels: summed.map((r) => r.requesting_facility), series: cvSeries(summed) };
}

export const toExcel = (rows: AgeByFacility[], levelLabel: string) => chartToSheet(toChart(rows), levelLabel);
