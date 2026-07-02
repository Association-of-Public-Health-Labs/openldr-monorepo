"use client";

import { fetchDpiLabRejectedSamples } from "../../api/laboratories";
import { DpiLabRankingCard } from "./DpiLabCardComponents";

export function DpiRejectedSamplesByLabCard() {
  return (
    <DpiLabRankingCard
      colorVariant="error"
      load={fetchDpiLabRejectedSamples}
      metric="rejected"
      subtitle="Ranking de rejeições por laboratório."
      title="Rejeições por laboratório"
    />
  );
}
