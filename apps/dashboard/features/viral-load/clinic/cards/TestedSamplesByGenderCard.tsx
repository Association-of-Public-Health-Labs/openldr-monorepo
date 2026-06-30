"use client";

import { adaptGenderMonthlyMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByGenderByMonth } from "../../api/facilities";
import { GenderMonthlyBreakdownCard } from "./FacilityCardComponents";

export function TestedSamplesByGenderCard() {
  return (
    <GenderMonthlyBreakdownCard
      adapt={adaptGenderMonthlyMetrics}
      load={getVlFacilityTestedSamplesByGenderByMonth}
      subtitle="Últimos 12 meses de amostras testadas por sexo."
      title="Amostras por sexo"
    />
  );
}
