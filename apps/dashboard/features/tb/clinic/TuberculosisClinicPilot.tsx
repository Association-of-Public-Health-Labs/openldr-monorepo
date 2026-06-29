"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const TuberculosisClinicRuntime = dynamic(
  () => import("./TuberculosisClinicRuntime").then((module) => module.TuberculosisClinicRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisClinicPilot() {
  return <TuberculosisClinicRuntime />;
}
