"use client";

import { useState } from "react";
import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { LineTabs } from "@repo/design_system/app/molecules/tabs/LineTabs";
import { DEFAULT_GENDER_TAB, GENDER_TABS, genderExtraParams, genderTitle, type GenderTab } from "@/lib/eid/gender-tabs";
import type { GenderByFacilityByMonth } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import Docs from "./docs";

export default function EidGenderByMonth() {
  const [tab, setTab] = useState<GenderTab>(DEFAULT_GENDER_TAB);
  return (
    <FacilityReportCard<GenderByFacilityByMonth>
      cardId={CARD_ID}
      title={genderTitle(TITLE, tab)}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="combo"
      stacked
      extraParams={genderExtraParams(tab)}
      onRestart={() => setTab(DEFAULT_GENDER_TAB)}
      controls={<LineTabs<GenderTab> items={GENDER_TABS} value={tab} onChange={setTab} className="-mx-4 mb-5" />}
    />
  );
}
