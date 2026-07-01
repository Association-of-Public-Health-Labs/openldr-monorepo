import type { ReportDateInterval } from "../../shared/reporting/dateRange";
import type { DpiLabType } from "./summary";

export type DpiFacilityType = "district" | "health_facility" | "province";

export type DpiFacilityRequest = {
  disaggregation?: boolean;
  district?: string[];
  facilityType?: DpiFacilityType;
  healthFacility?: string;
  interval: ReportDateInterval;
  labType?: DpiLabType;
  province?: string[];
  token: string;
};

export type DpiLocationMetric = {
  locationKey: string;
  locationName: string;
  negative: number;
  pending: number;
  percentage?: number;
  positive: number;
  registered: number;
  rejected: number;
  tested: number;
  total: number;
};

export type DpiLocationTatMetric = {
  locationKey: string;
  locationName: string;
  tatAvg: number;
  total: number;
};

export type DpiMonthlyLocationMetric = {
  monthKey: string;
  monthLabel: string;
  negative: number;
  positive: number;
  registered: number;
  rejected: number;
  shortMonthLabel: string;
  tatAvg: number;
  tested: number;
  total: number;
};

export type DpiGenderMetric = {
  female: number;
  male: number;
  monthKey?: string;
  monthLabel?: string;
  shortMonthLabel?: string;
  total: number;
  unknown: number;
};

export type DpiAgeMetric = {
  ageKey: string;
  ageLabel: string;
  total: number;
};
