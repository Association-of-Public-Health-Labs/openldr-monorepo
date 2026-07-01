"use client";

import { fetchDpiFacilityTestedSamplesByGenderByMonth } from "../../api/facilities";
import { DpiGenderMonthlyCard } from "./DpiClinicCardComponents";

export function DpiSamplesByGenderCard() {
  return <DpiGenderMonthlyCard load={fetchDpiFacilityTestedSamplesByGenderByMonth} />;
}
