"use client"
import KeyIndicatorsReport from "./reports/key-indicators-card";
import { MTBXpertUltra } from "./reports/mtb-xpert-ultra";
import { MTBXpertUltraFacilities } from "./reports/mtb-xpert-ultra-facilities"; 
import OverviewStatusCards from "./reports/overview-status-cards";

export default function DashboardPage() {

  return (
    <div className="w-full">
      {/* <h1 className="text-2xl font-bold">Dashboard</h1> */}
      <div className="grid grid-cols-1 @container gap-8">
        <OverviewStatusCards />
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBXpertUltra />
          <MTBXpertUltraFacilities />
        </div>
        <KeyIndicatorsReport />
      </div>
    </div>
  );
}