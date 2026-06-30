"use client";

import { adaptRejectedFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityRejectedSamplesByFacility } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function RejectedSamplesByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows) => adaptRejectedFacilityMetrics(rows)}
      load={getVlFacilityRejectedSamplesByFacility}
      metric="rejected"
      subtitle="Rejeições por Província."
      title="Rejeições"
    />
  );
}

