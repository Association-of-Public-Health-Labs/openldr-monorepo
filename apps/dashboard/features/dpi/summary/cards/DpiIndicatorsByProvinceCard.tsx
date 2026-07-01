"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  MonthlyChartLegend,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
  getReportColor,
} from "../../../shared/reporting";
import { fetchDpiIndicatorsByProvince } from "../../api/summary";
import type { DpiDateInterval, DpiProvinceIndicator } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

export function DpiIndicatorsByProvinceCard() {
  const theme = useTheme();
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiIndicatorsByProvince({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiProvinceIndicator[]>(
    loader,
    "Não foi possível carregar os indicadores por província.",
  );
  const rows = [...(data ?? [])].sort((a, b) => b.total - a.total);

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Amostras por Província"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              maxHeight: REPORT_CONTENT_HEIGHTS.medium - 34,
              minHeight: 0,
              overflowY: rows.length > 7 ? "auto" : "visible",
              pr: rows.length > 7 ? 0.75 : 0,
              scrollbarColor: "rgba(120, 120, 120, 0.45) transparent",
              scrollbarWidth: "thin",
            }}
          >
            {rows.map((row) => {
              const total = row.total || row.conventional + row.poc || row.tested;
              const conventionalWidth = total ? (row.conventional / total) * 100 : 0;
              const pocWidth = total ? (row.poc / total) * 100 : 0;

              return (
                <Box
                  key={row.province}
                  sx={{
                    borderRadius: 1.25,
                    p: 0.75,
                    transition: "background-color 160ms ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.055),
                    },
                  }}
                >
                  <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", gap: 1, mb: 0.55 }}>
                    <Typography fontSize={13} fontWeight={850} noWrap title={row.province}>
                      {row.province}
                    </Typography>
                    <Typography color="text.secondary" fontSize={12} fontWeight={800} sx={{ flex: "0 0 auto" }}>
                      {formatNumber(total)}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "action.hover", borderRadius: 999, display: "flex", height: 10, overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "primary.main", width: `${conventionalWidth}%`, minWidth: row.conventional ? 4 : 0 }} />
                    <Box sx={{ bgcolor: "success.main", width: `${pocWidth}%`, minWidth: row.poc ? 4 : 0 }} />
                  </Box>
                  <Typography color="text.secondary" fontSize={11.5} fontWeight={700} sx={{ mt: 0.45 }}>
                    Convencional {formatNumber(row.conventional)} · POC {formatNumber(row.poc)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <MonthlyChartLegend
            items={[
              { color: getReportColor(theme, "primary"), label: "Convencional" },
              { color: getReportColor(theme, "success"), label: "POC" },
            ]}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}
