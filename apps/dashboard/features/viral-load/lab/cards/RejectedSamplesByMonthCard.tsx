"use client";

import { adaptLaboratoryMonthlyMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryRejectedSamplesByMonth } from "../../api/laboratories";
import { LaboratoryMonthlyCard } from "./LaboratoryCardComponents";

export function RejectedSamplesByMonthCard() {
  return (
    <LaboratoryMonthlyCard
      adapt={adaptLaboratoryMonthlyMetrics}
      colorVariant="error"
      load={getVlLaboratoryRejectedSamplesByMonth}
      metric="rejected"
      subtitle="Últimos 12 meses com amostras rejeitadas."
      title="Rejeições por mês"
    />
  );
}

