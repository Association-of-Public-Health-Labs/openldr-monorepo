import type { ReportDateInterval } from "../../shared/reporting/dateRange";

export type DpiLabType = "all" | "conventional" | "poc";

export type DpiDateInterval = ReportDateInterval;

export type DpiApiParams = {
  category?: number;
  interval: DpiDateInterval;
  labType?: DpiLabType;
  token?: string | null;
};

export type DpiOverviewIndicators = {
  negative: number;
  pending: number;
  positive: number;
  positivityRate: number;
  registered: number;
  rejected: number;
  rejectionRate: number;
  tested: number;
  totalSamples: number;
};

export type DpiIndicatorSummary = {
  registered: number;
  tested: number;
  rejected: number;
  pending: number;
  positive: number;
  negative: number;
  totalSamples: number;
};

export type DpiMonthlyValue = {
  year?: number | string;
  month?: number | string;
  monthKey?: string;
  monthName: string;
  shortMonthLabel?: string;
  total: number;
};

export type DpiMonthlySamplePoint = {
  monthKey: string;
  monthLabel: string;
  shortMonthLabel: string;
  total: number;
};

export type DpiMonthlyPositivity = DpiMonthlyValue & {
  positive: number;
  negative: number;
  positivity: number;
};

export type DpiMonthlyPositivityPoint = {
  monthKey: string;
  monthLabel: string;
  negative: number;
  positive: number;
  positivityRate: number;
  shortMonthLabel: string;
  total: number;
};

export type DpiMonthlyRejectedPoint = {
  monthKey: string;
  monthLabel: string;
  rejected: number;
  shortMonthLabel: string;
};

export type DpiProvinceIndicator = {
  province: string;
  total: number;
  tested: number;
  positive: number;
  conventional: number;
  poc: number;
};

export type DpiSamplesPositivity = {
  total: number;
  positive: number;
  negative: number;
  femalePositive: number;
  malePositive: number;
  femaleNegative: number;
  maleNegative: number;
};

export type DpiTatPoint = {
  monthKey?: string;
  monthLabel?: string;
  monthName: string;
  shortMonthLabel?: string;
  collectionReceiveHub: number;
  receiveHubRegistrationHub: number;
  registrationHubReceiveLab: number;
  receiveLabRegistrationLab: number;
  registrationLabAnalyseLab: number;
  analyseLabValidationLab: number;
};

export type DpiTatMonthlySegment = {
  key: string;
  label: string;
  value: number;
};

export type DpiTatMonthlyPoint = {
  averageTat: number;
  monthKey: string;
  monthLabel: string;
  segments: DpiTatMonthlySegment[];
  shortMonthLabel: string;
  total: number;
};

export type DpiTatSamples = {
  category: string;
  less7: number;
  between7And14: number;
  between15And21: number;
  greater21: number;
};

export type DpiEquipmentMonthly = {
  monthKey?: string;
  monthLabel?: string;
  monthName: string;
  shortMonthLabel?: string;
  CAPCTM: number;
  ALINITY: number;
  M2000: number;
  C6800: number;
  PANTHER: number;
  MPIMA: number;
  MANUAL: number;
};

export type DpiEquipmentMetric = {
  equipmentKey: string;
  equipmentName: string;
  total: number;
};

export type DpiSummaryPayload = {
  indicators: DpiIndicatorSummary;
  numberOfSamples: DpiMonthlyValue[];
  positivity: DpiMonthlyPositivity[];
  indicatorsByProvince: DpiProvinceIndicator[];
  samplesPositivity: DpiSamplesPositivity;
  tat: DpiTatPoint[];
  tatSamples: DpiTatSamples[];
  rejectedSamplesByMonth: DpiMonthlyValue[];
  samplesByEquipmentByMonth: DpiEquipmentMonthly[];
};

export type DpiReportStatus = "idle" | "loading" | "success" | "error";
