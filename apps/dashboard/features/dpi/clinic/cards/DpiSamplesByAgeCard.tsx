"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { RankingBarList, REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell } from "../../../shared/reporting";
import { fetchDpiFacilityTestedSamplesByAge } from "../../api/facilities";
import type { DpiAgeMetric, DpiFacilityRequest } from "../../types/facility";
import { formatDpiClinicNumber, useDpiClinicCardData } from "./DpiClinicCardUtils";

export function DpiSamplesByAgeCard() {
  const loader = useCallback((options: DpiFacilityRequest) => fetchDpiFacilityTestedSamplesByAge(options), []);
  const { data, error, intervalLabel, loading } = useDpiClinicCardData<DpiAgeMetric[]>(
    loader,
    "Não foi possível carregar as amostras por faixa etária.",
  );
  const rows = data ?? [];

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Amostras por faixa etária"
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          Amostras testadas por faixa etária no período selecionado.
        </Typography>
        <RankingBarList
          colorVariant="secondary"
          height={250}
          items={rows.map((row) => ({
            key: row.ageKey,
            label: row.ageLabel,
            value: row.total,
          }))}
          maxVisibleItems={8}
          valueFormatter={(value) => formatDpiClinicNumber(value)}
        />
      </Box>
    </ReportCardShell>
  );
}
