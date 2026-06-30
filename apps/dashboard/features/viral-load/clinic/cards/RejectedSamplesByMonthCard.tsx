"use client";

import { adaptMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityRejectedSamplesByMonth } from "../../api/facilities";
import { MonthlyTrendCard } from "./FacilityCardComponents";

export function RejectedSamplesByMonthCard() {
  return (
    <MonthlyTrendCard
      adapt={adaptMonthlyMetrics}
      load={getVlFacilityRejectedSamplesByMonth}
      metric="rejected"
      subtitle="Últimos 12 meses com amostras rejeitadas."
      title="Rejeições por Mês"
    />
  );
}

