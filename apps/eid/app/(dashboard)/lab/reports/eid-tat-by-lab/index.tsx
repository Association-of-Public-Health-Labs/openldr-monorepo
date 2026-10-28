"use client";

import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { codeOf, fetchData, labelOf, toChart, toExcel } from "./actions";
import { CARD_ID, DRILL_START, TITLE } from "./constants";
import Docs from "./docs";

export default function EidTatByLab() {
  return (
    <EidLabReportCard
      labKind="conventional"
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      drill={{ start: DRILL_START, codeOf, labelOf }}
      documentation={<Docs />}
    />
  );
}
