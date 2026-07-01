"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { MonthlyBarChart, REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell, ReportEmptyState } from "../../../shared/reporting";
import { fetchDpiMonthlyRejectedSamples } from "../../api/summary";
import type { DpiDateInterval, DpiMonthlyRejectedPoint } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

export function DpiRejectedSamplesByMonthCard() {
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiMonthlyRejectedSamples({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiMonthlyRejectedPoint[]>(
    loader,
    "Não foi possível carregar as rejeições por mês.",
  );
  const rows = data ?? [];
  const total = rows.reduce((sum, row) => sum + row.rejected, 0);

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Rejeições por mês"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
            Amostras rejeitadas no período: {formatNumber(total)}
          </Typography>
          <MonthlyBarChart
            colorVariant="error"
            height={238}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              value: row.rejected,
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
