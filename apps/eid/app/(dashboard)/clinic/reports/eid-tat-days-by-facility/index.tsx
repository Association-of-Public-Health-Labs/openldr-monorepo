"use client";

import { useState } from "react";
import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { TatSegmentSelect } from "@/components/tat-segment-select";
import { PATIENT_COLUMNS } from "@/lib/eid/patients";
import { categoryParams, DEFAULT_CATEGORY, segmentTitle } from "@/lib/eid/tat-segment";
import type { TatDaysByFacility } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, PATIENT_PARAMS, TITLE } from "./constants";
import Docs from "./docs";

export default function EidTatDaysByFacility() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  return (
    <FacilityReportCard<TatDaysByFacility>
      cardId={CARD_ID}
      title={segmentTitle(TITLE, category)}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="stacked"
      drill
      patientColumns={PATIENT_COLUMNS}
      patientParams={PATIENT_PARAMS}
      extraParams={categoryParams(category)}
      onRestart={() => setCategory(DEFAULT_CATEGORY)}
      controls={<TatSegmentSelect value={category} onChange={setCategory} />}
    />
  );
}
