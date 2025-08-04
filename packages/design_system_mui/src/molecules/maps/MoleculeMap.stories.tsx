import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MoleculeMap, MoleculeMapProps } from "./MoleculeMap";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Molecules/Maps/Map",
  component: MoleculeMap,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ height: "100vh", width: "100%" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<MoleculeMapProps> = (args: MoleculeMapProps) => <MoleculeMap {...args} />;

export const Default = Template.bind({});
Default.args = {
  routes: [
    {
      facilityLatitude: -25.9608221,
      facilityLongitude: 32.5688425,
      facilityName: "Facility 1",
      facilityCode: "FAC1",
      hubLatitude: -25.9607221,
      hubLongitude: 32.5687425,
      hubName: "Hub 1",
      hubCode: "HUB1",
      labLatitude: -25.9609221,
      labLongitude: 32.5689425,
      labName: "Lab 1",
      labCode: "LAB1",
      totalSamples: 120,
    },
    {
      facilityLatitude: -25.9708221,
      facilityLongitude: 32.5788425,
      facilityName: "Facility 2",
      facilityCode: "FAC2",
      hubLatitude: -25.9707221,
      hubLongitude: 32.5787425,
      hubName: "Hub 2",
      hubCode: "HUB2",
      labLatitude: -25.9709221,
      labLongitude: 32.5789425,
      labName: "Lab 2",
      labCode: "LAB2",
      totalSamples: 150,
    },
  ],
  hideZoomControls: false,
};

export const NoZoomControls = Template.bind({});
NoZoomControls.args = {
  ...Default.args,
  hideZoomControls: true,
};

export const MultipleRoutes = Template.bind({});
MultipleRoutes.args = {
  routes: [
    {
      facilityLatitude: -25.9608221,
      facilityLongitude: 32.5688425,
      facilityName: "Facility A",
      facilityCode: "FAC-A",
      hubLatitude: -25.9607221,
      hubLongitude: 32.5687425,
      hubName: "Hub A",
      hubCode: "HUB-A",
      labLatitude: -25.9609221,
      labLongitude: 32.5689425,
      labName: "Lab A",
      labCode: "LAB-A",
      totalSamples: 300,
    },
    {
      facilityLatitude: -26.0608221,
      facilityLongitude: 32.6688425,
      facilityName: "Facility B",
      facilityCode: "FAC-B",
      hubLatitude: -26.0607221,
      hubLongitude: 32.6687425,
      hubName: "Hub B",
      hubCode: "HUB-B",
      labLatitude: -26.0609221,
      labLongitude: 32.6689425,
      labName: "Lab B",
      labCode: "LAB-B",
      totalSamples: 500,
    },
  ],
  hideZoomControls: false,
};
