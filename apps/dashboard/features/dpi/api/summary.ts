import { createApiClient } from "../../shared/api/client";
import {
  formatReportDateRangeLabel,
  formatReportIntervalDates,
  getDefaultReportDateInterval,
} from "../../shared/reporting/dateRange";
import {
  adaptEquipmentMetrics,
  adaptEquipmentMonthly,
  adaptIndicators,
  adaptMonthlyPositivity,
  adaptMonthlyPositivityPoints,
  adaptMonthlyRejectedPoints,
  adaptMonthlySamplePoints,
  adaptMonthlyValues,
  adaptOverviewIndicators,
  adaptProvinceIndicators,
  adaptSamplesPositivity,
  adaptTat,
  adaptTatMonthlyPoints,
  adaptTatSamples,
} from "../adapters/summary";
import type {
  DpiApiParams,
  DpiEquipmentMetric,
  DpiDateInterval,
  DpiEquipmentMonthly,
  DpiIndicatorSummary,
  DpiMonthlyPositivity,
  DpiMonthlyPositivityPoint,
  DpiMonthlyRejectedPoint,
  DpiMonthlySamplePoint,
  DpiMonthlyValue,
  DpiOverviewIndicators,
  DpiProvinceIndicator,
  DpiSamplesPositivity,
  DpiTatMonthlyPoint,
  DpiTatPoint,
  DpiTatSamples,
} from "../types/summary";

export const DPI_SUMMARY_ENDPOINTS = {
  indicators: "/hiv/eid/summary/indicators/",
  tat: "/hiv/eid/summary/tat/",
  tatSamples: "/hiv/eid/summary/tat_samples/",
  positivity: "/hiv/eid/summary/positivity/",
  numberOfSamples: "/hiv/eid/summary/number_of_samples/",
  indicatorsByProvince: "/hiv/eid/summary/indicators_by_province/",
  samplesPositivity: "/hiv/eid/summary/samples_positivity/",
  rejectedSamplesByMonth: "/hiv/eid/summary/rejected_samples_by_month/",
  samplesByEquipment: "/hiv/eid/summary/samples_by_equipment/",
  samplesByEquipmentByMonth: "/hiv/eid/summary/samples_by_equipment_by_month/",
} as const;

export function getLastTwelveMonths(): DpiDateInterval {
  return getDefaultReportDateInterval();
}

export function formatDpiDateInterval(interval: DpiDateInterval): string {
  return formatReportDateRangeLabel(interval);
}

function buildParams({ interval, labType = "all", category }: DpiApiParams) {
  return {
    interval_dates: formatReportIntervalDates(interval),
    lab_type: labType,
    ...(category ? { category } : {}),
  };
}

async function getEndpoint<T>(
  endpoint: string,
  params: DpiApiParams,
  adapter: (payload: unknown) => T,
): Promise<T> {
  const response = await createApiClient({ token: params.token }).get(endpoint, {
    params: buildParams(params),
    paramsSerializer: { indexes: null },
  });

  return adapter(response.data);
}

export function fetchDpiIndicators(params: DpiApiParams): Promise<DpiIndicatorSummary> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.indicators, params, adaptIndicators);
}

export function fetchDpiOverviewIndicators(params: DpiApiParams): Promise<DpiOverviewIndicators> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.indicators, params, adaptOverviewIndicators);
}

export function fetchDpiNumberOfSamples(params: DpiApiParams): Promise<DpiMonthlyValue[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.numberOfSamples, params, adaptMonthlyValues);
}

export function fetchDpiMonthlySamples(params: DpiApiParams): Promise<DpiMonthlySamplePoint[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.numberOfSamples, params, adaptMonthlySamplePoints);
}

export function fetchDpiPositivity(params: DpiApiParams): Promise<DpiMonthlyPositivity[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.positivity, params, adaptMonthlyPositivity);
}

export function fetchDpiMonthlyPositivity(params: DpiApiParams): Promise<DpiMonthlyPositivityPoint[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.positivity, params, adaptMonthlyPositivityPoints);
}

export function fetchDpiIndicatorsByProvince(params: DpiApiParams): Promise<DpiProvinceIndicator[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.indicatorsByProvince, params, adaptProvinceIndicators);
}

export function fetchDpiSamplesPositivity(params: DpiApiParams): Promise<DpiSamplesPositivity> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.samplesPositivity, params, adaptSamplesPositivity);
}

export function fetchDpiTat(params: DpiApiParams): Promise<DpiTatPoint[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.tat, params, adaptTat);
}

export function fetchDpiMonthlyTat(params: DpiApiParams): Promise<DpiTatMonthlyPoint[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.tat, params, adaptTatMonthlyPoints);
}

export function fetchDpiTatSamples(params: DpiApiParams): Promise<DpiTatSamples[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.tatSamples, params, adaptTatSamples);
}

export function fetchDpiRejectedSamplesByMonth(params: DpiApiParams): Promise<DpiMonthlyValue[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.rejectedSamplesByMonth, params, adaptMonthlyValues);
}

export function fetchDpiMonthlyRejectedSamples(params: DpiApiParams): Promise<DpiMonthlyRejectedPoint[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.rejectedSamplesByMonth, params, adaptMonthlyRejectedPoints);
}

export function fetchDpiSamplesByEquipment(params: DpiApiParams): Promise<DpiEquipmentMetric[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.samplesByEquipment, params, adaptEquipmentMetrics);
}

export function fetchDpiSamplesByEquipmentByMonth(params: DpiApiParams): Promise<DpiEquipmentMonthly[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.samplesByEquipmentByMonth, params, adaptEquipmentMonthly);
}
