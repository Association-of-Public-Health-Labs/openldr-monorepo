"use client";

import { adaptMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityTatByMonth } from "../../api/facilities";
import { MonthlyTrendCard } from "./FacilityCardComponents";

export function TatByMonthCard() {
  return (
    <MonthlyTrendCard
      adapt={adaptMonthlyMetrics}
      load={getVlFacilityTatByMonth}
      metric="tatAvg"
      subtitle="Últimos 12 meses com Tempo de Resposta médio."
      title="Tempo de Resposta por Mês"
      valueSuffix="d"
    />
  );
}

