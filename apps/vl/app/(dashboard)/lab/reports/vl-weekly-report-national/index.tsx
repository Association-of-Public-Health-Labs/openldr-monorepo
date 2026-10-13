"use client";

import { LabReportCard } from "@/components/lab-report-card";
import { lastTwelveWeeks } from "@/lib/vl/dates";
import { fetchData, toChart, toExcel } from "./actions";
import { CARD_ID, TITLE } from "./constants";
import Docs from "./docs";

export default function VlWeeklyReportNational() {
  return (
    <LabReportCard
      cardId={CARD_ID}
      title={TITLE}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      chart="combo" yTitles={["Amostras", "TRL (dias)"]} initialRange={lastTwelveWeeks}
      documentation={<Docs />}
    />
  );
}
