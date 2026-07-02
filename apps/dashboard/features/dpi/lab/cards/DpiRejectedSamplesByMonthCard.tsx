"use client";

import { fetchDpiLabRejectedSamplesByMonth } from "../../api/laboratories";
import { DpiLabMonthlyCard } from "./DpiLabCardComponents";

export function DpiRejectedSamplesByMonthCard() {
  return <DpiLabMonthlyCard colorVariant="error" load={fetchDpiLabRejectedSamplesByMonth} metric="total" title="Rejeições por mês" />;
}
