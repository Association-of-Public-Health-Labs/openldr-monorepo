import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Routes } from "./Routes";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Maps/Routes",
  component: Routes,
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

const mockRoutes = [
  {
    facilityLatitude: -25.9608,
    facilityLongitude: 32.5737,
    facilityName: "Facility A",
    facilityCode: "FAC001",
    labLatitude: -25.9686,
    labLongitude: 32.5703,
    labName: "Lab A",
    labCode: "LAB001",
  },
  {
    facilityLatitude: -26.0123,
    facilityLongitude: 32.6111,
    facilityName: "Facility B",
    facilityCode: "FAC002",
    labLatitude: -26.0156,
    labLongitude: 32.6200,
    labName: "Lab B",
    labCode: "LAB002",
  },
];

const Template: StoryFn = () => <Routes />;

export const Default = Template.bind({});
Default.args = {};

export const WithRoutes = Template.bind({});
WithRoutes.decorators = [
  (Story) => {
    return (
      <Routes />
    );
  },
];
