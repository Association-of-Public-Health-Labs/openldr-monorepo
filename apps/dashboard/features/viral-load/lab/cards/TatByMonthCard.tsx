"use client";

import { adaptLaboratoryMonthlyMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTatByMonth } from "../../api/laboratories";
import { LaboratoryMonthlyCard } from "./LaboratoryCardComponents";

export function TatByMonthCard() {
  return (
    <LaboratoryMonthlyCard
      adapt={adaptLaboratoryMonthlyMetrics}
      colorVariant="warning"
      load={getVlLaboratoryTatByMonth}
      metric="tatAvg"
      subtitle="Últimos 12 meses com Tempo de Resposta médio."
      title="Tempo de Resposta por mês"
      valueSuffix="d"
    />
  );
}

