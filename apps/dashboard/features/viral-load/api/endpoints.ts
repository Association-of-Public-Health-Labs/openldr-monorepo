export const viralLoadSummaryEndpoints = {
  headerIndicatorsByMonth: "/hiv/vl/summary/header_indicators_by_month/",
  numberOfSamplesByMonth: "/hiv/vl/summary/number_of_samples_by_month/",
  samplesHistory: "/hiv/vl/summary/samples_history/",
  suppressionByProvinceByMonth: "/hiv/vl/summary/suppression_by_province_by_month/",
  tatByMonth: "/hiv/vl/summary/tat_by_month/",
  viralSuppressionByMonth: "/hiv/vl/summary/viral_suppression_by_month/",
} as const;

export const viralLoadFacilityEndpoints = {
  registeredSamples: "/hiv/vl/facilities/registered_samples/",
  rejectedSamplesByFacility: "/hiv/vl/facilities/rejected_samples_by_facility/",
  rejectedSamplesByMonth: "/hiv/vl/facilities/rejected_samples_by_month/",
  tatByFacility: "/hiv/vl/facilities/tat_by_facility/",
  tatByMonth: "/hiv/vl/facilities/tat_by_month/",
  testedSamplesBreastfeeding: "/hiv/vl/facilities/tested_samples_breastfeeding/",
  testedSamplesByAgeByFacility: "/hiv/vl/facilities/tested_samples_by_age_by_facility/",
  testedSamplesByAgeByMonth: "/hiv/vl/facilities/tested_samples_by_age_by_month/",
  testedSamplesByFacility: "/hiv/vl/facilities/tested_samples_by_facility/",
  testedSamplesByGenderByFacility: "/hiv/vl/facilities/tested_samples_by_gender_by_facility/",
  testedSamplesByGenderByMonth: "/hiv/vl/facilities/tested_samples_by_gender_by_month/",
  testedSamplesByMonth: "/hiv/vl/facilities/tested_samples_by_month/",
  testedSamplesByTestReasonByFacility: "/hiv/vl/facilities/tested_samples_by_test_reason_by_facility/",
  testedSamplesByTestReasonByMonth: "/hiv/vl/facilities/tested_samples_by_test_reason_by_month/",
  testedSamplesPregnant: "/hiv/vl/facilities/tested_samples_pregnant/",
} as const;

export const viralLoadLaboratoryEndpoints = {
  registeredSamples: "/hiv/vl/laboratories/registered_samples/",
  registeredSamplesByMonth: "/hiv/vl/laboratories/registered_samples_by_month/",
  rejectedSamples: "/hiv/vl/laboratories/rejected_samples/",
  rejectedSamplesByMonth: "/hiv/vl/laboratories/rejected_samples_by_month/",
  suppression: "/hiv/vl/laboratories/suppression/",
  tatByLab: "/hiv/vl/laboratories/tat_by_lab/",
  tatByMonth: "/hiv/vl/laboratories/tat_by_month/",
  testedSamples: "/hiv/vl/laboratories/tested_samples/",
  testedSamplesBreastfeeding: "/hiv/vl/laboratories/tested_samples_breastfeeding/",
  testedSamplesByAge: "/hiv/vl/laboratories/tested_samples_by_age/",
  testedSamplesByGender: "/hiv/vl/laboratories/tested_samples_by_gender/",
  testedSamplesByGenderByLab: "/hiv/vl/laboratories/tested_samples_by_gender_by_lab/",
  testedSamplesByMonth: "/hiv/vl/laboratories/tested_samples_by_month/",
  testedSamplesByTestReason: "/hiv/vl/laboratories/tested_samples_by_test_reason/",
  testedSamplesPregnant: "/hiv/vl/laboratories/tested_samples_pregnant/",
} as const;

export const viralLoadPatientEndpoints = {
  byFacility: "/hiv/vl/patients/by_facility/",
  byName: "/hiv/vl/patients/by_name/",
  byResultType: "/hiv/vl/patients/by_result_type/",
  byTestReason: "/hiv/vl/patients/by_test_reason/",
} as const;
