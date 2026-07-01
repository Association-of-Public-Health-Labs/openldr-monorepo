"use client";

import { adaptRejectedLaboratoryMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryRejectedSamples } from "../../api/laboratories";
import { LaboratoryRankingCard } from "./LaboratoryCardComponents";

export function RejectedSamplesByLabCard() {
  return (
    <LaboratoryRankingCard
      adapt={adaptRejectedLaboratoryMetrics}
      colorVariant="error"
      load={getVlLaboratoryRejectedSamples}
      metric="rejected"
      subtitle="Rejeições por laboratório."
      title="Rejeições por laboratório"
    />
  );
}

