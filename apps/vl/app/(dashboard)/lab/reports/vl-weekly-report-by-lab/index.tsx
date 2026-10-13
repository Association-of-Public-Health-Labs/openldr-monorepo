"use client";

import { LabReportCard } from "@/components/lab-report-card";
import { legacyWeek } from "@/lib/vl/dates";
import { fetchData, toChart, toExcel } from "./actions";
import { CARD_ID, TITLE } from "./constants";
import Docs from "./docs";

export default function VlWeeklyReportByLab() {
  return (
    <LabReportCard
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      chart="combo" yTitles={["Amostras", "TRL (dias)"]} initialRange={legacyWeek}
      documentation={<Docs />}
    />
  );
}
