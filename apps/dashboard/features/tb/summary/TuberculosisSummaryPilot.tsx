"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const TuberculosisSummaryRuntime = dynamic(
  () => import("./TuberculosisSummaryRuntime").then((module) => module.TuberculosisSummaryRuntime),
  {
    ssr: false,
    loading: () => <Box sx={{ minHeight: 240 }} />,
  },
);

export function TuberculosisSummaryPilot() {
  return <TuberculosisSummaryRuntime />;
}
