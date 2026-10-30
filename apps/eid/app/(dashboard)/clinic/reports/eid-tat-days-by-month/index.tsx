"use client";

import { useState } from "react";
import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { TatSegmentSelect } from "@/components/tat-segment-select";
import { categoryParams, DEFAULT_CATEGORY, segmentTitle } from "@/lib/eid/tat-segment";
import type { TatDaysByFacilityByMonth } from "@/lib/eid/types";
import { toChart, toExcel } from "./actions";
import { CARD_ID, ENDPOINT, TITLE } from "./constants";
import Docs from "./docs";

export default function EidTatDaysByMonth() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  return (
    <FacilityReportCard<TatDaysByFacilityByMonth>
      cardId={CARD_ID}
      title={segmentTitle(TITLE, category)}
      endpoint={ENDPOINT}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
      chart="stacked"
      extraParams={categoryParams(category)}
      onRestart={() => setCategory(DEFAULT_CATEGORY)}
      controls={<TatSegmentSelect value={category} onChange={setCategory} />}
    />
  );
}
