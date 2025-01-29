import { Meta, StoryFn } from "@storybook/react";
import { MapDrawer, Props } from "./MapDrawer";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Molecules/Maps/MapDrawer",
  component: MapDrawer,
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

const Template: StoryFn<Props> = (args) => <MapDrawer {...args} />;

export const Default = Template.bind({});
Default.args = {
  openMapDrawer: true,
  onClose: () => console.log("Drawer closed"),
  route: {
    facilityName: "Facility 1",
    facilityCode: "FAC1",
    hubName: "Hub 1",
    hubCode: "HUB1",
    labName: "Lab 1",
    labCode: "LAB1",
    totalSamples: 120,
    collection_to_hub_reception: 2,
    hub_registration_to_lab_reception: 3,
  },
};

export const WithoutHub = Template.bind({});
WithoutHub.args = {
  openMapDrawer: true,
  onClose: () => console.log("Drawer closed"),
  route: {
    facilityName: "Facility 2",
    facilityCode: "FAC2",
    labName: "Lab 2",
    labCode: "LAB2",
    totalSamples: 75,
    collection_to_hub_reception: 1,
    hub_registration_to_lab_reception: 2,
  },
};

export const Closed = Template.bind({});
Closed.args = {
  openMapDrawer: false,
  onClose: () => console.log("Drawer closed"),
  route: {
    facilityName: "Facility 3",
    facilityCode: "FAC3",
    hubName: "Hub 3",
    hubCode: "HUB3",
    labName: "Lab 3",
    labCode: "LAB3",
    totalSamples: 50,
    collection_to_hub_reception: 2,
    hub_registration_to_lab_reception: 1,
  },
};
