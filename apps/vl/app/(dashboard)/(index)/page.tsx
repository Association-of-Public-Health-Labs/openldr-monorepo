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
      <div className="grid grid-cols-1 gap-6">
        <OverviewStatusCards />
        {/* As Minimals' "Area installed" / "Current download" row: 2/3 and 1/3 on wide screens, halves on tablets, stacked on phones. */}
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2 @[1024px]:grid-cols-3">
          <div className="flex min-w-0 @[1024px]:col-span-2">
            <VlSuppressionTrend />
          </div>
          <VlSuppressionMap />
        </div>
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
          <VlTatNational />
          <VlTatVsDisalinks />
        </div>
        <VlIndicatorsSummary />
      </div>
    </div>
  );
}
