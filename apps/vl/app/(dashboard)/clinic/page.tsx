"use client";

import VlRegisteredByFacility from "./reports/vl-registered-by-facility";
import VlTestedByFacility from "./reports/vl-tested-by-facility";
import VlTestedByGenderByFacility from "./reports/vl-tested-by-gender-by-facility";
import VlTestedByGenderByMonth from "./reports/vl-tested-by-gender-by-month";
import VlTatByFacilityMonth from "./reports/vl-tat-by-facility-month";
import VlTatByFacility from "./reports/vl-tat-by-facility";
import VlTestedByAge from "./reports/vl-tested-by-age";
import VlTestedPregnant from "./reports/vl-tested-pregnant";
import VlTestedBreastfeeding from "./reports/vl-tested-breastfeeding";
import VlTestReasons from "./reports/vl-test-reasons";
import VlRejectedByFacilityMonth from "./reports/vl-rejected-by-facility-month";
import VlRejectedByFacility from "./reports/vl-rejected-by-facility";

export default function ClinicPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
        <VlRegisteredByFacility />
        <VlTestedByFacility />
        <VlTestedByGenderByFacility />
        <VlTestedByGenderByMonth />
        <VlTatByFacilityMonth />
        <VlTatByFacility />
        <VlTestedByAge />
        <VlTestedPregnant />
        <VlTestedBreastfeeding />
        <VlTestReasons />
        <VlRejectedByFacilityMonth />
        <VlRejectedByFacility />
      </div>
    </div>
  );
}
