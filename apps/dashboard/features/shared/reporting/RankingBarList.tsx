"use client";

import { Alert, Box, ButtonBase, Skeleton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ReportEmptyState } from "./ReportStates";

export type RankingBarLevel = "district" | "facility" | "province";

export type RankingBarItem = {
  key: string;
  label: string;
  level?: RankingBarLevel;
  parentKey?: string;
  percentage?: number;
  value: number;
};

type RankingBarListProps = {
  colorVariant?: "error" | "info" | "primary" | "secondary" | "success" | "warning";
  emptyLabel?: string;
  error?: string | null;
  height?: number;
  items: RankingBarItem[];
  loading?: boolean;
  maxVisibleItems?: number;
  onItemClick?: (item: RankingBarItem) => void;
  valueFormatter?: (value: number) => string;
};

export function RankingBarList({
  colorVariant = "success",
  emptyLabel = "Sem dados disponíveis para o período selecionado.",
  error,
  height = 292,
  items,
  loading,
  maxVisibleItems = 8,
  onItemClick,
  valueFormatter = formatNumber,
}: RankingBarListProps) {
  const theme = useTheme();
  const hasOverflow = items.length > maxVisibleItems;
  const maxValue = Math.max(...items.map((item) => item.value), 0);
  const barColor = theme.palette[colorVariant].main;

  if (loading) {
    return (
      <Box sx={{ display: "grid", gap: 1.4, minHeight: Math.min(height, 260), py: 0.5 }}>
        {Array.from({ length: Math.min(maxVisibleItems, 5) }).map((_, index) => (
          <Box key={index} sx={{ display: "grid", gap: 0.65 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Skeleton height={18} variant="rounded" width="42%" />
              <Skeleton height={18} variant="rounded" width={68} />
            </Box>
            <Skeleton height={8} variant="rounded" width="100%" />
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  }

  if (!items.length) {
    return <ReportEmptyState minHeight={Math.min(height, 260)}>{emptyLabel}</ReportEmptyState>;
  }

  return (
    <Box
      sx={{
        maxHeight: hasOverflow ? height : "none",
        minHeight: 0,
        minWidth: 0,
        overflowX: "hidden",
        overflowY: hasOverflow ? "auto" : "visible",
        pb: hasOverflow ? 1 : 0,
        pr: hasOverflow ? 0.75 : 0,
        scrollbarColor: "rgba(120, 120, 120, 0.45) transparent",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          width: 7,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(120, 120, 120, 0.38)",
          borderRadius: 999,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      }}
    >
      <Box sx={{ display: "grid", gap: 1.15, minWidth: 0, pb: 0.5 }}>
        {items.map((item) => {
          const percentWidth = item.percentage ?? (maxValue ? Math.min((item.value / maxValue) * 100, 100) : 0);
          const row = (
            <Box
              sx={{
                borderRadius: 1.25,
                minWidth: 0,
                p: onItemClick ? 0.75 : 0,
                transition: "background-color 120ms ease",
                width: "100%",
                ...(onItemClick
                  ? {
                      "&:hover": {
                        bgcolor: alpha(barColor, theme.palette.mode === "dark" ? 0.1 : 0.07),
                      },
                    }
                  : null),
              }}
            >
              <Box sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between", mb: 0.42, minWidth: 0 }}>
                <Typography
                  fontSize={13}
                  fontWeight={800}
                  title={item.label}
                  sx={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography color="text.secondary" fontSize={12} fontWeight={800} sx={{ flex: "0 0 auto" }}>
                  {valueFormatter(item.value)}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: alpha(barColor, theme.palette.mode === "dark" ? 0.15 : 0.1),
                  borderRadius: 999,
                  height: 7.5,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    bgcolor: barColor,
                    borderRadius: 999,
                    height: "100%",
                    minWidth: percentWidth > 0 ? 5 : 0,
                    width: `${percentWidth}%`,
                  }}
                />
              </Box>
            </Box>
          );

          return onItemClick ? (
            <ButtonBase
              key={item.key}
              onClick={() => onItemClick(item)}
              sx={{
                borderRadius: 1.25,
                cursor: "pointer",
                display: "block",
                minWidth: 0,
                textAlign: "left",
                width: "100%",
              }}
            >
              {row}
            </ButtonBase>
          ) : (
            <Box key={item.key}>{row}</Box>
          );
        })}
      </Box>
    </Box>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}

