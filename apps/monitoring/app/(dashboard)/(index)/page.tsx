import CategoryKpis from "./reports/category-kpis";
import HostsStatusGrid from "./reports/hosts-status-grid";
import NationalConnectivity from "./reports/national-connectivity";

export default function SummaryPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <CategoryKpis />
        {/* Donut and map side by side from 840px of content; stacked below. */}
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
          <NationalConnectivity />
          {/* connectivity-map (Task 8) */}
        </div>
        <HostsStatusGrid />
      </div>
    </div>
  );
}
