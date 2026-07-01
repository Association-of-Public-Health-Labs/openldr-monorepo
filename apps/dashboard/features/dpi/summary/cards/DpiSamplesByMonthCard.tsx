"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { MonthlyBarChart, REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import { fetchDpiMonthlySamples } from "../../api/summary";
import type { DpiMonthlySamplePoint } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

export function DpiSamplesByMonthCard() {
  const loader = useCallback(({ interval, token }: { interval: Parameters<typeof fetchDpiMonthlySamples>[0]["interval"]; token: string }) => {
    return fetchDpiMonthlySamples({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiMonthlySamplePoint[]>(
    loader,
    "Não foi possível carregar o número de amostras por mês.",
  );
  const rows = data ?? [];
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Número de amostras por mês"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            Total no período: {formatNumber(total)}
          </Typography>
          <MonthlyBarChart
            colorVariant="info"
            height={238}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              value: row.total,
            }))}
            valueFormatter={formatNumber}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}
