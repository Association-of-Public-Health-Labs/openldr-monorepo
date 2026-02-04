"use client"

import MTBRegisteredByLab from "./reports/mtb-registered-by-lab"
import MTBRegisteredByMonth from "./reports/mtb-registered-by-month"
import MTBRejectedSamplesByLab from "./reports/mtb-rejected-samples-by-lab"
import MTBRejectedSamplesByMonth from "./reports/mtb-rejected-samples-by-month"
import MTBRejectedSamplesByLabAndReason from "./reports/mtb-rejected-samples-by-lab-and-reason"
import MTBRejectedSamplesByMonthAndReason from "./reports/mtb-rejected-samples-by-month-and-reason"

export default function LabPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[1536px]:gap-8">
        <div className="grid grid-cols-1 @[640px]:grid-cols-2 gap-3 sm:gap-4 @[1536px]:gap-8">
          <MTBRegisteredByLab />
          <MTBRegisteredByMonth />
          <MTBRejectedSamplesByLab />
          <MTBRejectedSamplesByMonth />
          <MTBRejectedSamplesByLabAndReason />
          <MTBRejectedSamplesByMonthAndReason />
        </div>
      </div>
    </div>
  )
}