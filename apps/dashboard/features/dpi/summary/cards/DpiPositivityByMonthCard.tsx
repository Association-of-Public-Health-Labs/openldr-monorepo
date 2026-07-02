"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import {
  MonthlyChartLegend,
  MonthlyStackedBarChart,
  REPORT_CARD_HEIGHTS,
  REPORT_CONTENT_HEIGHTS,
  ReportCardShell,
  ReportEmptyState,
  formatReportIntervalDates,
  getReportColor,
} from "../../../shared/reporting";
import { useTheme } from "@mui/material/styles";
import { fetchDpiMonthlyPositivity } from "../../api/summary";
import type { DpiDateInterval, DpiMonthlyPositivityPoint } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

export function DpiPositivityByMonthCard() {
  const theme = useTheme();
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiMonthlyPositivity({ interval, labType: "all", token });
  }, []);
  const { data, error, interval, intervalLabel, loading, setInterval } = useDpiSummaryCardData<DpiMonthlyPositivityPoint[]>(
    loader,
    "Não foi possível carregar a positividade por mês.",
  );
  const rows = data ?? [];
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const positive = rows.reduce((sum, row) => sum + row.positive, 0);
  const rate = total ? Math.round((positive / total) * 1000) / 10 : 0;

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      onDatesChange={(dates) => setInterval({ endDate: dates[1], startDate: dates[0] })}
      reportActions={{
        cardId: "dpi-positivity-by-month",
        cardTitle: "Positividade das Amostras",
        dateRange: {
          displayLabel: intervalLabel,
          endDateIso: interval.endDate,
          intervalDates: formatReportIntervalDates(interval),
          startDateIso: interval.startDate,
        },
        documentation: {
          title: "Positividade das Amostras",
          description: "Mostra a evolução mensal de amostras positivas e negativas de DPI.",
          dataSource: "API OpenLDR.",
          endpoint: "/hiv/dpi/summary/monthly_positivity/",
          interpretation: "A taxa indica a proporção de amostras positivas no período selecionado.",
          limitations: "Depende da completude da classificação dos resultados enviados ao OpenLDR.",
        },
        drillDown: {
          cardId: "dpi-positivity-by-month",
          chartType: "stacked-bar",
          dateRange: {
            displayLabel: intervalLabel,
            endDateIso: interval.endDate,
            intervalDates: formatReportIntervalDates(interval),
            startDateIso: interval.startDate,
          },
          module: "dpi",
          page: "summary",
          selectedDimension: "month",
        },
        enableDateFilter: true,
        enableFeedback: true,
        module: "dpi",
        page: "summary",
      }}
      subtitle={intervalLabel}
      title="Positividade das Amostras"
    >
      {rows.length ? (
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: 1, mb: 1.2 }}>
            <Typography fontSize={24} fontWeight={900} lineHeight={1}>
              {formatNumber(rate)}%
            </Typography>
            <Typography color="text.secondary" fontSize={12.5} fontWeight={800}>
              Taxa de positividade no período
            </Typography>
          </Box>
          <MonthlyStackedBarChart
            height={222}
            points={rows.map((row) => ({
              key: row.monthKey,
              label: row.shortMonthLabel,
              segments: [
                { colorVariant: "success", key: "positive", label: "Positivas", value: row.positive },
                { colorVariant: "info", key: "negative", label: "Negativas", value: row.negative },
              ],
              total: row.total,
            }))}
            valueFormatter={formatNumber}
          />
          <MonthlyChartLegend
            items={[
              { color: getReportColor(theme, "success"), label: "Positivas" },
              { color: getReportColor(theme, "info"), label: "Negativas" },
            ]}
          />
        </Box>
      ) : (
        <ReportEmptyState />
      )}
    </ReportCardShell>
  );
}
