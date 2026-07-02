import type { ReportDateInterval } from "../../shared/reporting/dateRange";
import type { DpiLabType } from "./summary";

export type DpiLaboratoryRequest = {
  category?: number;
  disaggregation?: boolean;
  district?: string[];
  facilityType?: "district" | "health_facility" | "province";
  healthFacility?: string;
  interval: ReportDateInterval;
  labType?: DpiLabType;
  province?: string[];
  token: string;
};

export type DpiLabMetric = {
  labKey: string;
  labName: string;
  negative: number;
  pending: number;
  positive: number;
  registered: number;
  rejected: number;
  tested: number;
  total: number;
};

export type DpiLabTatMetric = {
  labKey: string;
  labName: string;
  tatAvg: number;
  total: number;
};

export type DpiLabMonthlyMetric = {
  monthKey: string;
  monthLabel: string;
  registered: number;
  rejected: number;
  shortMonthLabel: string;
  tatAvg: number;
  tested: number;
  total: number;
};

export type DpiLabTatSamplesPoint = {
  between16And21: number;
  between7And15: number;
  greaterThan21: number;
  lessThan7: number;
  noDates: number;
};

export type DpiEquipmentMetric = {
  equipmentKey: string;
  equipmentName: string;
  total: number;
};

export type DpiEquipmentMonthlyPoint = {
  equipments: DpiEquipmentMetric[];
  monthKey: string;
  monthLabel: string;
  shortMonthLabel: string;
  total: number;
};
