"use client";

import { adaptFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityRegisteredSamples } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function RegisteredSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows) => adaptFacilityMetrics(rows)}
      load={getVlFacilityRegisteredSamples}
      metric="total"
      subtitle="Amostras registadas por Província."
      title="Amostras registadas"
    />
  );
}

