export type VlHeaderIndicatorsResponse = {
  non_suppressed?: number | null;
  not_suppressed?: number | null;
  registered?: number | null;
  tested?: number | null;
  suppressed?: number | null;
  total?: number | null;
  rejected?: number | null;
};

export type VlMonthlyTotalResponse = {
  date?: string | null;
  year?: number | string | null;
  month?: number | string | null;
  month_year?: string | null;
  month_name?: string | null;
  period?: string | null;
  sample_month?: string | null;
  total?: number | null;
  year_month?: string | null;
};

export type VlSuppressionMonthlyResponse = {
  date?: string | null;
  year?: number | string | null;
  month?: number | string | null;
  month_year?: string | null;
  month_name?: string | null;
  non_suppressed?: number | null;
  period?: string | null;
  sample_month?: string | null;
  suppressed?: number | null;
  not_suppressed?: number | null;
  total?: number | null;
  year_month?: string | null;
};

export type VlTatMonthlyResponse = {
  date?: string | null;
  year?: number | string | null;
  month?: number | string | null;
  month_year?: string | null;
  month_name?: string | null;
  period?: string | null;
  sample_month?: string | null;
  collection_reception?: number | null;
  reception_registration?: number | null;
  registration_analysis?: number | null;
  analysis_validation?: number | null;
  year_month?: string | null;
};

export type VlProvinceSuppressionResponse = {
  non_suppressed?: number | null;
  province?: string | null;
  suppressed?: number | null;
  not_suppressed?: number | null;
  total?: number | null;
};

export type ViralLoadOverview = {
  notSuppressed: number;
  periodLabel: string;
  rejected: number;
  samplesReceived: number;
  samplesTested: number;
  suppressionRate: number;
  suppressed: number;
  tatAvg: number;
};

export type ViralSuppressionMonthly = {
  month: string;
  monthKey: string;
  monthLabel: string;
  notSuppressed: number;
  shortMonthLabel: string;
  suppressed: number;
  suppressionRate: number;
  total: number;
};

export type ViralLoadTatMonthly = {
  averageTat: number;
  expectedTat: number;
  month: string;
  monthKey: string;
  monthLabel: string;
  shortMonthLabel: string;
  total: number;
};

export type ViralLoadProvinceSuppression = {
  notSuppressed: number;
  province: string;
  suppressionRate: number;
  suppressed: number;
  total: number;
};

export type ViralLoadSamplesHistory = {
  month: string;
  monthKey: string;
  monthLabel: string;
  pending: number;
  received: number;
  rejected: number;
  shortMonthLabel: string;
  suppressionRate: number;
  tested: number;
};
