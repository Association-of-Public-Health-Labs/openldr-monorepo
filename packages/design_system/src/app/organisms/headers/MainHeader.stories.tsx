import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { MainHeader, type MainHeaderProps } from "./MainHeader";
import { CssBaseline, Typography } from "@mui/material";
import { UserNavigationProps } from "@repo/design_system_mui";

export default {
  title: "DesignSystem/Organisms/Headers/MainHeader",
  component: MainHeader,
  tags: ["autodocs"],
} as Meta;

const user: UserNavigationProps = {
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  email: "jhon.doe@example.com",
};

const settings = {
  contrast: "positive",
  // theme: "light",
};

const Template: StoryFn<MainHeaderProps> = (args) => <MainHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (<Typography variant="h5">Dashboard</Typography>),
  user,
  settings,
  handleSetAppSettings: (newSettings) =>
    console.log("Set App Settings:", newSettings),
  handleOpenSettingsModal: () => console.log("Open Settings Modal"),
};

export const WithoutUser = Template.bind({});
WithoutUser.args = {
  children: (<Typography variant="h5">Dashboard</Typography>),
  user: undefined,
  settings,
  handleSetAppSettings: (newSettings) =>
    console.log("Set App Settings:", newSettings),
  handleOpenSettingsModal: () => console.log("Open Settings Modal"),
};
