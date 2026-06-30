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
      subtitle="Últimos 12 meses com amostras testadas em gestantes."
      title="Gravidez"
    />
  );
}

