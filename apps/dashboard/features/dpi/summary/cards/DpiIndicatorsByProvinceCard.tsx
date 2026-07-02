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
  formatReportIntervalDates,
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
  const { data, error, interval, intervalLabel, loading, setInterval } = useDpiSummaryCardData<DpiProvinceIndicator[]>(
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
      onDatesChange={(dates) => setInterval({ endDate: dates[1], startDate: dates[0] })}
      reportActions={{
        cardId: "dpi-samples-by-province",
        cardTitle: "Amostras por Província",
        dateRange: {
          displayLabel: intervalLabel,
          endDateIso: interval.endDate,
          intervalDates: formatReportIntervalDates(interval),
          startDateIso: interval.startDate,
        },
        documentation: {
          title: "Amostras por Província",
          description: "Mostra a distribuição de amostras de DPI por província e tipo de laboratório.",
          dataSource: "API OpenLDR.",
          endpoint: "/hiv/dpi/summary/indicators_by_province/",
          interpretation: "A barra compara o peso de amostras convencionais e POC dentro do total provincial.",
          limitations: "Depende da classificação correta de província e tipo de laboratório.",
        },
        drillDown: {
          cardId: "dpi-samples-by-province",
          chartType: "ranking",
          dateRange: {
            displayLabel: intervalLabel,
            endDateIso: interval.endDate,
            intervalDates: formatReportIntervalDates(interval),
            startDateIso: interval.startDate,
          },
          module: "dpi",
          page: "summary",
          selectedDimension: "province",
        },
        enableDateFilter: true,
        enableFeedback: true,
        module: "dpi",
        page: "summary",
      }}
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
