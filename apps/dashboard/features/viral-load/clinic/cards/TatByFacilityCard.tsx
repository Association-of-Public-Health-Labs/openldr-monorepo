"use client";

import { adaptTatFacilityMetrics } from "../../adapters/facility";
import { getVlFacilityTatByFacility } from "../../api/facilities";
import { FacilityRankingCard } from "./FacilityCardComponents";

export function TatByFacilityCard() {
  return (
    <FacilityRankingCard
      adapt={(rows, level) => adaptTatFacilityMetrics(rows, level)}
      load={getVlFacilityTatByFacility}
      metric="tatAvg"
      subtitle="Tempo de Resposta por Província."
      title="Tempo de Resposta"
      valueSuffix=" dias"
    />
  );
}
