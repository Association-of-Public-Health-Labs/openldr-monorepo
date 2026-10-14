"use client";

import VlTestedByLab from "./reports/vl-tested-by-lab";
import VlTestedByMonth from "./reports/vl-tested-by-month";
import VlTatByLab from "./reports/vl-tat-by-lab";
import VlTatByMonth from "./reports/vl-tat-by-month";
import VlRejectedByLab from "./reports/vl-rejected-by-lab";
import VlRejectedByMonth from "./reports/vl-rejected-by-month";

export default function LabPage() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 @[640px]:grid-cols-2 @[1536px]:gap-8">
        <VlTestedByLab />
        <VlTestedByMonth />
        <VlTatByLab />
        <VlTatByMonth />
        <VlRejectedByLab />
        <VlRejectedByMonth />
      </div>
    </div>
  );
}
