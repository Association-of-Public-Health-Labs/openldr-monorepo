"use client";

import { Alert, Box, ButtonBase, LinearProgress, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { GeoDrillDownRow } from "./types";

type GeoDrillDownRankingProps = {
  emptyLabel?: string;
  error?: string | null;
  loading?: boolean;
  onRowClick?: (row: GeoDrillDownRow) => void;
  rows: GeoDrillDownRow[];
  valueFormatter?: (value: number, row: GeoDrillDownRow) => string;
};

export function GeoDrillDownRanking({
  emptyLabel = "Sem dados disponíveis para este detalhe.",
  error,
  loading,
  onRowClick,
  rows,
  valueFormatter = formatNumber,
}: GeoDrillDownRankingProps) {
  const theme = useTheme();
  const maxValue = Math.max(...rows.map((row) => row.value), 0);

  if (loading) return <LinearProgress aria-label="A carregar detalhe" />;
  if (error) return <Alert severity="warning">{error}</Alert>;
  if (!rows.length) {
    return (
      <Box sx={{ alignItems: "center", display: "flex", minHeight: 160, justifyContent: "center", textAlign: "center" }}>
        <Typography color="text.secondary" fontSize={13} fontWeight={800}>
          {emptyLabel}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {rows.map((row) => {
        const percentage = row.percentage ?? (maxValue ? (row.value / maxValue) * 100 : 0);
        const content = (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.25,
              p: 1.2,
              transition: "background-color 160ms ease, border-color 160ms ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.055),
                borderColor: alpha(theme.palette.primary.main, 0.28),
              },
            }}
          >
            <Box sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between" }}>
              <Typography fontSize={13.5} fontWeight={850} noWrap title={row.label}>
                {row.label}
              </Typography>
              <Typography color="text.secondary" fontSize={12.5} fontWeight={850}>
                {valueFormatter(row.value, row)}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "action.hover", borderRadius: 999, height: 8, mt: 0.9, overflow: "hidden" }}>
              <Box sx={{ bgcolor: "primary.main", height: "100%", minWidth: row.value ? 4 : 0, width: `${Math.min(percentage, 100)}%` }} />
            </Box>
          </Box>
        );

        return onRowClick ? (
          <ButtonBase
            aria-label={`Abrir detalhe de ${row.label}`}
            key={row.id}
            onClick={() => onRowClick(row)}
            sx={{
              borderRadius: 1.25,
              display: "block",
              textAlign: "left",
              width: "100%",
              "&.Mui-focusVisible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            {content}
          </ButtonBase>
        ) : (
          <Box key={row.id}>{content}</Box>
        );
      })}
    </Box>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 1 }).format(value);
}

