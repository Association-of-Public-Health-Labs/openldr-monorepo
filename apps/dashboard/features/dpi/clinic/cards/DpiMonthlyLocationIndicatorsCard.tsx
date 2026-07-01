"use client";

import { useCallback } from "react";
import {
  fetchDpiFacilityRegisteredSamplesByMonth,
  fetchDpiFacilityRejectedSamplesByMonth,
  fetchDpiFacilityTatAvgByMonth,
  fetchDpiFacilityTestedSamplesByMonth,
} from "../../api/facilities";
import type { DpiFacilityRequest } from "../../types/facility";
import { DpiMonthlyIndicatorsCard } from "./DpiClinicCardComponents";

export function DpiMonthlyLocationIndicatorsCard() {
  const loader = useCallback(async (options: DpiFacilityRequest) => {
    const [registered, tested, rejected, tat] = await Promise.all([
      fetchDpiFacilityRegisteredSamplesByMonth(options),
      fetchDpiFacilityTestedSamplesByMonth(options),
      fetchDpiFacilityRejectedSamplesByMonth(options),
      fetchDpiFacilityTatAvgByMonth(options),
    ]);

    return { registered, rejected, tat, tested };
  }, []);

  return <DpiMonthlyIndicatorsCard load={loader} />;
}
