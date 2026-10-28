"use client";

import { useState } from "react";
import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { LineTabs } from "@repo/design_system/app/molecules/tabs/LineTabs";
import { extraParamsFor, fetchData, titleSuffixFor, toChart, toExcel } from "./actions";
import { CARD_ID, DEFAULT_TAB, TABS, TITLE, type TestedTab } from "./constants";
import Docs from "./docs";

export default function EidTestedByMonth() {
  const [tab, setTab] = useState<TestedTab>(DEFAULT_TAB);
  return (
    <EidLabReportCard
      labKind="all"
      cardId={CARD_ID}
      title={TITLE}
      titleSuffix={titleSuffixFor(tab)}
      fetchData={fetchData}
      toChart={toChart}
      toExcel={toExcel}
      extraParams={extraParamsFor(tab)}
      controls={<LineTabs<TestedTab> items={TABS} value={tab} onChange={setTab} className="-mx-4 mb-5" />}
      documentation={<Docs />}
    />
  );
}
