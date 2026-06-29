"use client";

import dynamic from "next/dynamic";
import { Alert, Box } from "@mui/material";

const TuberculosisClinicRuntime = dynamic(
  () => import("./TuberculosisClinicRuntime").then((module) => module.TuberculosisClinicRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisClinicPilot() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        A migração real de Tuberculose - Província / Distrito / US requer a configuração de
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para carregar os cards autenticados da dashboard TB.
      </Alert>
    );
  }

  return <TuberculosisClinicRuntime publishableKey={publishableKey} />;
}
