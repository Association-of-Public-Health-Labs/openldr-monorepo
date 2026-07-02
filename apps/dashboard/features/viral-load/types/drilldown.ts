import type {
  DemographicDimension,
  GeoDrillDownLevel,
  GeoDrillDownRow,
  PatientDrillDownRow,
  ReportActionDateRange,
} from "../../shared/reporting";
import type { ViralLoadDateInterval } from "./common";
import type { ViralLoadFacilityLevel, VlFacilityAgeResponse, VlFacilityGenderResponse, VlFacilityMetricResponse, VlFacilityTestReasonResponse } from "./facility";
import type { ViralLoadPatientRecord } from "./patients";

export type ViralLoadGeoDrillDownRequest = {
  demographicDimension?: DemographicDimension;
  district?: string;
  facility?: string;
  interval: ViralLoadDateInterval;
  level: GeoDrillDownLevel;
  province?: string;
  token: string;
};

export type ViralLoadGeoRowsRequest = ViralLoadGeoDrillDownRequest & {
  facilityType: ViralLoadFacilityLevel;
};

export type ViralLoadGeoDrillDownData = {
  rows: GeoDrillDownRow[];
  patients?: PatientDrillDownRow[];
};

export type ViralLoadGeoRawRows =
  | VlFacilityAgeResponse[]
  | VlFacilityGenderResponse[]
  | VlFacilityMetricResponse[]
  | VlFacilityTestReasonResponse[];

export type ViralLoadPatientDrillDownSource = ViralLoadPatientRecord;

export type ViralLoadGeoDrillDownState = {
  dateRange: ReportActionDateRange;
  demographicDimension: DemographicDimension;
  district?: string;
  facility?: string;
  level: GeoDrillDownLevel;
  province?: string;
};

