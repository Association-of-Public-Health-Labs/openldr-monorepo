"use client";

import dynamic from "next/dynamic";
import { Alert, Box } from "@mui/material";

const TuberculosisSummaryRuntime = dynamic(
  () => import("./TuberculosisSummaryRuntime").then((module) => module.TuberculosisSummaryRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisSummaryPilot() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        O piloto real de Tuberculose requer a configuração de NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para carregar os
        cards autenticados da dashboard TB.
      </Alert>
    );
  }

  return <TuberculosisSummaryRuntime publishableKey={publishableKey} />;
}
