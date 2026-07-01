import { createApiClient } from "../../shared/api/client";
import { formatReportIntervalDates } from "../../shared/reporting/dateRange";
import {
  adaptDpiAgeMetrics,
  adaptDpiGenderMetrics,
  adaptDpiLocationMetrics,
  adaptDpiMonthlyMetrics,
  adaptDpiTatLocationMetrics,
} from "../adapters/facility";
import type {
  DpiAgeMetric,
  DpiFacilityRequest,
  DpiGenderMetric,
  DpiLocationMetric,
  DpiLocationTatMetric,
  DpiMonthlyLocationMetric,
} from "../types/facility";

export const DPI_FACILITY_ENDPOINTS = {
  keyIndicators: "/hiv/eid/facilities/key_indicators/",
  registeredSamples: "/hiv/eid/facilities/registered_samples/",
  registeredSamplesByMonth: "/hiv/eid/facilities/registered_samples_by_month/",
  rejectedSamples: "/hiv/eid/facilities/rejected_samples/",
  rejectedSamplesByMonth: "/hiv/eid/facilities/rejected_samples_by_month/",
  tatAvg: "/hiv/eid/facilities/tat_avg/",
  tatAvgByMonth: "/hiv/eid/facilities/tat_avg_by_month/",
  tatDays: "/hiv/eid/facilities/tat_days/",
  tatDaysByMonth: "/hiv/eid/facilities/tat_days_by_month/",
  testedSamples: "/hiv/eid/facilities/tested_samples/",
  testedSamplesByAge: "/hiv/eid/facilities/tested_samples_by_age/",
  testedSamplesByGender: "/hiv/eid/facilities/tested_samples_by_gender/",
  testedSamplesByGenderByMonth: "/hiv/eid/facilities/tested_samples_by_gender_by_month/",
  testedSamplesByMonth: "/hiv/eid/facilities/tested_samples_by_month/",
} as const;

function buildParams({
  disaggregation = false,
  district,
  facilityType = "province",
  healthFacility,
  interval,
  labType = "all",
  province,
}: DpiFacilityRequest) {
  return {
    interval_dates: formatReportIntervalDates(interval),
    facility_type: facilityType,
    disaggregation: disaggregation ? "True" : "False",
    lab_type: labType,
    province,
    district,
    health_facility: healthFacility,
  };
}

async function getFacility<T>(
  endpoint: string,
  options: DpiFacilityRequest,
  adapter: (payload: unknown) => T,
): Promise<T> {
  const response = await createApiClient({ token: options.token }).get(endpoint, {
    params: buildParams(options),
    paramsSerializer: { indexes: null },
  });

  return adapter(response.data);
}

export function fetchDpiFacilityRegisteredSamples(options: DpiFacilityRequest): Promise<DpiLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.registeredSamples, options, adaptDpiLocationMetrics);
}

export function fetchDpiFacilityTestedSamples(options: DpiFacilityRequest): Promise<DpiLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.testedSamples, options, adaptDpiLocationMetrics);
}

export function fetchDpiFacilityTatAvg(options: DpiFacilityRequest): Promise<DpiLocationTatMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.tatAvg, options, adaptDpiTatLocationMetrics);
}

export function fetchDpiFacilityRejectedSamples(options: DpiFacilityRequest): Promise<DpiLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.rejectedSamples, options, adaptDpiLocationMetrics);
}

export function fetchDpiFacilityTestedSamplesByGenderByMonth(options: DpiFacilityRequest): Promise<DpiGenderMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.testedSamplesByGenderByMonth, options, adaptDpiGenderMetrics);
}

export function fetchDpiFacilityTestedSamplesByAge(options: DpiFacilityRequest): Promise<DpiAgeMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.testedSamplesByAge, options, adaptDpiAgeMetrics);
}

export function fetchDpiFacilityKeyIndicators(options: DpiFacilityRequest): Promise<DpiLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.keyIndicators, options, adaptDpiLocationMetrics);
}

export function fetchDpiFacilityRegisteredSamplesByMonth(options: DpiFacilityRequest): Promise<DpiMonthlyLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.registeredSamplesByMonth, options, adaptDpiMonthlyMetrics);
}

export function fetchDpiFacilityTestedSamplesByMonth(options: DpiFacilityRequest): Promise<DpiMonthlyLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.testedSamplesByMonth, options, adaptDpiMonthlyMetrics);
}

export function fetchDpiFacilityRejectedSamplesByMonth(options: DpiFacilityRequest): Promise<DpiMonthlyLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.rejectedSamplesByMonth, options, adaptDpiMonthlyMetrics);
}

export function fetchDpiFacilityTatAvgByMonth(options: DpiFacilityRequest): Promise<DpiMonthlyLocationMetric[]> {
  return getFacility(DPI_FACILITY_ENDPOINTS.tatAvgByMonth, options, adaptDpiMonthlyMetrics);
}
