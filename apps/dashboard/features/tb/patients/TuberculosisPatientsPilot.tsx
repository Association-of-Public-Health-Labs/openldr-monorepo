"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const TuberculosisPatientsRuntime = dynamic(
  () => import("./TuberculosisPatientsRuntime").then((module) => module.TuberculosisPatientsRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisPatientsPilot() {
  return <TuberculosisPatientsRuntime />;
}
