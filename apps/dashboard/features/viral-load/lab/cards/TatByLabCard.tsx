"use client";

import { adaptLaboratoryMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTatByLab } from "../../api/laboratories";
import { LaboratoryRankingCard } from "./LaboratoryCardComponents";

export function TatByLabCard() {
  return (
    <LaboratoryRankingCard
      adapt={adaptLaboratoryMetrics}
      colorVariant="warning"
      load={getVlLaboratoryTatByLab}
      metric="tatAvg"
      subtitle="Tempo de Resposta por laboratório."
      title="Tempo de Resposta por laboratório"
      valueSuffix=" dias"
    />
  );
}

