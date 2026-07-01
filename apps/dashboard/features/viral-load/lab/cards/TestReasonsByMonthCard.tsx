"use client";

import { adaptLaboratoryReasonMonthlyMetrics } from "../../adapters/laboratory";
import { getVlLaboratoryTestedSamplesByTestReason } from "../../api/laboratories";
import { LaboratoryReasonMonthlyCard } from "./LaboratoryCardComponents";

export function TestReasonsByMonthCard() {
  return (
    <LaboratoryReasonMonthlyCard
      adapt={adaptLaboratoryReasonMonthlyMetrics}
      load={getVlLaboratoryTestedSamplesByTestReason}
      subtitle="Motivo de teste por mês nos últimos 12 meses."
      title="Motivo de teste por mês"
    />
  );
}
