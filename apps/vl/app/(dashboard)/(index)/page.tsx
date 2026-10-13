"use client";

import OverviewStatusCards from "./reports/overview-status-cards";
import VlSuppressionTrend from "./reports/vl-suppression-trend";
import VlSuppressionMap from "./reports/vl-suppression-map";
import VlTatNational from "./reports/vl-tat-national";
import VlTatVsDisalinks from "./reports/vl-tat-vs-disalinks";
import VlIndicatorsSummary from "./reports/vl-indicators-summary";

export default function SummaryPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[1536px]:gap-8">
        <OverviewStatusCards />
        <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
          <VlSuppressionTrend />
          <VlSuppressionMap />
          <VlTatNational />
          <VlTatVsDisalinks />
        </div>
        <VlIndicatorsSummary />
      </div>
    </div>
  );
}
