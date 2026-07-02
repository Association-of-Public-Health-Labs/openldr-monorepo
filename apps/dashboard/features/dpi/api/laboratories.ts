import { createApiClient } from "../../shared/api/client";
import { formatReportIntervalDates } from "../../shared/reporting/dateRange";
import {
  adaptDpiEquipmentMetrics,
  adaptDpiEquipmentMonthlyPoints,
  adaptDpiLabMetrics,
  adaptDpiLabMonthlyMetrics,
  adaptDpiLabTatMetrics,
  adaptDpiTatSamplesPoint,
} from "../adapters/laboratory";
import type {
  DpiEquipmentMetric,
  DpiEquipmentMonthlyPoint,
  DpiLabMetric,
  DpiLabMonthlyMetric,
  DpiLabTatMetric,
  DpiLabTatSamplesPoint,
  DpiLaboratoryRequest,
} from "../types/laboratory";

export const DPI_LAB_ENDPOINTS = {
  registeredSamplesByMonth: "/hiv/eid/laboratories/registered_samples_by_month/",
  rejectedSamples: "/hiv/eid/laboratories/rejected_samples/",
  rejectedSamplesByMonth: "/hiv/eid/laboratories/rejected_samples_by_month/",
  samplesByEquipment: "/hiv/eid/laboratories/samples_by_equipment/",
  samplesByEquipmentByMonth: "/hiv/eid/laboratories/samples_by_equipment_by_month/",
  tat: "/hiv/eid/laboratories/tat/",
  tatSamples: "/hiv/eid/laboratories/tat_samples/",
  testedSamples: "/hiv/eid/laboratories/tested_samples/",
  testedSamplesByMonth: "/hiv/eid/laboratories/tested_samples_by_month/",
} as const;

function buildParams({
  category,
  disaggregation = false,
  district,
  facilityType = "province",
  healthFacility,
  interval,
  labType = "all",
  province,
}: DpiLaboratoryRequest) {
  return {
    interval_dates: formatReportIntervalDates(interval),
    facility_type: facilityType,
    disaggregation: disaggregation ? "True" : "False",
    lab_type: labType,
    province,
    district,
    health_facility: healthFacility,
    ...(category ? { category } : {}),
  };
}

async function getLaboratory<T>(
  endpoint: string,
  options: DpiLaboratoryRequest,
  adapter: (payload: unknown) => T,
): Promise<T> {
  const response = await createApiClient({ token: options.token }).get(endpoint, {
    params: buildParams(options),
    paramsSerializer: { indexes: null },
  });

  return adapter(response.data);
}

export function fetchDpiLabTestedSamples(options: DpiLaboratoryRequest): Promise<DpiLabMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.testedSamples, options, adaptDpiLabMetrics);
}

export function fetchDpiLabTestedSamplesByMonth(options: DpiLaboratoryRequest): Promise<DpiLabMonthlyMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.testedSamplesByMonth, options, adaptDpiLabMonthlyMetrics);
}

export function fetchDpiLabRegisteredSamplesByMonth(options: DpiLaboratoryRequest): Promise<DpiLabMonthlyMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.registeredSamplesByMonth, options, adaptDpiLabMonthlyMetrics);
}

export function fetchDpiLabTat(options: DpiLaboratoryRequest): Promise<DpiLabTatMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.tat, options, adaptDpiLabTatMetrics);
}

export function fetchDpiLabTatSamples(options: DpiLaboratoryRequest): Promise<DpiLabTatSamplesPoint> {
  return getLaboratory(DPI_LAB_ENDPOINTS.tatSamples, options, adaptDpiTatSamplesPoint);
}

export function fetchDpiLabRejectedSamples(options: DpiLaboratoryRequest): Promise<DpiLabMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.rejectedSamples, options, adaptDpiLabMetrics);
}

export function fetchDpiLabRejectedSamplesByMonth(options: DpiLaboratoryRequest): Promise<DpiLabMonthlyMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.rejectedSamplesByMonth, options, adaptDpiLabMonthlyMetrics);
}

export function fetchDpiLabSamplesByEquipment(options: DpiLaboratoryRequest): Promise<DpiEquipmentMetric[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.samplesByEquipment, options, adaptDpiEquipmentMetrics);
}

export function fetchDpiLabSamplesByEquipmentByMonth(options: DpiLaboratoryRequest): Promise<DpiEquipmentMonthlyPoint[]> {
  return getLaboratory(DPI_LAB_ENDPOINTS.samplesByEquipmentByMonth, options, adaptDpiEquipmentMonthlyPoints);
}
