"use client";

import { useState } from "react";
import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { TatSegmentSelect } from "@/components/tat-segment-select";
import { fetchData, extraParamsFor, titleFor, toChart, toExcel } from "./actions";
import { CARD_ID, DEFAULT_CATEGORY } from "./constants";
import Docs from "./docs";

export default function EidTrlByLab() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  return (
    <EidLabReportCard
      labKind="conventional"
      cardId={CARD_ID}
      title={titleFor(category)}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      extraParams={extraParamsFor(category)}
      onRestart={() => setCategory(DEFAULT_CATEGORY)}
      controls={<TatSegmentSelect value={category} onChange={setCategory} />}
      documentation={<Docs />}
    />
  );
}
