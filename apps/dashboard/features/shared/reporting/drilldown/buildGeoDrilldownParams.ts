export type GeoDrilldownInCardLevel = "district" | "facility" | "province";

export type GeoDrilldownFacilityType = "district" | "health_facility" | "province";

export type GeoDrilldownParams = {
  disaggregation: boolean;
  district?: string[];
  facilityType: GeoDrilldownFacilityType;
  healthFacility?: string;
  province?: string[];
};

type BuildGeoDrilldownParamsOptions = {
  level: GeoDrilldownInCardLevel;
  selectedDistrict?: string;
  selectedFacility?: string;
  selectedProvince?: string;
};

export function buildGeoDrilldownParams({
  level,
  selectedDistrict,
  selectedFacility,
  selectedProvince,
}: BuildGeoDrilldownParamsOptions): GeoDrilldownParams {
  if (level === "district") {
    return {
      disaggregation: true,
      facilityType: "province",
      province: selectedProvince ? [selectedProvince] : undefined,
    };
  }

  if (level === "facility") {
    return {
      disaggregation: true,
      district: selectedDistrict ? [selectedDistrict] : undefined,
      facilityType: "district",
      healthFacility: selectedFacility,
      province: selectedProvince ? [selectedProvince] : undefined,
    };
  }

  return {
    disaggregation: false,
    facilityType: "province",
  };
}
