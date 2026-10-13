"use client";

import { FacilityReportCard } from "@/components/facility-report-card";
import { CARD_ID, ENDPOINT, PATIENT_FILTERS, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByGenderByFacility() {
  return (
    <FacilityReportCard
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      patientFilters={PATIENT_FILTERS}
      chart="combo"
      stacked
      drill
    />
  );
}
