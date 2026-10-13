"use client";

import { FacilityReportCard } from "@/components/facility-report-card";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlRejectedByFacilityMonth() {
  return (
    <FacilityReportCard
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
    />
  );
}
