export type ViralLoadPatientSearchMode = "facility" | "name" | "result_type" | "test_reason";

export type ViralLoadPatientSearchFilters = {
  facility: string;
  name: string;
  resultType: string;
  testReason: string;
};

export type ViralLoadPatientDrilldownFilters = {
  identifier: string;
  name: string;
  resultType: string;
  testReason: string;
};

export type ViralLoadPatientRow = {
  name: string;
  identifier: string;
  ageInYears?: number | string | null;
  requestingFacilityName?: string | null;
  testingFacilityName?: string | null;
  province?: string | null;
  district?: string | null;
  specimenSourceCode?: string | null;
  specimenSourceDesc?: string | null;
  specimenDatetime?: string | null;
  registeredDatetime?: string | null;
  analysisDatetime?: string | null;
  authorisedDatetime?: string | null;
  finalViralLoadResult?: string | null;
  viralLoadResultCategory?: string | null;
  testReason?: string | null;
  rejectionCode?: string | null;
  rejectionDesc?: string | null;
  artRegimen?: string | null;
};

export type ViralLoadPatientRecord = ViralLoadPatientRow & {
  facility: string;
  id: string;
  patientIdentifier: string;
  patientName: string;
  resultDate: string;
  resultType: string;
  sampleDate: string;
  status: string;
  viralLoad: string;
};

export type ViralLoadPatientsPagination = {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
};

export type ViralLoadPatientsResult = {
  data: ViralLoadPatientRecord[];
  pagination: ViralLoadPatientsPagination;
};

export type ViralLoadPatientsSearchResult =
  | (ViralLoadPatientsResult & {
      ok: true;
    })
  | {
      data: ViralLoadPatientRecord[];
      error: string;
      ok: false;
      pagination: ViralLoadPatientsPagination;
    };

export type VlPatientRawRecord = Record<string, unknown>;

export type VlPatientsRawResponse =
  | VlPatientRawRecord[]
  | {
      code?: number;
      data?: VlPatientRawRecord[];
      message?: string;
      page?: number;
      per_page?: number;
      status?: string;
      total_count?: number;
      total_pages?: number;
    };
