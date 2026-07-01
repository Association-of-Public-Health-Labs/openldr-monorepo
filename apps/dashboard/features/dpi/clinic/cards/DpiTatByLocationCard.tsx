"use client";

import { fetchDpiFacilityTatAvg } from "../../api/facilities";
import { DpiLocationRankingCard } from "./DpiClinicCardComponents";

export function DpiTatByLocationCard() {
  return (
    <DpiLocationRankingCard
      colorVariant="warning"
      load={fetchDpiFacilityTatAvg}
      subtitle="Tempo de resposta médio por província."
      title="Tempo de resposta por local"
      valueSuffix=" dias"
    />
  );
}
