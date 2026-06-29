export type DpiLabType = "all" | "conventional" | "poc";

export type DpiDateInterval = {
  startDate: string;
  endDate: string;
};

export type DpiApiParams = {
  interval: DpiDateInterval;
  labType?: DpiLabType;
  category?: number;
};

export type DpiIndicatorSummary = {
  registered: number;
  tested: number;
  rejected: number;
  pending: number;
  positive: number;
  negative: number;
};

export type DpiMonthlyValue = {
  year?: number | string;
  month?: number | string;
  monthName: string;
  total: number;
};

export type DpiMonthlyPositivity = DpiMonthlyValue & {
  positive: number;
  negative: number;
  positivity: number;
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
  monthName: string;
  collectionReceiveHub: number;
  receiveHubRegistrationHub: number;
  registrationHubReceiveLab: number;
  receiveLabRegistrationLab: number;
  registrationLabAnalyseLab: number;
  analyseLabValidationLab: number;
};

export type DpiTatSamples = {
  category: string;
  less7: number;
  between7And14: number;
  between15And21: number;
  greater21: number;
};

export type DpiEquipmentMonthly = {
  monthName: string;
  CAPCTM: number;
  ALINITY: number;
  M2000: number;
  C6800: number;
  PANTHER: number;
  MPIMA: number;
  MANUAL: number;
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
