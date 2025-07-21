"use client"

import MTBRegisteredByFacility from "./reports/mtb-registered-by-facility";

export default function DashboardPage() {

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBRegisteredByFacility />
        </div>
      </div>
    </div>
  );
}