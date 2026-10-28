"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { TransportView } from "@repo/design_system/app/organisms/report/transport/transport-view";
import { ReportsButton, ReportsDrawer } from "@repo/design_system/app/organisms/report/transport/reports-drawer";
import { UNRELEASED_PAGES } from "@/lib/eid/nav";
import { EID_PRIMARY } from "@/lib/eid/series";
import { ENDPOINTS, EXTRA_PARAMS, IDS, LABELS, REPORTS, REPORTS_ENDPOINT } from "./constants";
import Docs from "./docs";

export default function TransportPage() {
  // Still being built: not in production builds (the sidebar hides it there too).
  if (process.env.NODE_ENV === "production" && UNRELEASED_PAGES.includes("/transport")) notFound();

  const [reportsOpen, setReportsOpen] = useState(false);

  return (
    <TransportView
      labels={LABELS}
      ids={IDS}
      docs={<Docs />}
      endpoints={ENDPOINTS}
      trendColor={EID_PRIMARY}
      extraParams={EXTRA_PARAMS}
      headerExtra={
        <>
          <ReportsButton onClick={() => setReportsOpen(true)} labels={REPORTS} />
          {/* A portal: nothing of it sits in the header row. */}
          <ReportsDrawer open={reportsOpen} onOpenChange={setReportsOpen} endpoint={REPORTS_ENDPOINT} labels={REPORTS} />
        </>
      }
    />
  );
}
