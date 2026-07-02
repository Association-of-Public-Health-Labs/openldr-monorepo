"use client";

import { adaptRejectedFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityRejectedSamplesByFacility } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function RejectedSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows, level) => adaptRejectedFacilityMetrics(rows, level)}
      load={getVlFacilityRejectedSamplesByFacility}
      metric="rejected"
      subtitle="Rejeições por Província."
      title="Rejeições"
    />
  );
}
