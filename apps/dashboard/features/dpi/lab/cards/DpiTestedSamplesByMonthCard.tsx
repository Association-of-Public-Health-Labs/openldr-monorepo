"use client";

import { fetchDpiLabTestedSamplesByMonth } from "../../api/laboratories";
import { DpiLabMonthlyCard } from "./DpiLabCardComponents";

export function DpiTestedSamplesByMonthCard() {
  return <DpiLabMonthlyCard colorVariant="info" load={fetchDpiLabTestedSamplesByMonth} metric="total" title="Amostras testadas por mês" />;
}
