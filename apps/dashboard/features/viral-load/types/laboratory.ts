export type ViralLoadLaboratoryRequest = {
  disaggregation?: boolean;
  district?: string[];
  facilityType?: "province" | "district" | "health_facility";
  healthFacility?: string;
  province?: string[];
};

export type VlLaboratoryMetricResponse = {
  LabName?: string | null;
  lab?: string | null;
  lab_name?: string | null;
  laboratory?: string | null;
  testing_facility?: string | null;
  testing_facility_name?: string | null;
  total?: number | string | null;
  samples?: number | string | null;
  tested?: number | string | null;
  rejected?: number | string | null;
  value?: number | string | null;
  count?: number | string | null;
  suppressed?: number | string | null;
  not_suppressed?: number | string | null;
  non_suppressed?: number | string | null;
  total_not_null?: number | string | null;
  total_null?: number | string | null;
  collection_reception?: number | string | null;
  reception_registration?: number | string | null;
  registration_analysis?: number | string | null;
  analysis_validation?: number | string | null;
  tat?: number | string | null;
  avg_tat?: number | string | null;
};

export type VlLaboratoryMonthlyResponse = VlLaboratoryMetricResponse & {
  date?: string | null;
  month?: number | string | null;
  month_name?: string | null;
  month_year?: string | null;
  period?: string | null;
  sample_month?: string | null;
  year?: number | string | null;
  year_month?: string | null;
};

export type VlLaboratoryReasonResponse = VlLaboratoryMonthlyResponse & {
  reason?: string | null;
  rejection_reason?: string | null;
  reason_not_specified?: number | string | null;
  routine?: number | string | null;
  test_reason?: string | null;
  treatment_failure?: number | string | null;
};

export type LaboratoryMetricPoint = {
  labKey: string;
  labName: string;
  percentage: number;
  rejected: number;
  tatAvg: number;
  total: number;
};

export type MonthlyLaboratoryMetricPoint = {
  monthKey: string;
  monthLabel: string;
  rejected: number;
  shortMonthLabel: string;
  tatAvg: number;
  tested: number;
  total: number;
};

export type ReasonMetricPoint = {
  percentage: number;
  reasonKey: string;
  reasonLabel: string;
  total: number;
};

export type MonthlyReasonMetricPoint = {
  monthKey: string;
  monthLabel: string;
  reasonNotSpecified: number;
  routine: number;
  shortMonthLabel: string;
  total: number;
  treatmentFailure: number;
};
