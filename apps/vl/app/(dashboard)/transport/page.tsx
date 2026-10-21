"use client";

import { useCallback, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { PeriodButton, WeekPicker, type WeekBars } from "@repo/design_system/app/organisms/popups/WeekPicker";
import { recentWeeks, weekRangeLabel, type WeekRange } from "@repo/design_system/lib/weeks";
import { useReport } from "@/hooks/use-report";
import { DEMO_DATA, fetchTransport, NATIONAL } from "@/lib/vl/transport/data";
import { TAT_CLASSES } from "@/lib/vl/transport/tat";
import { UNRELEASED_PAGES } from "@/lib/vl/nav";
import { TransportSummary } from "./components/transport-summary";
import { TransportMap } from "./components/transport-map";
import { TransportDetail } from "./components/transport-detail";
import { LABELS, PROVINCE_LABELS, WEEK_COUNT } from "./constants";

const COLORS = TAT_CLASSES.map((c) => c.color);

export default function TransportPage() {
  // Still being built: not in production builds (the sidebar hides it there too).
  if (process.env.NODE_ENV === "production" && UNRELEASED_PAGES.includes("/transport")) notFound();

  const weeks = useMemo(() => recentWeeks(WEEK_COUNT), []);
  // The last complete week, as the mockup opens.
  const [range, setRange] = useState<WeekRange>({ from: WEEK_COUNT - 1, to: WEEK_COUNT - 1 });
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const report = useReport((_token) => fetchTransport(weeks, { range, province, district }), [weeks, range, province, district]);
  // While another place loads, the previous place's figures are still in `report.data`; the
  // summary and detail show them dimmed (the cards' loading state) rather than blank.
  const view = report.data;
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
            <h2 className="text-xl leading-7 font-bold text-[#1C252E] dark:text-white">{LABELS.PAGE_TITLE}</h2>
            <p className="text-sm text-[#637381] dark:text-[#919EAB]">{LABELS.LEG}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {DEMO_DATA && (
              <span
                title={LABELS.DEMO_HINT}
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-[rgba(255,171,0,0.16)] px-2.5 text-xs font-bold text-[#B76E00] dark:text-[#FFD666]"
              >
                <FlaskConical aria-hidden className="size-3.5" />
                {LABELS.DEMO}
              </span>
            )}
            <PeriodButton label={period} onClick={() => setPicking(true)} />
          </div>
        </header>

        <TransportSummary view={view} place={place} />

        {/* Map 2/3 and detail 1/3 on wide screens, stacked below 1024px of content. Each card keeps
            its own height: the detail grows with its table, the map would only get empty space. */}
        <div className="grid grid-cols-1 items-start gap-6 @[1024px]:grid-cols-3">
          <div className="flex min-w-0 @[1024px]:col-span-2">
            <TransportMap
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
