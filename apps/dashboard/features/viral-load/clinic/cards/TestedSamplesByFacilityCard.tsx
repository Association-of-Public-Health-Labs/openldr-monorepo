"use client";

import { adaptTestedFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByFacility } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function TestedSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows, level) => adaptTestedFacilityMetrics(rows, level)}
      load={getVlFacilityTestedSamplesByFacility}
      metric="total"
      subtitle="Amostras testadas por Província."
      title="Amostras testadas"
    />
  );
}
