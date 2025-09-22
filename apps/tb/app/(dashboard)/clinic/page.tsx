"use client"

import MTBRegisteredByFacility from "./reports/mtb-registered-by-facility";
import MTBTestedByFacility from "./reports/mtb-tested-by-facility";
import MTBTestedSamplesDisaggregatedByDrug from "./reports/mtb-tested-samples-disaggregated-by-drug";
import MTBTestedSamplesDisaggregatedByDrugAndAge from "./reports/mtb-tested-samples-disaggregated-by-drug-and-age";
import MTBTestedSamplesDisaggregatedByGender from "./reports/mtb-tested-samples-disaggregated-by-gender";
import MTBRejectedSamples from "./reports/mtb-rejected-samples";
import MTBRejectedSamplesByReason from "./reports/mtb-rejected-samples-by-reason";
import MTBResponseTimeInDays from "./reports/mtb-response-time-days";

export default function DashboardPage() {

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBRegisteredByFacility />
          <MTBTestedByFacility />
          <MTBTestedSamplesDisaggregatedByGender />
          <MTBResponseTimeInDays />
          <MTBTestedSamplesDisaggregatedByDrug />
          <MTBTestedSamplesDisaggregatedByDrugAndAge />
          <MTBRejectedSamples />
          <MTBRejectedSamplesByReason />
        </div>
      </div>
    </div>
  );
}