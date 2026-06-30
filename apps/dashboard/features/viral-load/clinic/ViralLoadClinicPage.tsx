import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { BreastfeedingStatusCard } from "./cards/BreastfeedingStatusCard";
import { PregnancyStatusCard } from "./cards/PregnancyStatusCard";
import { RegisteredSamplesByFacilityCard } from "./cards/RegisteredSamplesByFacilityCard";
import { RejectedSamplesByFacilityCard } from "./cards/RejectedSamplesByFacilityCard";
import { RejectedSamplesByMonthCard } from "./cards/RejectedSamplesByMonthCard";
import { TatByFacilityCard } from "./cards/TatByFacilityCard";
import { TatByMonthCard } from "./cards/TatByMonthCard";
import { TestedSamplesByAgeCard } from "./cards/TestedSamplesByAgeCard";
import { TestedSamplesByFacilityCard } from "./cards/TestedSamplesByFacilityCard";
import { TestedSamplesByGenderCard } from "./cards/TestedSamplesByGenderCard";
import { TestedSamplesByTestReasonCard } from "./cards/TestedSamplesByTestReasonCard";

export function ViralLoadClinicPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { md: 2.5, xs: 2 },
        maxWidth: 1440,
        minWidth: 0,
        mx: "auto",
        pt: { md: 0.5, xs: 0 },
        width: "100%",
      }}
    >
      <ReportGrid>
        <RegisteredSamplesByFacilityCard />
        <TestedSamplesByFacilityCard />
      </ReportGrid>
      <ReportGrid>
        <TatByFacilityCard />
        <RejectedSamplesByFacilityCard />
      </ReportGrid>
      <ReportGrid
        columns={{
          lg: "repeat(3, minmax(0, 1fr))",
          xs: "1fr",
        }}
      >
        <TestedSamplesByGenderCard />
        <TestedSamplesByAgeCard />
        <TestedSamplesByTestReasonCard />
      </ReportGrid>
      <ReportGrid>
        <PregnancyStatusCard />
        <BreastfeedingStatusCard />
      </ReportGrid>
      <ReportGrid>
        <RejectedSamplesByMonthCard />
        <TatByMonthCard />
      </ReportGrid>
    </Box>
  );
}

