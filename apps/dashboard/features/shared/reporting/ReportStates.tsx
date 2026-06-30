"use client";

import type { ReactNode } from "react";
import { Alert, Box, Skeleton, Typography } from "@mui/material";

export function ReportEmptyState({
  children = "Sem dados disponíveis para o período selecionado.",
  minHeight = 260,
}: {
  children?: ReactNode;
  minHeight?: number;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        color: "text.secondary",
        display: "flex",
        justifyContent: "center",
        minHeight,
        textAlign: "center",
      }}
    >
      <Typography fontSize={14} fontWeight={700}>
        {children}
      </Typography>
    </Box>
  );
}

export function ReportErrorState({ children }: { children: ReactNode }) {
  return (
    <Alert severity="warning" sx={{ borderRadius: 3 }}>
      {children}
    </Alert>
  );
}

export function ReportLoadingState({ minHeight = 260 }: { minHeight?: number }) {
  return (
    <Box sx={{ display: "grid", gap: 1.5, minHeight, py: 1 }}>
      <Skeleton height={28} variant="rounded" width="34%" />
      <Skeleton height={minHeight - 78} variant="rounded" width="100%" />
      <Skeleton height={18} variant="rounded" width="58%" />
    </Box>
  );
}

