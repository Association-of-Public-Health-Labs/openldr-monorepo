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
      subtitle="Últimos 12 meses com amostras testadas."
      title="Amostras testadas por mês"
    />
  );
}

