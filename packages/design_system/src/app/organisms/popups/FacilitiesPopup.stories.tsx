import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { FacilitiesPopup, type FacilitiesPopupProps } from "./FacilitiesPopup";

export default {
  title: "DesignSystem/Organisms/Popups/FacilitiesPopup",
  component: FacilitiesPopup,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <div style={{ padding: "20px" }}>
          <Story />
        </div>
      );
    },
  ],
} as Meta;

const Template: StoryFn<FacilitiesPopupProps> = (args) => <FacilitiesPopup {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  facilities: {
    clinics: [
      {
        FacilityCode: "CL001",
        FacilityNationalCode: "NCL001",
        FacilityName: "Clinic A",
        ProvinceCode: "P001",
        ProvinceName: "Province A",
        DistrictCode: "D001",
        DistrictName: "District A",
        HFStatus: 1,
      },
    ],
    districts: [
      {
        DistrictCode: "D001",
        CountryCode: "C001",
        CountryName: "Country A",
        ProvinceCode: "P001",
        ProvinceName: "Province A",
        DistrictName: "District A",
      },
    ],
    labs: [],
    pocs: [],
  },
  handleSubmit: (facilities, facilityType, dates) =>
    console.log("Selected Facilities:", facilities, "Type:", facilityType, "Dates:", dates),
  initialDates: [
    "2024-01-01",
    "2024-12-31"
  ],
  onClose: () => console.log("FacilitiesPopup Closed"),
  isMulti: true,
};

export const PreselectedDistricts = Template.bind({});
PreselectedDistricts.args = {
  open: true,
  facilities: {
    clinics: [
      {
        FacilityCode: "CL002",
        FacilityNationalCode: "NCL002",
        FacilityName: "Clinic B",
        ProvinceCode: "P002",
        ProvinceName: "Province B",
        DistrictCode: "D002",
        DistrictName: "District B",
        HFStatus: 1,
      },
    ],
    districts: [
      {
        DistrictCode: "D002",
        CountryCode: "C002",
        CountryName: "Country B",
        ProvinceCode: "P002",
        ProvinceName: "Province B",
        DistrictName: "District B",
      },
    ],
    labs: [],
    pocs: [],
  },
  handleSubmit: (facilities, facilityType, dates) =>
    console.log("Selected Facilities:", facilities, "Type:", facilityType, "Dates:", dates),
  initialDates: ["2024-01-01", "2024-12-31"],
  defaultFacilities: [
    { value: "D002", label: "District B" },
  ],
  defaultFacilityType: "district",
  onClose: () => console.log("FacilitiesPopup Closed"),
};

export const ClinicsOnly = Template.bind({});
ClinicsOnly.args = {
  open: true,
  facilities: {
    clinics: [
      {
        FacilityCode: "CL003",
        FacilityNationalCode: "NCL003",
        FacilityName: "Clinic C",
        ProvinceCode: "P003",
        ProvinceName: "Province C",
        DistrictCode: "D003",
        DistrictName: "District C",
        HFStatus: 1,
      },
    ],
    districts: [],
    labs: [],
    pocs: [],
  },
  handleSubmit: (facilities, facilityType, dates) => 
    console.log("Selected Facilities:", facilities, "Type:", facilityType, "Dates:", dates),
  onClose: () => console.log("FacilitiesPopup Closed"),
  isMulti: false,
};
