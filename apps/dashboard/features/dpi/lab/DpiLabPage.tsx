"use client";

import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { DpiRegisteredSamplesByMonthCard } from "./cards/DpiRegisteredSamplesByMonthCard";
import { DpiRejectedSamplesByLabCard } from "./cards/DpiRejectedSamplesByLabCard";
import { DpiRejectedSamplesByMonthCard } from "./cards/DpiRejectedSamplesByMonthCard";
import { DpiSamplesByEquipmentByMonthCard } from "./cards/DpiSamplesByEquipmentByMonthCard";
import { DpiSamplesByEquipmentCard } from "./cards/DpiSamplesByEquipmentCard";
import { DpiTatByLabCard } from "./cards/DpiTatByLabCard";
import { DpiTatSamplesByMonthCard } from "./cards/DpiTatSamplesByMonthCard";
import { DpiTestedSamplesByLabCard } from "./cards/DpiTestedSamplesByLabCard";
import { DpiTestedSamplesByMonthCard } from "./cards/DpiTestedSamplesByMonthCard";

export function DpiLabPage() {
  return (
    <Box sx={{ display: "grid", gap: { md: 3, xs: 2 }, minWidth: 0, width: "100%" }}>
      <ReportGrid>
        <DpiTestedSamplesByLabCard />
        <DpiTestedSamplesByMonthCard />
      </ReportGrid>

      <ReportGrid>
        <DpiRegisteredSamplesByMonthCard />
        <DpiTatByLabCard />
      </ReportGrid>

      <ReportGrid>
        <DpiTatSamplesByMonthCard />
        <DpiRejectedSamplesByLabCard />
      </ReportGrid>

      <ReportGrid>
        <DpiRejectedSamplesByMonthCard />
        <DpiSamplesByEquipmentCard />
      </ReportGrid>

      <ReportGrid columns={{ xs: "1fr" }}>
        <DpiSamplesByEquipmentByMonthCard />
      </ReportGrid>
    </Box>
  );
}
