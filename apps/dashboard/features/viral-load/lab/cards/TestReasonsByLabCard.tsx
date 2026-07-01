"use client";

import { adaptLaboratoryReasonMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTestedSamplesByTestReason } from "../../api/laboratories";
import { LaboratoryReasonCard } from "./LaboratoryCardComponents";

export function TestReasonsByLabCard() {
  return (
    <LaboratoryReasonCard
      adapt={adaptLaboratoryReasonMetrics}
      load={getVlLaboratoryTestedSamplesByTestReason}
      subtitle="Amostras testadas por motivo de teste."
      title="Motivo de teste"
    />
  );
}

