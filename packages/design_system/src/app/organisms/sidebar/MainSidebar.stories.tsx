import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { MainSidebar, MainSidebarProps } from "./MainSidebar";
// @ts-ignore
import { action } from "@storybook/addon-actions";
import { IconlyGrid } from '../../atoms/icons/Grid';
import { IconlyLab } from '../../atoms/icons/Lab';
import { IconlyLocation } from '../../atoms/icons/Location';

export default {
  title: "DesignSystem/Organisms/Sidebar/MainSidebar",
  component: MainSidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "100%", maxWidth: "215px"}}>
        <Story />
      </div>
    ),
  ],
} as Meta;

const Template: StoryFn<MainSidebarProps> = (args: MainSidebarProps) => <MainSidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: "primary",
  settings: {
    sidebar: "column",
  },
  handleSetAppSettings: action("handleSetAppSettings"),
  options: [
    { label: "Dashboard", icon: <IconlyGrid/>, action: action("Dashboard clicked"), active: true},
    { label: "Laboratorio", icon: <IconlyLab/>, action: action("Settings clicked") },
    { label: "Provincia", icon: <IconlyLocation/>, action: action("Logout clicked") },
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
