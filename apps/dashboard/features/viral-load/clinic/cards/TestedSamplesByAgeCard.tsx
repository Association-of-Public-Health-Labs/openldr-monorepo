"use client";

import { adaptAgeCategories } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByAgeByFacility } from "../../api/facilities";
import { CategoryBreakdownCard } from "./FacilityCardComponents";

export function TestedSamplesByAgeCard() {
  return (
    <CategoryBreakdownCard
      adapt={adaptAgeCategories}
      load={getVlFacilityTestedSamplesByAgeByFacility}
      subtitle="Amostras testadas por faixa etária."
      title="Amostras por faixa etária"
    />
  );
}

