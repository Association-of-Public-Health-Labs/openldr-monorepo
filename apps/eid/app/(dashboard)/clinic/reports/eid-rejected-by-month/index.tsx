"use client";

import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import type { RejectedByFacilityByMonth } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import Docs from "./docs";

export default function EidRejectedByMonthFacility() {
  return (
    <FacilityReportCard<RejectedByFacilityByMonth>
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="stacked"
    />
  );
}
