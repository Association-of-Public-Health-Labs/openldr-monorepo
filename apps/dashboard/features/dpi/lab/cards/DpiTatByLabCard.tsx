"use client";

import { fetchDpiLabTat } from "../../api/laboratories";
import { DpiLabRankingCard } from "./DpiLabCardComponents";

export function DpiTatByLabCard() {
  return (
    <DpiLabRankingCard
      colorVariant="warning"
      load={fetchDpiLabTat}
      metric="tatAvg"
      subtitle="Tempo de resposta médio por laboratório."
      title="Tempo de resposta por laboratório"
      valueSuffix=" dias"
    />
  );
}
