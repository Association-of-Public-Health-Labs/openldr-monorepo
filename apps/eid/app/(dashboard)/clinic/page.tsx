import EidRegisteredByFacility from "./reports/eid-registered-by-facility";
import EidRegisteredByMonthFacility from "./reports/eid-registered-by-month";
import EidTestedByFacility from "./reports/eid-tested-by-facility";
import EidTestedByMonthFacility from "./reports/eid-tested-by-month";
import EidRejectedByFacility from "./reports/eid-rejected-by-facility";
import EidRejectedByMonthFacility from "./reports/eid-rejected-by-month";
import EidGenderByFacility from "./reports/eid-gender-by-facility";
import EidGenderByMonth from "./reports/eid-gender-by-month";
import EidTatAvgByFacility from "./reports/eid-tat-avg-by-facility";
import EidTatAvgByMonth from "./reports/eid-tat-avg-by-month";
import EidTatDaysByFacility from "./reports/eid-tat-days-by-facility";
import EidTatDaysByMonth from "./reports/eid-tat-days-by-month";

/** The twelve Província / Distrito / US cards, in the legacy order. */
export default function Page() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
        <EidRegisteredByFacility />
        <EidRegisteredByMonthFacility />
        <EidTestedByFacility />
        <EidTestedByMonthFacility />
        <EidRejectedByFacility />
        <EidRejectedByMonthFacility />
        <EidGenderByFacility />
        <EidGenderByMonth />
        <EidTatAvgByFacility />
        <EidTatAvgByMonth />
        <EidTatDaysByFacility />
        <EidTatDaysByMonth />
      </div>
    </div>
  );
}
