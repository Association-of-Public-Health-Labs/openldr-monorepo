"use client"
import KeyIndicatorsReport from "./reports/key-indicators-card";
import { MTBXpertMapReport } from "./reports/mtb-map-card";
import { MTBXpertPieChartReport } from "./reports/mtb-piechart-card";
import { MTBXpertByAge } from "./reports/mtb-xpert-by-age";
import { MTBXpertUltra } from "./reports/mtb-xpert-ultra";
// import { MTBXpertUltraFacilities } from "./reports/mtb-xpert-ultra-facilities";
import OverviewStatusCards from "./reports/overview-status-cards";

export default function DashboardPage() {

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <OverviewStatusCards />
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBXpertPieChartReport /> 
          <MTBXpertMapReport />
          <MTBXpertUltra />
          <MTBXpertByAge />
        </div>
        <KeyIndicatorsReport />
      </div>
    </div>
  );
}