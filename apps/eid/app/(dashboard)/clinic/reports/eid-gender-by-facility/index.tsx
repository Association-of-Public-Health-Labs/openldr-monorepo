"use client";

import { useState } from "react";
import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
import { DEFAULT_GENDER_TAB, GENDER_TABS, genderExtraParams, genderPatientParams, genderTitle, type GenderTab } from "@/lib/eid/gender-tabs";
import { PATIENT_COLUMNS } from "@/lib/eid/patients";
import type { GenderByFacility } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import Docs from "./docs";

export default function EidGenderByFacility() {
  const [tab, setTab] = useState<GenderTab>(DEFAULT_GENDER_TAB);
  return (
    <FacilityReportCard<GenderByFacility>
      cardId={CARD_ID}
      title={genderTitle(TITLE, tab)}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="combo"
      stacked
      drill
      patientColumns={PATIENT_COLUMNS}
      patientParams={genderPatientParams(tab)}
      extraParams={genderExtraParams(tab)}
      onRestart={() => setTab(DEFAULT_GENDER_TAB)}
      controls={<SegmentedSwitch<GenderTab> items={GENDER_TABS} value={tab} onChange={setTab} rootClassName="w-full" className="mx-4 ml-auto" />}
    />
  );
}
