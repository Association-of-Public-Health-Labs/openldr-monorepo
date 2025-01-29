
export type FacilitiesProps = {
  clinics: ClinicProps[]; 
  districts: DistrictProps[]; 
  labs: LabProps[]; 
  pocs: PocProps[];
}

export type ClinicProps = {
  FacilityCode: string; 
  FacilityNationalCode: string;
  FacilityName: string; 
  ProvinceCode: string;
  ProvinceName: string;
  DistrictCode: string;
  DistrictName: string;
  HFStatus: number;
}

export type DistrictProps = {
  DistrictCode: string;
  CountryCode: string;
  CountryName: string;
  ProvinceCode: string;
  ProvinceName: string;
  DistrictName: string;
}

export type LabProps = {
  DateTimeStamp: Date;
  VersionStamp: string;
  LIMSVendorCode: string;
  LabCode: string;
  FacilityCode: string;
  LabName: string;
  LabType: string;
  StaffingLevel: string;
}

export type PocProps = {
  DisaPocCode: string;
  DisaPocName: string;
  DisaPocNationalCode: string;
  DisaPocLabNo: string;
  DisaPocPrefix: string;
  DisaPocProvinceName: string;
  DisapocDistrictName: string;
  DisaPocLicence: string;
}

export type _RouteProps = {
  facilityCode: string,
  facilityName: string,
  facilityLatitude: number,
  facilityLongitude: number,
  limsCode?: string,
  limsName?: string,
  limsLatitude?: number,
  limsLongitude?: number,
  limsTotalSamples?: number,
  limsTat?: number,
  labCode: string,
  labName: string,
  labLatitude: number,
  labLongitude: number,
  labTotalSamples: number,
  labTat: number
}

export type RoutesProps = {
  facilityCode: string;
  facilityName: string;
  facilityLatitude?: number;
  facilityLongitude?: number;
  hubCode?: string | null;
  hubName?: string | null;
  hubLatitude?: number | null;
  hubLongitude?: number | null;
  labCode?: string | null;
  labName?: string | null;
  labLatitude?: number | null;
  labLongitude?: number | null;
  referringFacilityCode?: string | null;
  referringFacilityName?: string | null;
  referringFacilityLatitude?: number | null;
  referringFacilityLongitude?: number | null;
  isDisalink?: string;
  isDisapoc?: string;
  totalSamples?: number;
  referredSamples?: number;
  collection_to_hub_reception?: number;
  hub_registration_to_lab_reception?: number;
}

export type FacilityTypeProps = "lab" | "province" | "district" | "clinic";

export type LabType = "all" | "conventional" | "poc";