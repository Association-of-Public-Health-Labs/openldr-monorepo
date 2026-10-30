"use client";

import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { fetchData, toChart, toExcel } from "./actions";
import { CARD_ID, TITLE } from "./constants";
import Docs from "./docs";

export default function EidRegisteredByMonth() {
  return <EidLabReportCard labKind="all" cardId={CARD_ID} title={TITLE} fetchData={fetchData} toChart={toChart} toExcel={toExcel} documentation={<Docs />} />;
}
