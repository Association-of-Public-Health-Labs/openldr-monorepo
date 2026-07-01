"use client";

import { adaptGenderMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByGenderByMonth } from "../../api/facilities";
import { GenderMonthlyBreakdownCard } from "./FacilityCardComponents";

export function TestedSamplesByGenderCard() {
  return (
    <GenderMonthlyBreakdownCard
      adapt={adaptGenderMonthlyMetrics}
      load={getVlFacilityTestedSamplesByGenderByMonth}
      subtitle="Amostras testadas por sexo no período selecionado."
      title="Amostras por sexo"
    />
  );
}
