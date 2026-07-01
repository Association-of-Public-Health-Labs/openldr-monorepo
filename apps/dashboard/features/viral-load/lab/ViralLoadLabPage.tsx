import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { RejectedSamplesByLabCard } from "./cards/RejectedSamplesByLabCard";
import { RejectedSamplesByMonthCard } from "./cards/RejectedSamplesByMonthCard";
import { TatByLabCard } from "./cards/TatByLabCard";
import { TatByMonthCard } from "./cards/TatByMonthCard";
import { TestedSamplesByLabCard } from "./cards/TestedSamplesByLabCard";
import { TestedSamplesByMonthCard } from "./cards/TestedSamplesByMonthCard";
import { TestReasonsByLabCard } from "./cards/TestReasonsByLabCard";

export function ViralLoadLabPage() {
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
        <TestedSamplesByLabCard />
        <TestedSamplesByMonthCard />
      </ReportGrid>
      <ReportGrid>
        <TatByLabCard />
        <TatByMonthCard />
      </ReportGrid>
      <ReportGrid>
        <RejectedSamplesByLabCard />
        <RejectedSamplesByMonthCard />
      </ReportGrid>
      <ReportGrid
        columns={{
          lg: "minmax(0, 1fr)",
          xs: "1fr",
        }}
      >
        <TestReasonsByLabCard />
      </ReportGrid>
    </Box>
  );
}

