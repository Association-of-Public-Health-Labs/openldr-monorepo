"use client";

import { adaptTestReasonCategories } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByTestReasonByFacility } from "../../api/facilities";
import { CategoryBreakdownCard } from "./FacilityCardComponents";

export function TestedSamplesByTestReasonCard() {
  return (
    <CategoryBreakdownCard
      adapt={adaptTestReasonCategories}
      load={getVlFacilityTestedSamplesByTestReasonByFacility}
      subtitle="Amostras testadas por motivo de teste."
      title="Motivo de teste"
    />
  );
}

