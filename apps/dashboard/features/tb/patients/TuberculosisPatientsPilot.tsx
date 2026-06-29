"use client";

import dynamic from "next/dynamic";
import { Alert, Box } from "@mui/material";

const TuberculosisPatientsRuntime = dynamic(
  () => import("./TuberculosisPatientsRuntime").then((module) => module.TuberculosisPatientsRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisPatientsPilot() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        A migração real de Tuberculose - Pacientes requer a configuração de
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY para carregar a pesquisa autenticada de pacientes da dashboard TB.
      </Alert>
    );
  }

  return <TuberculosisPatientsRuntime publishableKey={publishableKey} />;
}
