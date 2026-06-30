"use client";

import { adaptFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityTestedSamplesByFacility } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function TestedSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows) => adaptFacilityMetrics(rows)}
      load={getVlFacilityTestedSamplesByFacility}
      metric="total"
      subtitle="Amostras testadas por Província."
      title="Amostras testadas"
    />
  );
}

