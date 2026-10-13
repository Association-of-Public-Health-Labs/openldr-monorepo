"use client";

import { FacilityReportCard } from "@/components/facility-report-card";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByGenderByMonth() {
  return (
    <FacilityReportCard
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="combo"
      stacked
    />
  );
}
