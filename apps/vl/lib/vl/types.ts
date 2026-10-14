/** Row shapes returned by api_openldr_python /hiv/vl/* (branch feat/vl-api-parity). */

export type MonthKey = { year: number; month: number; month_name: string };
export type CvCounts = { suppressed: number; not_suppressed: number };
export type GenderCounts = {
  male_suppressed: number;
  male_not_suppressed: number;
  female_suppressed: number;
  female_not_suppressed: number;
};
export type TatValues = {
  collection_reception: number | null;
  reception_registration: number | null;
  registration_analysis: number | null;
  analysis_validation: number | null;
};

// summary
export type SamplesByMonth = MonthKey & { total: number };
export type SuppressionByMonth = MonthKey & CvCounts & { total: number };
export type TatByMonth = MonthKey & TatValues;
export type SuppressionByProvince = CvCounts & {
  province: string | null;
  total: number;
  routine: number;
  treatment_failure: number;
  reason_not_specified: number;
};
export type IndicatorsByMonth = MonthKey & {
  registered: number;
  tested: number;
  suppressed: number;
  rejected: number;
  non_validated: number;
};
export type TatVsDisalinks = { semester: string; disalinks: number; tat: number };

// laboratories
export type TestedByLab = CvCounts & { testing_facility: string; total: number };
export type TestedByMonth = MonthKey & CvCounts & { total: number };
export type TatByLab = TatValues & { testing_facility: string };
export type RejectedByLab = { lab_code: string; testing_facility: string; total: number };
export type RejectedByMonth = MonthKey & { total: number };

// facilities
export type FacilityRow = { requesting_facility: string };
export type RegisteredByFacility = FacilityRow & { total: number };
export type TestedByFacility = FacilityRow & CvCounts & { total: number };
export type GenderByFacility = FacilityRow & GenderCounts & { total: number };
export type GenderByMonth = MonthKey & GenderCounts & { total: number };
export type TatByFacility = FacilityRow & TatValues;
export type AgeByFacility = FacilityRow & CvCounts & { age_group: string; total: number };
export type TestReasonByFacility = FacilityRow & {
  routine: number;
  treatment_failure: number;
  reason_not_specified: number;
  total: number;
};
