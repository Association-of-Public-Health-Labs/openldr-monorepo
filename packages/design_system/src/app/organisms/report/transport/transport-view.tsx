"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { PeriodButton, WeekPicker, type WeekBars } from "../../popups/WeekPicker";
import { recentWeeks, weekRangeLabel, type WeekRange } from "../../../../lib/weeks";
import { useReport } from "../../../../hooks/report/use-report";
import { useReportServices } from "../../../../hooks/report/report-context";
import type { Params } from "../../../../lib/report/params";
import { dataFor, fetchTransport, NATIONAL, paramsKey, type TransportEndpoints } from "../../../../lib/report/transport/data";
import { TAT_CLASSES } from "../../../../lib/report/tat";
import { PROVINCE_LABELS } from "../../../../lib/report/districts";
import { TransportSummary } from "./transport-summary";
import { TransportMap } from "./transport-map";
import { TransportDetail } from "./transport-detail";
import type { TransportIds, TransportLabels } from "./labels";

const COLORS = TAT_CLASSES.map((c) => c.color);

/** Weeks in the picker and the weekly chart (the API's default window for tat_by_week). */
export const TRANSPORT_WEEK_COUNT = 28;

export type TransportViewProps = {
  labels: TransportLabels;
  ids: TransportIds;
  /** The cards' documentation (the app's wording, source table and endpoints). */
  docs: ReactNode;
  /** The app's transport endpoints (`transportEndpoints(base)`). */
  endpoints: TransportEndpoints;
  /** The weekly trend's line, the app's primary as a hex value. */
  trendColor: string;
  /** Sent with every request and keyed in the cache (EID's `type_of_test`). */
  extraParams?: Params;
  /** Before the period button in the header (VL: its weekly reports button and drawer). */
  headerExtra?: ReactNode;
};

/** The Transporte page: summary strip, map and detail of the weekly collection-to-lab-reception TAT. */
export function TransportView({ labels, ids, docs, endpoints, trendColor, extraParams, headerExtra }: TransportViewProps) {
  const { getList } = useReportServices();
  const weeks = useMemo(() => recentWeeks(TRANSPORT_WEEK_COUNT), []);
  // The last complete week, as the mockup opens.
  const [range, setRange] = useState<WeekRange>({ from: TRANSPORT_WEEK_COUNT - 1, to: TRANSPORT_WEEK_COUNT - 1 });
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // Keyed by value, not identity: a new but equal extraParams object does not refetch. getList is
  // read at fetch time (like the module fetcher it replaces), so a new services value does not refetch either.
  const extraKey = paramsKey(extraParams);
  const report = useReport(
    (token) => fetchTransport(getList, endpoints, weeks, { range, province, district, extraParams }, token),
    [endpoints.base, endpoints.byLocation, endpoints.byWeek, weeks, range, province, district, extraKey],
  );
  // While another place loads, the previous place's figures are still in `report.data`; the
  // summary and detail show them dimmed (the cards' loading state) rather than blank. Data
  // fetched for other extra params (another tab) is never shown.
  const view = dataFor(report.data, extraParams);
  const period = weekRangeLabel(weeks, range);
  const place = district ?? (province ? PROVINCE_LABELS[province] ?? province : NATIONAL);

  const bars = useMemo<(WeekBars | undefined)[]>(
    () => (view?.nationalWeekly ?? []).map((values) => ({ values, colors: COLORS })),
    [view?.nationalWeekly],
  );

  const openProvince = useCallback((next: string | null) => {
    setProvince(next);
    setDistrict(null);
  }, []);

  return (
    <div className="w-full @container">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl leading-7 font-bold text-[#1C252E] dark:text-white">{labels.PAGE_TITLE}</h2>
            <p className="text-sm text-[#637381] dark:text-[#919EAB]">{labels.LEG}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {headerExtra}
            <PeriodButton label={period} onClick={() => setPicking(true)} />
          </div>
        </header>

        <TransportSummary view={view} place={place} />

        {/* Map 2/3 and detail 1/3 on wide screens, stacked below 1024px of content. Each card keeps
            its own height: the detail grows with its table, the map would only get empty space. */}
        <div className="grid grid-cols-1 items-start gap-6 @[1024px]:grid-cols-3">
          <div className="flex min-w-0 @[1024px]:col-span-2">
            <TransportMap
              labels={labels}
              ids={ids}
              docs={docs}
              view={view}
              loading={report.loading}
              error={report.error}
              onRetry={report.retry}
              province={province}
              district={district}
              period={period}
              onProvince={openProvince}
              onDistrict={setDistrict}
            />
          </div>
          <div className="flex min-w-0">
            <TransportDetail
              labels={labels}
              ids={ids}
              docs={docs}
              trendColor={trendColor}
              view={view}
              loading={report.loading}
              error={report.error}
              onRetry={report.retry}
              province={province}
              district={district}
              weeks={weeks}
              range={range}
              period={period}
            />
          </div>
        </div>
      </div>

      <WeekPicker open={picking} onOpenChange={setPicking} weeks={weeks} value={range} onApply={setRange} bars={bars} />
    </div>
  );
}
