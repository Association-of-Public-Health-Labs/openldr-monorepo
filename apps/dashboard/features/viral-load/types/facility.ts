export type ViralLoadFacilityLevel = "province" | "district" | "health_facility";

export type ViralLoadFacilityRequest = {
  disaggregation?: boolean;
  district?: string[];
  facilityType?: ViralLoadFacilityLevel;
  healthFacility?: string;
  province?: string[];
};

export type VlFacilityMetricResponse = {
  requesting_facility?: string | null;
  requesting_district?: string | null;
  requesting_province?: string | null;
  province?: string | null;
  province_name?: string | null;
  district?: string | null;
  district_name?: string | null;
  facility?: string | null;
  health_facility?: string | null;
  requesting_facility_name?: string | null;
  facility_name?: string | null;
  location?: string | null;
  name?: string | null;
  total?: number | string | null;
  samples?: number | string | null;
  registered?: number | string | null;
  tested?: number | string | null;
  suppressed?: number | string | null;
  not_suppressed?: number | string | null;
  non_suppressed?: number | string | null;
  total_not_null?: number | string | null;
  total_null?: number | string | null;
  rejected?: number | string | null;
  total_rejected?: number | string | null;
  collection_reception?: number | string | null;
  reception_registration?: number | string | null;
  registration_analysis?: number | string | null;
  analysis_validation?: number | string | null;
  tat?: number | string | null;
  avg_tat?: number | string | null;
  days?: number | string | null;
  total_registered?: number | string | null;
};

export type VlFacilityMonthlyResponse = VlFacilityMetricResponse & {
  date?: string | null;
  month?: number | string | null;
  month_name?: string | null;
  month_year?: string | null;
  period?: string | null;
  sample_month?: string | null;
  year?: number | string | null;
  year_month?: string | null;
};

export type VlFacilityGenderResponse = VlFacilityMonthlyResponse & {
  female?: number | string | null;
  male_suppressed?: number | string | null;
  male_not_suppressed?: number | string | null;
  male?: number | string | null;
  female_suppressed?: number | string | null;
  female_not_suppressed?: number | string | null;
  not_specified?: number | string | null;
  other?: number | string | null;
  unknown?: number | string | null;
};

export type VlFacilityAgeResponse = VlFacilityMonthlyResponse & {
  age_group?: string | null;
};

export type VlFacilityTestReasonResponse = VlFacilityMonthlyResponse & {
  reason_not_specified?: number | string | null;
  routine?: number | string | null;
  treatment_failure?: number | string | null;
};

export type FacilityMetricPoint = {
  canDrillDown: boolean;
  locationKey: string;
  locationName: string;
  level: ViralLoadFacilityLevel;
  notSuppressed: number;
  parentKey?: string;
  rejected: number;
  suppressionRate: number;
  suppressed: number;
  tatAvg: number;
  total: number;
  rawRows?: VlFacilityMetricResponse[];
};

export type MonthlyMetricPoint = {
  monthKey: string;
  monthLabel: string;
  rejected: number;
  registered: number;
  shortMonthLabel: string;
  tatAvg: number;
  tested: number;
};

export type CategoryMetricPoint = {
  category: string;
  key: string;
  total: number;
};

export type GenderMetric = {
  female: number;
  male: number;
  monthKey: string;
  monthLabel: string;
  shortMonthLabel: string;
  total: number;
  unknown: number;
};

export type AgeMetric = CategoryMetricPoint;

export type TestReasonMetric = CategoryMetricPoint;

export type PregnancyMetric = MonthlyMetricPoint;

export type BreastfeedingMetric = MonthlyMetricPoint;

export type RejectionMonthlyMetric = MonthlyMetricPoint;

export type TatMonthlyMetric = MonthlyMetricPoint;
