import EidStatusCards from "./reports/eid-status-cards";
import EidPositivity from "./reports/eid-positivity";
import EidProvinceMap from "./reports/eid-province-map";
import EidTatByMonth from "./reports/eid-tat-by-month";
import EidTatBrackets from "./reports/eid-tat-brackets";
import EidKeyIndicators from "./reports/eid-key-indicators";
import EidRejectedByMonth from "./reports/eid-rejected-by-month";
import EidEquipmentByMonth from "./reports/eid-equipment-by-month";

export default function SummaryPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <EidStatusCards />
        {/* 2/3 and 1/3 on wide screens, halves on tablets, stacked on phones (as VL). */}
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2 @[1024px]:grid-cols-3">
          <div className="flex min-w-0 @[1024px]:col-span-2">
            <EidPositivity />
          </div>
          <EidProvinceMap />
        </div>
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
          <EidTatByMonth />
          <EidTatBrackets />
        </div>
        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
          <EidRejectedByMonth />
          <EidEquipmentByMonth />
        </div>
        <EidKeyIndicators />
      </div>
    </div>
  );
}
