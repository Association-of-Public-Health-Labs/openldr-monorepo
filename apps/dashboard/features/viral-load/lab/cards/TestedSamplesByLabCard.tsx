"use client";

import { adaptLaboratoryMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTestedSamples } from "../../api/laboratories";
import { LaboratoryRankingCard } from "./LaboratoryCardComponents";

export function TestedSamplesByLabCard() {
  return (
    <LaboratoryRankingCard
      adapt={adaptLaboratoryMetrics}
      load={getVlLaboratoryTestedSamples}
      metric="total"
      subtitle="Amostras testadas por laboratório."
      title="Amostras testadas por laboratório"
    />
  );
}

