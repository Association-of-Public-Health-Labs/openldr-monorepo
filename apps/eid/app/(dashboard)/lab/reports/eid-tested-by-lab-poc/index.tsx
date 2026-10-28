"use client";

import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { codeOf, fetchData, labelOf, toChart, toExcel } from "./actions";
import { CARD_ID, DRILL_START, EXTRA_PARAMS, TITLE } from "./constants";
import Docs from "./docs";

export default function EidTestedByLabPoc() {
  return (
    <EidLabReportCard
      labKind="poc"
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      extraParams={EXTRA_PARAMS}
      drill={{ start: DRILL_START, codeOf, labelOf }}
      documentation={<Docs />}
    />
  );
}
