/**
 * Row shapes returned by api_openldr_python /hiv/eid/* (origin/dev):
 * hiv/eid/services/eid_services_summary.py and
 * eid_services_facilities.py::facility_key_indicators_service.
 */

export type TatKey =
  | "collection_hub_reception"
  | "hub_reception_hub_registration"
  | "hub_registration_lab_reception"
  | "lab_reception_lab_registration"
  | "lab_registration_analysis"
  | "analysis_validation";

export type TatBracketKey = "lt_7" | "between_7_15" | "between_16_21" | "gt_21" | "no_dates";

export type RejectionKey =
  | "repeat_test"
  | "insufficient_sample"
  | "request_without_sample"
  | "technical_problems"
  | "overlapping_blood"
  | "duplicate_registration"
  | "misidentified_sample"
  | "sample_over_30_days"
  | "other";

export type EquipmentKey = "CAPCTM" | "ALINITY" | "M2000" | "C6800" | "PANTHER" | "MPIMA" | "MANUAL";

export type LabType = "conventional" | "poc";

export type Month = { year: number; month: number; month_name: string };

export type IndicatorsByMonth = Month & {
  registered: number;
  tested: number;
  rejected: number;
  pending: number;
};

export type PositivityByMonth = Month & {
  tested: number;
  positive: number;
  negative: number;
  indeterminate: number;
  conventional_positive: number;
  poc_positive: number;
  /** Percentage, 1 decimal; the API returns 0 (not null) when nothing was tested. */
  positivity: number | null;
};

export type IndicatorsByProvince = {
  province: string | null;
  registered: number;
  tested: number;
  rejected: number;
  pending: number;
  conventional: number;
  poc: number;
  positive: number;
  positivity: number | null;
};

export type KeyIndicators = {
  requesting_facility: string | null;
  registered: number;
  tested: number;
  rejected: number;
  pending: number;
  positive: number;
  positivity: number | null;
};

export type TatByMonth = Month & Record<TatKey, number | null>;

export type TatBracketsByMonth = Month & {
  category: TatKey;
  lt_7: number;
  between_7_15: number;
  between_16_21: number;
  gt_21: number;
  no_dates: number;
};

export type RejectedByMonth = Month & Record<RejectionKey, number> & { total: number };

export type EquipmentByMonth = Month & { tested: number } & Record<EquipmentKey, number>;

/**
 * Lab-level rows (/hiv/eid/laboratories/*). The lab code keys come from Ruling L2 and are optional:
 * an API without them leaves a lab bar undrillable.
 */
export type LabCodes = { testing_facility_code?: string | null };

/** tested_samples/ (lab level, or the drilled province/district/facility rows). */
export type TestedByLab = LabCodes & {
  testing_facility?: string | null;
  requesting_facility?: string | null;
  province?: string | null;
  district?: string | null;
  total: number;
  positive: number;
  negative: number;
};

export type TestedByMonth = Month & { total: number; positive: number; negative: number };

export type RegisteredByMonth = Month & { total: number; conventional: number; poc: number };

/** tat/ (conventional only). */
export type TatByLab = LabCodes &
  Record<TatKey, number | null> & {
    testing_facility?: string | null;
    requesting_facility?: string | null;
    province?: string | null;
    district?: string | null;
  };

/** tat_samples/ (one row per testing lab and segment). */
export type TatBracketsByLab = LabCodes &
  Record<TatBracketKey, number> & {
    testing_facility: string | null;
    category: string;
  };

/** rejected_samples/. */
export type RejectedByLab = Record<RejectionKey, number> & {
  receiving_facility: string | null;
  receiving_facility_code?: string | null;
  total: number;
};

/** samples_by_equipment/. */
export type EquipmentByLab = LabCodes & Record<EquipmentKey, number> & { testing_facility: string | null; tested: number };

/**
 * Facility rows (/hiv/eid/facilities/*). `requesting_facility` carries the place name of whatever
 * level the request asked for (province, district or health facility). By-month variants add the month.
 */
export type FacilityName = { requesting_facility: string | null };

export type RegisteredByFacility = FacilityName & { total: number; conventional: number; poc: number };
export type RegisteredByFacilityByMonth = Month & { total: number; conventional: number; poc: number };

export type TestedByFacility = FacilityName & { total: number; conventional: number; poc: number; positive: number; negative: number };
export type TestedByFacilityByMonth = Month & { total: number; conventional: number; poc: number; positive: number; negative: number };

type GenderCounts = { male_positive: number; male_negative: number; female_positive: number; female_negative: number };
export type GenderByFacility = FacilityName & GenderCounts;
export type GenderByFacilityByMonth = Month & GenderCounts;

export type TatAvgByFacility = FacilityName & Record<TatKey, number | null>;
export type TatAvgByFacilityByMonth = Month & Record<TatKey, number | null>;

export type TatDaysByFacility = FacilityName & { category: TatKey } & Record<TatBracketKey, number>;
export type TatDaysByFacilityByMonth = Month & { category: TatKey } & Record<TatBracketKey, number>;

export type RejectedByFacility = FacilityName & Record<RejectionKey, number> & { total: number };
export type RejectedByFacilityByMonth = RejectedByMonth;
