export type ViralLoadPatientSearchMode = "facility" | "name" | "result_type" | "test_reason";

export type ViralLoadPatientSearchFilters = {
  facility: string;
  name: string;
  resultType: string;
  testReason: string;
};

export type ViralLoadPatientRecord = {
  district: string;
  facility: string;
  id: string;
  patientIdentifier: string;
  patientName: string;
  province: string;
  resultDate: string;
  resultType: string;
  sampleDate: string;
  status: string;
  testReason: string;
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
