import { Box } from "@mui/material";
import { ReportGrid } from "../../shared/reporting";
import { ViralLoadOverviewCards } from "./cards/ViralLoadOverviewCards";
import { ViralLoadSamplesHistoryCard } from "./cards/ViralLoadSamplesHistoryCard";
import { ViralLoadTatByMonthCard } from "./cards/ViralLoadTatByMonthCard";
import { ViralSuppressionMapCard } from "./cards/ViralSuppressionMapCard";
import { ViralSuppressionTrendCard } from "./cards/ViralSuppressionTrendCard";

export function ViralLoadSummaryPage() {
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
      <ViralLoadOverviewCards />
      <ReportGrid
        columns={{
          lg: "minmax(0, 2fr) minmax(340px, 1fr)",
          xs: "1fr",
        }}
      >
        <ViralSuppressionTrendCard />
        <ViralSuppressionMapCard />
      </ReportGrid>
      <ReportGrid>
        <ViralLoadTatByMonthCard />
        <ViralLoadSamplesHistoryCard />
      </ReportGrid>
    </Box>
  );
}
