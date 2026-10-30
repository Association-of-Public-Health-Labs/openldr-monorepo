"use client";

import { useState } from "react";
import { EidLabReportCard } from "@/components/eid-lab-report-card";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
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
      onRestart={() => setTab(DEFAULT_TAB)}
      extraParams={extraParamsFor(tab)}
      controls={<SegmentedSwitch<TestedTab> items={TABS} value={tab} onChange={setTab} rootClassName="w-full" className="mx-4 ml-auto" />}
      documentation={<Docs />}
    />
  );
}
