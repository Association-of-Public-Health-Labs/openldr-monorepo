"use client";

import { fetchDpiLabRegisteredSamplesByMonth } from "../../api/laboratories";
import { DpiLabMonthlyCard } from "./DpiLabCardComponents";

export function DpiRegisteredSamplesByMonthCard() {
  return <DpiLabMonthlyCard colorVariant="success" load={fetchDpiLabRegisteredSamplesByMonth} metric="total" title="Amostras registadas por mês" />;
}
