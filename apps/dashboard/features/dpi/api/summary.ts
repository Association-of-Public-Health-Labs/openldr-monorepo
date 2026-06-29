import { createApiClient } from "../../shared/api/client";
import {
  adaptEquipmentMonthly,
  adaptIndicators,
  adaptMonthlyPositivity,
  adaptMonthlyValues,
  adaptProvinceIndicators,
  adaptSamplesPositivity,
  adaptTat,
  adaptTatSamples,
} from "../adapters/summary";
import type {
  DpiApiParams,
  DpiDateInterval,
  DpiEquipmentMonthly,
  DpiIndicatorSummary,
  DpiMonthlyPositivity,
  DpiMonthlyValue,
  DpiProvinceIndicator,
  DpiSamplesPositivity,
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
  samplesByEquipmentByMonth: "/hiv/eid/summary/samples_by_equipment_by_month/",
} as const;

export function getLastTwelveMonths(): DpiDateInterval {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

export function formatDpiDateInterval(interval: DpiDateInterval): string {
  return `${new Date(interval.startDate).toLocaleDateString("pt-PT")} a ${new Date(interval.endDate).toLocaleDateString("pt-PT")}`;
}

function buildParams({ interval, labType = "all", category }: DpiApiParams) {
  return {
    interval_dates: `${interval.startDate},${interval.endDate}`,
    lab_type: labType,
    ...(category ? { category } : {}),
  };
}

async function getEndpoint<T>(
  endpoint: string,
  params: DpiApiParams,
  adapter: (payload: unknown) => T,
): Promise<T> {
  const response = await createApiClient().get(endpoint, {
    params: buildParams(params),
    paramsSerializer: { indexes: null },
  });

  return adapter(response.data);
}

export function fetchDpiIndicators(params: DpiApiParams): Promise<DpiIndicatorSummary> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.indicators, params, adaptIndicators);
}

export function fetchDpiNumberOfSamples(params: DpiApiParams): Promise<DpiMonthlyValue[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.numberOfSamples, params, adaptMonthlyValues);
}

export function fetchDpiPositivity(params: DpiApiParams): Promise<DpiMonthlyPositivity[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.positivity, params, adaptMonthlyPositivity);
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

export function fetchDpiTatSamples(params: DpiApiParams): Promise<DpiTatSamples[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.tatSamples, params, adaptTatSamples);
}

export function fetchDpiRejectedSamplesByMonth(params: DpiApiParams): Promise<DpiMonthlyValue[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.rejectedSamplesByMonth, params, adaptMonthlyValues);
}

export function fetchDpiSamplesByEquipmentByMonth(params: DpiApiParams): Promise<DpiEquipmentMonthly[]> {
  return getEndpoint(DPI_SUMMARY_ENDPOINTS.samplesByEquipmentByMonth, params, adaptEquipmentMonthly);
}
