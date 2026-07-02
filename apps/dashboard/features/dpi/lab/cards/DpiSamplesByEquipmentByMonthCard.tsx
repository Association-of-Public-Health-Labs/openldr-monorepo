"use client";

import { fetchDpiLabSamplesByEquipmentByMonth } from "../../api/laboratories";
import { DpiEquipmentMonthlyStackedCard } from "./DpiLabCardComponents";

export function DpiSamplesByEquipmentByMonthCard() {
  return <DpiEquipmentMonthlyStackedCard load={fetchDpiLabSamplesByEquipmentByMonth} />;
}
