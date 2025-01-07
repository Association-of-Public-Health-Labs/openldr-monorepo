import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MapCard, Props } from "./MapCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Cards/MapCard",
  component: MapCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <MapCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  routes: [
    {
      facilityName: "Health Center A",
      facilityLatitude: -25.9608221,
      facilityLongitude: 32.5688425,
      labName: "Lab B",
      labLatitude: -25.954219,
      labLongitude: 32.606424,
      totalSamples: 120,
      collection_to_hub_reception: 1,
      hub_registration_to_lab_reception: 2,
    },
    {
      facilityName: "Health Center B",
      facilityLatitude: -26.043219,
      facilityLongitude: 32.545624,
      labName: "Lab C",
      labLatitude: -25.958712,
      labLongitude: 32.590123,
      totalSamples: 80,
      collection_to_hub_reception: 1,
      hub_registration_to_lab_reception: 3,
    },
  ],
  redirectPage: "/routes",
};

export const EmptyRoutes = Template.bind({});
EmptyRoutes.args = {
  routes: [],
  redirectPage: "/routes",
};

export const DarkMode = Template.bind({});
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
      <CssBaseline />
      <div style={{ padding: "16px" }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
];
DarkMode.args = {
  routes: [
    {
      facilityName: "Health Center A",
      facilityLatitude: -25.9608221,
      facilityLongitude: 32.5688425,
      labName: "Lab B",
      labLatitude: -25.954219,
      labLongitude: 32.606424,
      totalSamples: 120,
      collection_to_hub_reception: 1,
      hub_registration_to_lab_reception: 2,
    },
  ],
  redirectPage: "/routes",
};
