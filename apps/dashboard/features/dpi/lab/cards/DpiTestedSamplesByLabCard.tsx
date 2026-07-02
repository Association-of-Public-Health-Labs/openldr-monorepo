"use client";

import { fetchDpiLabTestedSamples } from "../../api/laboratories";
import { DpiLabRankingCard } from "./DpiLabCardComponents";

export function DpiTestedSamplesByLabCard() {
  return (
    <DpiLabRankingCard
      colorVariant="info"
      load={fetchDpiLabTestedSamples}
      subtitle="Ranking de amostras testadas por laboratório."
      title="Amostras testadas por laboratório"
    />
  );
}
