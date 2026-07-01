"use client";

import { useCallback } from "react";
import { RankingBarList, REPORT_CARD_HEIGHTS, REPORT_CONTENT_HEIGHTS, ReportCardShell } from "../../../shared/reporting";
import { fetchDpiSamplesByEquipment } from "../../api/summary";
import type { DpiDateInterval, DpiEquipmentMetric } from "../../types/summary";
import { formatNumber, useDpiSummaryCardData } from "./DpiSummaryCardUtils";

export function DpiSamplesByEquipmentCard() {
  const loader = useCallback(({ interval, token }: { interval: DpiDateInterval; token: string }) => {
    return fetchDpiSamplesByEquipment({ interval, labType: "all", token });
  }, []);
  const { data, error, intervalLabel, loading } = useDpiSummaryCardData<DpiEquipmentMetric[]>(
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
      <RankingBarList
        colorVariant="info"
        height={REPORT_CONTENT_HEIGHTS.medium}
        items={rows.map((row) => ({
          key: row.equipmentKey,
          label: row.equipmentName,
          value: row.total,
        }))}
        maxVisibleItems={8}
        valueFormatter={(value) => formatNumber(value)}
      />
    </ReportCardShell>
  );
}
