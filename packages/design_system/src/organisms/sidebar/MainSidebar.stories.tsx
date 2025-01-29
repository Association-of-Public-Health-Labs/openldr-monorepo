import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MainSidebar, Props } from "./MainSidebar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { action } from "@storybook/addon-actions";

export default {
  title: "DesignSystem/Organisms/Sidebar/MainSidebar",
  component: MainSidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ width: "300px", height: "100vh", background: "#f4f4f4" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <MainSidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: "primary",
  settings: {
    sidebar: "column",
  },
  handleSetAppSettings: action("handleSetAppSettings"),
  options: [
    { label: "Dashboard", icon: <span>D</span>, action: action("Dashboard clicked") },
    { label: "Laboratorio", icon: <span>S</span>, action: action("Settings clicked") },
    { label: "Provincia", icon: <span>L</span>, action: action("Logout clicked"), disabled: false },
  ],
  appName: "MISAU",
  containerProps: {
    sx: {
      boxShadow: 1,
    },
  },
};

export const WithSecondaryColor = Template.bind({});
WithSecondaryColor.args = {
  ...Default.args,
  color: "secondary",
};

export const ExpandedSidebar = Template.bind({});
ExpandedSidebar.args = {
  ...Default.args,
  settings: {
    sidebar: "row",
  },
};
