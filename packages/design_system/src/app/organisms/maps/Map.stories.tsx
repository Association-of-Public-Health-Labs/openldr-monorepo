import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { Map, type MapProps } from "./Map";
// import { FacilitiesProps, RoutesProps } from "../../types/facilities";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { FiEdit2 } from "react-icons/fi";

export default {
  title: "DesignSystem/Organisms/Maps/Map",
  component: Map,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const facilities = {
  clinics: [],
  districts: [],
  labs: [
    {
      DateTimeStamp: new Date(),
      VersionStamp: "v1",
      LIMSVendorCode: "L001",
      LabCode: "LAB001",
      FacilityCode: "FAC001",
      LabName: "Central Lab",
      LabType: "conventional",
      StaffingLevel: "High",
    },
    {
      DateTimeStamp: new Date(),
      VersionStamp: "v2",
      LIMSVendorCode: "L002",
      LabCode: "LAB002",
      FacilityCode: "FAC002",
      LabName: "Regional Lab",
      LabType: "conventional",
      StaffingLevel: "Medium",
    },
  ],
  pocs: [],
};

const routes = [
  {
    facilityLatitude: -25.9608,
    facilityLongitude: 32.5737,
    facilityName: "Health Facility A",
    facilityCode: "HF001",
    labLatitude: -25.9686,
    labLongitude: 32.5703,
    labName: "Lab A",
    labCode: "LAB001",
    hubLatitude: -25.9650,
    hubLongitude: 32.5782,
    hubName: "Hub A",
    hubCode: "HUB001",
    totalSamples: 500,
    // pendingSamples: 100,
    // rejectedSamples: 50,
  },
];

const Template: StoryFn<MapProps> = (args: MapProps) => <Map {...args} />;

export const Default = Template.bind({});
Default.args = {
  routes,
  facilities,
};

export const WithAdditionalOptions = Template.bind({});
WithAdditionalOptions.args = {
  routes,
  facilities,
  additionalOptions: [
    {
      label: "View Details",
      icon: <FiEdit2 size={18} />,
      action: () => console.log("View Details clicked"),
    },
    {
      label: "Download Report",
      action: () => console.log("Download Report clicked"),
    },
  ],
};

export const WithoutRoutes = Template.bind({});
WithoutRoutes.args = {
  routes: [],
  facilities,
};

export const WithoutFacilities = Template.bind({});
WithoutFacilities.args = {
  routes,
  facilities: { clinics: [], districts: [], labs: [], pocs: [] },
};
