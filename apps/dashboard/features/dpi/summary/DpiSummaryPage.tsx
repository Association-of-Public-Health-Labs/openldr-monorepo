"use client";

import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { DpiIndicatorsByProvinceCard } from "./cards/DpiIndicatorsByProvinceCard";
import { DpiOverviewCards } from "./cards/DpiOverviewCards";
import { DpiPositivityByMonthCard } from "./cards/DpiPositivityByMonthCard";
import { DpiRejectedSamplesByMonthCard } from "./cards/DpiRejectedSamplesByMonthCard";
import { DpiSampleIndicatorsTableCard } from "./cards/DpiSampleIndicatorsTableCard";
import { DpiSamplesByEquipmentCard } from "./cards/DpiSamplesByEquipmentCard";
import { DpiTatByMonthCard } from "./cards/DpiTatByMonthCard";
import { DpiTatSamplesCategoryCard } from "./cards/DpiTatSamplesCategoryCard";

export function DpiSummaryPage() {
  return (
    <Box sx={{ display: "grid", gap: { md: 3, xs: 2 }, minWidth: 0, width: "100%" }}>
      <DpiOverviewCards />

      <ReportGrid>
        <DpiPositivityByMonthCard />
        <DpiIndicatorsByProvinceCard />
      </ReportGrid>

      <ReportGrid>
        <DpiTatByMonthCard />
        <DpiTatSamplesCategoryCard />
      </ReportGrid>

      <ReportGrid>
        <DpiRejectedSamplesByMonthCard />
        <DpiSamplesByEquipmentCard />
      </ReportGrid>

      <ReportGrid columns={{ xs: "1fr" }}>
        <DpiSampleIndicatorsTableCard />
      </ReportGrid>
    </Box>
  );
}
