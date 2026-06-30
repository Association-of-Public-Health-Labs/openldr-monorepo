"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";

type ReportGridProps = {
  children: ReactNode;
  columns?: {
    lg?: string;
    md?: string;
    sm?: string;
    xl?: string;
    xs?: string;
  };
};

export function ReportGrid({
  children,
  columns = {
    lg: "repeat(2, minmax(0, 1fr))",
    xs: "1fr",
  },
}: ReportGridProps) {
  return (
    <Box
      sx={{
        alignItems: "stretch",
        display: "grid",
        gap: { md: 2.5, xs: 2 },
        gridTemplateColumns: columns,
        minWidth: 0,
      }}
    >
      {children}
    </Box>
  );
}

