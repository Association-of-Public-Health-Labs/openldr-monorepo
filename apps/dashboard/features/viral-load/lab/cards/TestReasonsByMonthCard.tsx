"use client";

import { adaptLaboratoryReasonMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTestedSamplesByTestReason } from "../../api/laboratories";
import { LaboratoryReasonCard } from "./LaboratoryCardComponents";

export function TestReasonsByMonthCard() {
  return (
    <LaboratoryReasonCard
      adapt={adaptLaboratoryReasonMetrics}
      load={getVlLaboratoryTestedSamplesByTestReason}
      subtitle="Motivos agregados no período selecionado."
      title="Motivo de teste"
    />
  );
}

