"use client";

import dynamic from "next/dynamic";
import { Alert, Box } from "@mui/material";

const TuberculosisLabRuntime = dynamic(
  () => import("./TuberculosisLabRuntime").then((module) => module.TuberculosisLabRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisLabPilot() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        A migração real de Tuberculose - Laboratório requer a configuração de
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para carregar os cards autenticados da dashboard TB.
      </Alert>
    );
  }

  return <TuberculosisLabRuntime publishableKey={publishableKey} />;
}
