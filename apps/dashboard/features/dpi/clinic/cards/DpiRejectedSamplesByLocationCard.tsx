"use client";

import { fetchDpiFacilityRejectedSamples } from "../../api/facilities";
import { DpiLocationRankingCard } from "./DpiClinicCardComponents";

export function DpiRejectedSamplesByLocationCard() {
  return (
    <DpiLocationRankingCard
      colorVariant="error"
      load={fetchDpiFacilityRejectedSamples}
      subtitle="Ranking por província com amostras rejeitadas."
      title="Rejeições por local"
    />
  );
}
