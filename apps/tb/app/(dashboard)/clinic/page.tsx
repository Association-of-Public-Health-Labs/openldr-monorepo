"use client"

import MTBRegisteredByFacility from "./reports/mtb-registered-by-facility";
import MTBTestedByFacility from "./reports/mtb-tested-by-facility";
import MTBTestedSamplesDisaggregatedByDrug from "./reports/mtb-tested-samples-disaggregated-by-drug";
import MTBTestedSamplesDisaggregatedByDrugAndAge from "./reports/mtb-tested-samples-disaggregated-by-drug-and-age";

export default function DashboardPage() {

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBRegisteredByFacility />
          <MTBTestedByFacility />
          <MTBTestedSamplesDisaggregatedByDrug />
          <MTBTestedSamplesDisaggregatedByDrugAndAge />
        </div>
      </div>
    </div>
  );
}