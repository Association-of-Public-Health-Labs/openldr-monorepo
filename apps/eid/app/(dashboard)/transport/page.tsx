"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { TransportView } from "@repo/design_system/app/organisms/report/transport/transport-view";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
import { UNRELEASED_PAGES } from "@/lib/eid/nav";
import { EID_PRIMARY } from "@/lib/eid/series";
import { ENDPOINTS, IDS, LABELS, TYPE_TABS, typeParams, type TypeTab } from "./constants";
import Docs from "./docs";

export default function TransportPage() {
  // Still being built: not in production builds (the sidebar hides it there too).
  if (process.env.NODE_ENV === "production" && UNRELEASED_PAGES.includes("/transport")) notFound();

  const [tab, setTab] = useState<TypeTab>("all");
  const extraParams = useMemo(() => typeParams(tab), [tab]);

  return (
    <TransportView
      labels={LABELS}
      ids={IDS}
      docs={<Docs />}
      endpoints={ENDPOINTS}
      trendColor={EID_PRIMARY}
      extraParams={extraParams}
      headerExtra={<SegmentedSwitch<TypeTab> items={TYPE_TABS} value={tab} onChange={setTab} />}
    />
  );
}
