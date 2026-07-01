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
      subtitle="Amostras testadas em lactantes no período selecionado."
      title="Lactação"
    />
  );
}

