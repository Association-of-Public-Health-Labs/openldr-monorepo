import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MainHeader, Props } from "./MainHeader";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { SettingsProps } from "../../types/global";
import { UserProps } from "../../molecules/headers/UserNavigation";

export default {
  title: "DesignSystem/Organisms/Headers/MainHeader",
  component: MainHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px", maxWidth: "800px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const user: UserProps = {
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  email: "jhon.doe@example.com",
};

const settings: SettingsProps = {
  contrast: "positive",
  // theme: "light",
};

const Template: StoryFn<Props> = (args) => <MainHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  pagename: "Dashboard",
  user,
  settings,
  handleSetAppSettings: (newSettings: SettingsProps) =>
    console.log("Set App Settings:", newSettings),
  handleOpenSettingsModal: () => console.log("Open Settings Modal"),
};

export const WithoutUser = Template.bind({});
WithoutUser.args = {
  pagename: "Reports",
  user: undefined,
  settings,
  handleSetAppSettings: (newSettings: SettingsProps) =>
    console.log("Set App Settings:", newSettings),
  handleOpenSettingsModal: () => console.log("Open Settings Modal"),
};

export const DarkMode = Template.bind({});
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
      <CssBaseline />
      <div style={{ padding: "16px", maxWidth: "800px" }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
];
DarkMode.args = {
  pagename: "Settings",
  user,
  settings: {
    contrast: "negative",
    theme: "dark",
  },
  handleSetAppSettings: (newSettings: SettingsProps) =>
    console.log("Set App Settings:", newSettings),
};
