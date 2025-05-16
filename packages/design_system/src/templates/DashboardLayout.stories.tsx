import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DashboardLayout } from "./DashboardLayout";

import { IconlyGrid } from '../atoms/icons/Grid';
import { IconlyLab } from '../atoms/icons/Lab';
import { IconlyLocation } from '../atoms/icons/Location';

const meta: Meta<typeof DashboardLayout> = {
  title: "DesignSystem/Templates/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs"],
  argTypes: {
    expanded: {
      control: "boolean",
      defaultValue: false,
    },
    stacked: {
      control: "boolean",
      defaultValue: false,
    },
    options: {
      control: "object",
      defaultValue: [],
    },
    children: {
      control: false,
    },
  },
};

const options = [
  { label: "Dashboard", icon: <IconlyGrid/>, action: () => {}, active: true},
  { label: "Laboratorio", icon: <IconlyLab/>, action: () => {} },
  { label: "Provincia", icon: <IconlyLocation/>, action: () => {} },
]

export default meta;
type Story = StoryObj<typeof DashboardLayout>;

export const Sidebar: Story = {
  args: {
    expanded: false,
    stacked: false,
    options: options,
    children: <div>Sidebar Layout Content</div>,
  },
};

export const SidebarExpanded: Story = {
  args: {
    expanded: true,
    stacked: false,
    options: options,
    children: <div>Sidebar Expanded Layout Content</div>,
  },
};

export const StackedHeader: Story = {
  args: {
    expanded: false, // Not used in stacked mode, but required by prop
    stacked: true,
    options: options,
    children: <div>Stacked Header Layout Content</div>,
  },
};