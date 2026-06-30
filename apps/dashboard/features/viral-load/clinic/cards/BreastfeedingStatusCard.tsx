"use client";

import { adaptMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesBreastfeeding } from "../../api/facilities";
import { MonthlyTrendCard } from "./FacilityCardComponents";

export function BreastfeedingStatusCard() {
  return (
    <MonthlyTrendCard
      adapt={adaptMonthlyMetrics}
      load={getVlFacilityTestedSamplesBreastfeeding}
      metric="tested"
      subtitle="Últimos 12 meses com amostras testadas em lactantes."
      title="Lactação"
    />
  );
}

