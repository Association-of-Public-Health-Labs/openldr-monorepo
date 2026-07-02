import type {
  DemographicDimension,
  GeoDrillDownLevel,
  GeoDrillDownRow,
  PatientDrillDownRow,
} from "../../shared/reporting";
import {
  adaptAgeCategories,
  adaptFacilityMetrics,
  adaptGenderCategories,
  adaptTestReasonCategories,
} from "./facility";
import type {
  ViralLoadPatientDrillDownSource,
  ViralLoadGeoRawRows,
} from "../types/drilldown";
import type { ViralLoadFacilityLevel, VlFacilityMetricResponse } from "../types/facility";

export function adaptViralLoadGeoRows(
  payload: ViralLoadGeoRawRows | null | undefined,
  options: {
    dimension: DemographicDimension;
    nextLevel?: GeoDrillDownLevel;
    sourceLevel: ViralLoadFacilityLevel;
  },
): GeoDrillDownRow[] {
  if (options.dimension === "gender") {
    return adaptCategoryRows(adaptGenderCategories(payload as never), options.nextLevel);
  }

  if (options.dimension === "age") {
    return adaptCategoryRows(adaptAgeCategories(payload as never), options.nextLevel);
  }

  if (options.dimension === "testReason") {
    return adaptCategoryRows(adaptTestReasonCategories(payload as never), options.nextLevel);
  }

  const rows = adaptFacilityMetrics(payload as VlFacilityMetricResponse[], options.sourceLevel);
  return rows.map((row) => ({
    id: row.locationKey,
    label: row.locationName,
    metadata: {
      level: row.level,
      notSuppressed: row.notSuppressed,
      rejected: row.rejected,
      suppressed: row.suppressed,
      suppressionRate: row.suppressionRate,
      tatAvg: row.tatAvg,
      total: row.total,
    },
    nextLevel: options.nextLevel,
    percentage: row.suppressionRate,
    value: row.total,
  }));
}

export function adaptViralLoadPatientDrillDownRows(rows: ViralLoadPatientDrillDownSource[]): PatientDrillDownRow[] {
  return rows.map((row) => ({
    district: row.district,
    facility: row.facility,
    id: row.id,
    identifier: row.patientIdentifier,
    patientName: row.patientName,
    province: row.province,
    result: row.resultType,
    resultDate: row.resultDate,
    sampleDate: row.sampleDate,
    status: row.status,
    testReason: row.testReason,
    viralLoad: row.viralLoad,
  }));
}

function adaptCategoryRows(rows: { category: string; key: string; total: number }[], nextLevel?: GeoDrillDownLevel): GeoDrillDownRow[] {
  const max = Math.max(...rows.map((row) => row.total), 0);
  return rows.map((row) => ({
    id: row.key,
    label: row.category,
    nextLevel,
    percentage: max ? (row.total / max) * 100 : 0,
    value: row.total,
  }));
}

