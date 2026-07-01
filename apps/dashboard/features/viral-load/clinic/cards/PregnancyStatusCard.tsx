"use client";

import { adaptMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesPregnant } from "../../api/facilities";
import { MonthlyTrendCard } from "./FacilityCardComponents";

export function PregnancyStatusCard() {
  return (
    <MonthlyTrendCard
      adapt={adaptMonthlyMetrics}
      load={getVlFacilityTestedSamplesPregnant}
      metric="tested"
      subtitle="Amostras testadas em gestantes no período selecionado."
      title="Gravidez"
    />
  );
}

