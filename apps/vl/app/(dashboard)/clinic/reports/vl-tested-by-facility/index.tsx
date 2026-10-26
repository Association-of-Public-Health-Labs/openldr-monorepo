"use client";

import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { PATIENT_COLUMNS, patientFilterParams } from "@/lib/vl/patients";
import { CARD_ID, ENDPOINT, PATIENT_FILTERS, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByFacility() {
  return (
    <FacilityReportCard
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      patientParams={patientFilterParams(PATIENT_FILTERS)}
      patientColumns={PATIENT_COLUMNS}
      drill
    />
  );
}
