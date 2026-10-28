"use client";

import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { PATIENT_COLUMNS } from "@/lib/eid/patients";
import type { RegisteredByFacility } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, PATIENT_PARAMS, TITLE } from "./constants";
import Docs from "./docs";

export default function EidRegisteredByFacility() {
  return (
    <FacilityReportCard<RegisteredByFacility>
      cardId={CARD_ID}
      title={TITLE}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="combo"
      drill
      patientColumns={PATIENT_COLUMNS}
      patientParams={PATIENT_PARAMS}
    />
  );
}
