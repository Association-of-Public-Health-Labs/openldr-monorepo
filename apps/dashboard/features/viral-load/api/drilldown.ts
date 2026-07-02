import {
  getVlFacilityTestedSamplesByAgeByFacility,
  getVlFacilityTestedSamplesByFacility,
  getVlFacilityTestedSamplesByGenderByFacility,
  getVlFacilityTestedSamplesByTestReasonByFacility,
} from "./facilities";
import { searchPatientsByFacility } from "./patients";
import {
  adaptViralLoadGeoRows,
  adaptViralLoadPatientDrillDownRows,
} from "../adapters/drilldown";
import type { DemographicDimension, GeoDrillDownLevel, GeoDrillDownRow, PatientDrillDownRow } from "../../shared/reporting";
import type { ViralLoadGeoDrillDownRequest } from "../types/drilldown";
import type { ViralLoadFacilityLevel } from "../types/facility";

type GeoRowsResult = {
  rows: GeoDrillDownRow[];
};

type PatientRowsResult = {
  error?: string;
  patients: PatientDrillDownRow[];
};

export async function getViralLoadDistrictsByProvince(options: ViralLoadGeoDrillDownRequest): Promise<GeoRowsResult> {
  return getGeoRows({
    ...options,
    facilityType: "district",
    nextLevel: "district",
  });
}

export async function getViralLoadFacilitiesByDistrict(options: ViralLoadGeoDrillDownRequest): Promise<GeoRowsResult> {
  return getGeoRows({
    ...options,
    facilityType: "health_facility",
    nextLevel: "facility",
  });
}

export async function getViralLoadFacilitySummary(options: ViralLoadGeoDrillDownRequest): Promise<GeoRowsResult> {
  return getGeoRows({
    ...options,
    facilityType: "health_facility",
  });
}

export async function getViralLoadDemographicsByContext(options: ViralLoadGeoDrillDownRequest): Promise<GeoRowsResult> {
  return getGeoRows({
    ...options,
    facilityType: getFacilityTypeForLevel(options.level),
  });
}

export async function getViralLoadPatientsByFacility(options: ViralLoadGeoDrillDownRequest): Promise<PatientRowsResult> {
  if (!options.facility) return { patients: [] };
  const result = await searchPatientsByFacility({
    facility: options.facility,
    interval: options.interval,
    page: 1,
    perPage: 25,
    token: options.token,
  });

  return {
    error: "error" in result ? result.error : undefined,
    patients: adaptViralLoadPatientDrillDownRows(result.data),
  };
}

async function getGeoRows(
  options: ViralLoadGeoDrillDownRequest & {
    facilityType: ViralLoadFacilityLevel;
    nextLevel?: GeoDrillDownLevel;
  },
): Promise<GeoRowsResult> {
  const request = {
    disaggregation: true,
    district: options.district ? [options.district] : undefined,
    facilityType: options.facilityType,
    healthFacility: options.facility,
    interval: options.interval,
    province: options.province ? [options.province] : undefined,
    token: options.token,
  };
  const dimension = options.demographicDimension || "none";
  const payload =
    dimension === "gender"
      ? await getVlFacilityTestedSamplesByGenderByFacility(request)
      : dimension === "age"
        ? await getVlFacilityTestedSamplesByAgeByFacility(request)
        : dimension === "testReason"
          ? await getVlFacilityTestedSamplesByTestReasonByFacility(request)
          : await getVlFacilityTestedSamplesByFacility(request);

  return {
    rows: adaptViralLoadGeoRows(payload, {
      dimension,
      nextLevel: options.nextLevel,
      sourceLevel: options.facilityType,
    }),
  };
}

function getFacilityTypeForLevel(level: GeoDrillDownLevel): ViralLoadFacilityLevel {
  if (level === "district") return "health_facility";
  if (level === "facility" || level === "patient") return "health_facility";
  return "district";
}
