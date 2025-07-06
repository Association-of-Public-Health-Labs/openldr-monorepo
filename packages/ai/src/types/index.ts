
export type FacilityType = "lab" | "province" | "district" | "clinic" | "national";

export type DashboardType = "tb" | "vl" | "eid";

export interface TimeInterval {
  startDate: string;
  endDate: string;
  isDefault: boolean;
}