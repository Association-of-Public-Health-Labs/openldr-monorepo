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
