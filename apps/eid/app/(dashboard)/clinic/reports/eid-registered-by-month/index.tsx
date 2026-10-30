"use client";

import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import type { RegisteredByFacilityByMonth } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import Docs from "./docs";

export default function EidRegisteredByMonthFacility() {
  return (
    <FacilityReportCard<RegisteredByFacilityByMonth>
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="combo"
    />
  );
}
