"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
  getReportColor,
} from "../../../shared/reporting";
import { fetchDpiMonthlyTat } from "../../api/summary";
import type { DpiDateInterval, DpiTatMonthlyPoint } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

const segmentVariants = ["success", "info", "warning", "secondary", "primary", "error"] as const;

export function DpiTatByMonthCard() {
  const theme = useTheme();
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiMonthlyTat({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiTatMonthlyPoint[]>(
    loader,
    "Não foi possível carregar o tempo de resposta por mês.",
  );
  const rows = data ?? [];
  const average = rows.length ? rows.reduce((sum, row) => sum + row.averageTat, 0) / rows.length : 0;
  const legendSegments = rows[0]?.segments ?? [];

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Tempo de Resposta por mês"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: 1, mb: 1.2 }}>
            <Typography fontSize={24} fontWeight={900} lineHeight={1}>
              {formatNumber(average)}
            </Typography>
            <Typography color="text.secondary" fontSize={12.5} fontWeight={800}>
              dias em média
            </Typography>
          </Box>
          <MonthlyStackedBarChart
            height={210}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              segments: row.segments.map((segment, index) => ({
                colorVariant: segmentVariants[index % segmentVariants.length],
                key: segment.key,
                label: segment.label,
                value: segment.value,
              })),
              total: row.total,
            }))}
            showValues={false}
            valueFormatter={(value) => `${formatNumber(value)} dias`}
          />
          <MonthlyChartLegend
            items={legendSegments.slice(0, 6).map((segment, index) => ({
              color: getReportColor(theme, segmentVariants[index % segmentVariants.length]),
              label: segment.label,
            }))}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}
