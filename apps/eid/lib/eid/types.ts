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
  /** Percentage; null when nothing was tested. */
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
