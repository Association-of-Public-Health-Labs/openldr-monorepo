import { Box } from "@mui/material";
import type { ReactNode } from "react";

type ReportGridProps = {
  children: ReactNode;
};

export function ReportGrid({ children }: ReportGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
        },
        gap: { xs: 2, md: 3 },
      }}
    >
      {children}
    </Box>
  );
}
