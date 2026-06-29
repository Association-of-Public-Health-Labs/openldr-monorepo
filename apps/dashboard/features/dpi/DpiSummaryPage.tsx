"use client";

import { Box } from "@mui/material";
import {
  DpiEquipmentMonthlyCard,
  DpiMainIndicatorsCard,
  DpiPositivityCard,
  DpiProvinceIndicatorsCard,
  DpiRejectedSamplesCard,
  DpiSamplesByMonthCard,
  DpiSamplesPositivityCard,
  DpiTatCard,
  DpiTatSamplesCard,
} from "./cards/DpiSummaryCards";

export function DpiSummaryPage() {
  return (
    <Box className="w-full @container">
      <Box className="grid grid-cols-1 gap-3 sm:gap-4 @[1536px]:gap-8">
        <DpiMainIndicatorsCard />
        <Box className="grid grid-cols-1 @[640px]:grid-cols-2 gap-3 sm:gap-4 @[1536px]:gap-8">
          <DpiSamplesByMonthCard />
          <DpiPositivityCard />
          <DpiSamplesPositivityCard />
          <DpiProvinceIndicatorsCard />
          <DpiTatCard />
          <DpiTatSamplesCard />
          <DpiRejectedSamplesCard />
          <DpiEquipmentMonthlyCard />
        </Box>
      </Box>
    </Box>
  );
}
