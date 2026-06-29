"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const TuberculosisLabRuntime = dynamic(
  () => import("./TuberculosisLabRuntime").then((module) => module.TuberculosisLabRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisLabPilot() {
  return <TuberculosisLabRuntime />;
}
