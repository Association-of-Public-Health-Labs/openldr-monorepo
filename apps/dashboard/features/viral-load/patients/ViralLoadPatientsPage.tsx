"use client";

import { Box } from "@mui/material";
import { ViralLoadPatientSearchCard } from "./components/ViralLoadPatientSearchCard";

export function ViralLoadPatientsPage() {
  return (
    <Box sx={{ mx: "auto", maxWidth: 1400, width: "100%" }}>
      <ViralLoadPatientSearchCard />
    </Box>
  );
}
