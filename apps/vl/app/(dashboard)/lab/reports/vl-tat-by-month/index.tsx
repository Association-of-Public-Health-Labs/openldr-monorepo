"use client";

import { VlLabReportCard as LabReportCard } from "@/components/vl-lab-report-card";
import { fetchData, toChart, toExcel } from "./actions";
import { CARD_ID, TITLE } from "./constants";
import Docs from "./docs";

export default function VlTatByMonth() {
  return (
    <LabReportCard
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      documentation={<Docs />}
    />
  );
}
