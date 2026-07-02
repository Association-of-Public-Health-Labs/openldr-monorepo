"use client";

import { fetchDpiLabTatSamples } from "../../api/laboratories";
import { DpiLabTatSamplesCardBase } from "./DpiLabCardComponents";

export function DpiTatSamplesByMonthCard() {
  return <DpiLabTatSamplesCardBase load={fetchDpiLabTatSamples} />;
}
