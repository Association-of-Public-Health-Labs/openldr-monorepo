"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { TransportView } from "@repo/design_system/app/organisms/report/transport/transport-view";
import { UNRELEASED_PAGES } from "@/lib/vl/nav";
import { ReportsButton, ReportsDrawer } from "./components/reports-drawer";
import { ENDPOINTS, IDS, LABELS, TREND_COLOR } from "./constants";
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
      trendColor={TREND_COLOR}
      headerExtra={
        <>
          <ReportsButton onClick={() => setReportsOpen(true)} />
          {/* A portal: nothing of it sits in the header row. */}
          <ReportsDrawer open={reportsOpen} onOpenChange={setReportsOpen} />
        </>
      }
    />
  );
}
