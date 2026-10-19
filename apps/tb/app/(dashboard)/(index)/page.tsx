"use client"
import KeyIndicatorsReport from "./reports/key-indicators-card";
import { MTBXpertMapReport } from "./reports/mtb-map-card";
import { MTBXpertPieChartReport } from "./reports/mtb-piechart-card";
import { MTBXpertByAge } from "./reports/mtb-xpert-by-age";
import { MTBXpertBySpecimenType } from "./reports/mtb-xpert-by-specimen-type";
import { MTBXpertUltra } from "./reports/mtb-xpert-ultra";
import MTBRejectedSamplesByMonthAndReason from "./reports/mtb-rejected-samples-by-month-and-reason";

import OverviewStatusCards from "./reports/overview-status-cards";

export default function DashboardPage() {

  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <OverviewStatusCards />
        <div className="grid grid-cols-1 @[840px]:grid-cols-2 gap-6">
          <MTBXpertPieChartReport />
          <MTBXpertMapReport />
          <MTBXpertUltra />
          <MTBXpertByAge />
          <MTBXpertBySpecimenType />
          <MTBRejectedSamplesByMonthAndReason />
        </div>
        <KeyIndicatorsReport />
      </div>
    </div>
  );
}