"use client";

import { adaptLaboratoryMonthlyMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTestedSamplesByMonth } from "../../api/laboratories";
import { LaboratoryMonthlyCard } from "./LaboratoryCardComponents";

export function TestedSamplesByMonthCard() {
  return (
    <LaboratoryMonthlyCard
      adapt={adaptLaboratoryMonthlyMetrics}
      load={getVlLaboratoryTestedSamplesByMonth}
      metric="tested"
      subtitle="Amostras testadas no período selecionado."
      title="Amostras testadas por mês"
    />
  );
}

