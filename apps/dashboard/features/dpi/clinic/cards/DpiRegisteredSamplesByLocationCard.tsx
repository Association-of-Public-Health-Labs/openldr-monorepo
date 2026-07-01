"use client";

import { fetchDpiFacilityRegisteredSamples } from "../../api/facilities";
import { DpiLocationRankingCard } from "./DpiClinicCardComponents";

export function DpiRegisteredSamplesByLocationCard() {
  return (
    <DpiLocationRankingCard
      colorVariant="success"
      load={fetchDpiFacilityRegisteredSamples}
      subtitle="Ranking por província no período selecionado."
      title="Amostras registadas"
    />
  );
}
