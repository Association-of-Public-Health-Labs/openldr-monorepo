"use client";

import { adaptRegisteredFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityRegisteredSamples } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function RegisteredSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows, level) => adaptRegisteredFacilityMetrics(rows, level)}
      load={getVlFacilityRegisteredSamples}
      metric="total"
      subtitle="Amostras registadas por Província."
      title="Amostras registadas"
    />
  );
}
