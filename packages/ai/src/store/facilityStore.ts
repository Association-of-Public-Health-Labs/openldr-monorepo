import { create } from "zustand";

type FacilityStore = {
  provinces: string[];
  districts: string[];
  clinics: string[];
  labTypes: string[];
  labs: string[];
  endpoint: string;
  timeInterval: { startDate: string; endDate: string };
  setProvinces: (provinces: string[]) => void;
  setDistricts: (districts: string[]) => void;
  setClinics: (clinics: string[]) => void;
  setLabTypes: (labTypes: string[]) => void;
  setLabs: (labs: string[]) => void;
  setEndpoint: (endpoint: string) => void;
  setTimeInterval: (timeInterval: { startDate: string; endDate: string }) => void;
};

export const useFacilityStore = create<FacilityStore>((set) => ({
  provinces: [],
  districts: [],
  clinics: [],
  labTypes: [],
  labs: [],
  endpoint: "",
  timeInterval: {
    startDate: "",
    endDate: ""
  },
  setProvinces: (provinces: string[]) => set({ provinces }),
  setDistricts: (districts: string[]) => set({ districts }),
  setClinics: (clinics: string[]) => set({ clinics }),
  setLabTypes: (labTypes: string[]) => set({ labTypes }),
  setLabs: (labs: string[]) => set({ labs }),
  setEndpoint: (endpoint: string) => set({ endpoint }),
  setTimeInterval: (timeInterval: { startDate: string, endDate: string }) => set({ timeInterval }),
}));

