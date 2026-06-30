"use client";

import type { ReactNode } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type SummaryMetricCardProps = {
  color: "error" | "info" | "primary" | "secondary" | "success" | "warning";
  icon: ReactNode;
  label: string;
  loading?: boolean;
  periodLabel?: string;
  suffix?: string;
  value: number | string;
};

export function SummaryMetricCard({
  color,
  icon,
  label,
  loading,
  periodLabel,
  suffix = "",
  value,
}: SummaryMetricCardProps) {
  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === "dark" ? 0.16 : 0.09),
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        boxShadow: 0.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: { sm: 126, xs: 118 },
        minWidth: 0,
        p: { sm: 2.35, xs: 2 },
      }}
    >
      <Box
        sx={{
          alignItems: "flex-start",
          color: `${color}.main`,
          display: "flex",
          gap: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === "dark" ? 0.18 : 0.12),
            borderRadius: 2,
            display: "flex",
            flex: "0 0 auto",
            height: 32,
            justifyContent: "center",
            width: 32,
          }}
        >
          {icon}
        </Box>
        <Typography
          color="text.secondary"
          fontSize={11}
          fontWeight={800}
          sx={{
            lineHeight: 1.2,
            maxWidth: "70%",
            overflow: "hidden",
            textAlign: "right",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? <Skeleton component="span" width={96} /> : periodLabel}
        </Typography>
      </Box>
      <Box sx={{ mt: 1.6, minWidth: 0 }}>
        <Typography color="text.primary" fontSize={12.5} fontWeight={800} sx={{ lineHeight: 1.25 }}>
          {label}
        </Typography>
        <Typography
          color={`${color}.main`}
          fontSize={{ sm: 27, xs: 24 }}
          fontWeight={900}
          sx={{ letterSpacing: 0, lineHeight: 1.12, mt: 0.65, overflowWrap: "anywhere" }}
        >
          {loading ? <Skeleton component="span" width={92} /> : `${value}${suffix}`}
        </Typography>
      </Box>
    </Box>
  );
}

