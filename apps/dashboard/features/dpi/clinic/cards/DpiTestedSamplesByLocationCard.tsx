"use client";

import { fetchDpiFacilityTestedSamples } from "../../api/facilities";
import { DpiLocationRankingCard } from "./DpiClinicCardComponents";

export function DpiTestedSamplesByLocationCard() {
  return (
    <DpiLocationRankingCard
      colorVariant="info"
      load={fetchDpiFacilityTestedSamples}
      subtitle="Ranking por província com amostras testadas."
      title="Amostras testadas"
    />
  );
}
