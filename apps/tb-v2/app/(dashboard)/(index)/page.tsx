"use client"
import { MTBXpertUltra } from "./reports/mtb-xpert-ultra";
import { MTBXpertUltraFacilities } from "./reports/mtb-xpert-ultra-facilities";
import { MainCardSkeleton } from "@repo/design_system/molecules/skeletons/MainCardSkeleton";

export default function DashboardPage() {

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 @container">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBXpertUltra />
          <MTBXpertUltraFacilities />
          <div className="w-full">
            <MainCardSkeleton sx={{ height: "250px"}} />
          </div>  
        </div>
      </div>
    </div>
  );
}