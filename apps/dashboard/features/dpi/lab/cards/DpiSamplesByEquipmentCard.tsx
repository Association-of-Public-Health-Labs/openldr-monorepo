"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { RankingBarList, REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell } from "../../../shared/reporting";
import { fetchDpiLabSamplesByEquipment } from "../../api/laboratories";
import type { DpiEquipmentMetric, DpiLaboratoryRequest } from "../../types/laboratory";
import { formatDpiLabNumber, useDpiLabCardData } from "./DpiLabCardUtils";

export function DpiSamplesByEquipmentCard() {
  const loader = useCallback((options: DpiLaboratoryRequest) => fetchDpiLabSamplesByEquipment(options), []);
  const { data, error, intervalLabel, loading } = useDpiLabCardData<DpiEquipmentMetric[]>(
    loader,
    "Não foi possível carregar as amostras por equipamento.",
  );
  const rows = data ?? [];

  return (
    <ReportCardShell
      cardHeight={REPORT_CARD_HEIGHTS.medium}
      contentHeight={REPORT_CONTENT_HEIGHTS.medium}
      error={error}
      loading={loading}
      subtitle={intervalLabel}
      title="Amostras por equipamento"
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
        <Typography color="text.secondary" fontSize={12.5} fontWeight={700} sx={{ mb: 1.35 }}>
          Distribuição por equipamento no período selecionado.
        </Typography>
        <RankingBarList
          colorVariant="secondary"
          height={250}
          items={rows.map((row) => ({
            key: row.equipmentKey,
            label: row.equipmentName,
            value: row.total,
          }))}
          maxVisibleItems={8}
          valueFormatter={(value) => formatDpiLabNumber(value)}
        />
      </Box>
    </ReportCardShell>
  );
}
