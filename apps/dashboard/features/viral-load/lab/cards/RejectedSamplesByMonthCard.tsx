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
      subtitle="Amostras rejeitadas no período selecionado."
      title="Rejeições por mês"
    />
  );
}

