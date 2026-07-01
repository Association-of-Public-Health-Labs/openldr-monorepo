"use client";

import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { DpiKeyIndicatorsByLocationCard } from "./cards/DpiKeyIndicatorsByLocationCard";
import { DpiMonthlyLocationIndicatorsCard } from "./cards/DpiMonthlyLocationIndicatorsCard";
import { DpiRegisteredSamplesByLocationCard } from "./cards/DpiRegisteredSamplesByLocationCard";
import { DpiRejectedSamplesByLocationCard } from "./cards/DpiRejectedSamplesByLocationCard";
import { DpiSamplesByAgeCard } from "./cards/DpiSamplesByAgeCard";
import { DpiSamplesByGenderCard } from "./cards/DpiSamplesByGenderCard";
import { DpiTatByLocationCard } from "./cards/DpiTatByLocationCard";
import { DpiTestedSamplesByLocationCard } from "./cards/DpiTestedSamplesByLocationCard";

export function DpiClinicPage() {
  return (
    <Box sx={{ display: "grid", gap: { md: 3, xs: 2 }, minWidth: 0, width: "100%" }}>
      <ReportGrid>
        <DpiRegisteredSamplesByLocationCard />
        <DpiTestedSamplesByLocationCard />
      </ReportGrid>

      <ReportGrid>
        <DpiTatByLocationCard />
        <DpiRejectedSamplesByLocationCard />
      </ReportGrid>

      <ReportGrid>
        <DpiSamplesByGenderCard />
        <DpiSamplesByAgeCard />
      </ReportGrid>

      <ReportGrid columns={{ xs: "1fr" }}>
        <DpiKeyIndicatorsByLocationCard />
      </ReportGrid>

      <ReportGrid columns={{ xs: "1fr" }}>
        <DpiMonthlyLocationIndicatorsCard />
      </ReportGrid>
    </Box>
  );
}
