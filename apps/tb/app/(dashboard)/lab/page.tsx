"use client"

import MTBRegisteredByLab from "./reports/mtb-registered-by-lab"
import MTBRegisteredByMonth from "./reports/mtb-registered-by-month"
import MTBRejectedSamplesByLab from "./reports/mtb-rejected-samples-by-lab"
import MTBRejectedSamplesByMonth from "./reports/mtb-rejected-samples-by-month"
import MTBRejectedSamplesByLabAndReason from "./reports/mtb-rejected-samples-by-lab-and-reason"
import MTBRejectedSamplesByMonthAndReason from "./reports/mtb-rejected-samples-by-month-and-reason"

export default function LabPage() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
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