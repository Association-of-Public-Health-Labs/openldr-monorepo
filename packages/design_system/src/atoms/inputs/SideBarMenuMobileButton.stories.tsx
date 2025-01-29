import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SideBarMenuMobileButton, SideBarMenuMobileButtonProps } from "./SideBarMenuMobileButton";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";

const meta: Meta<typeof SideBarMenuMobileButton> = {
  title: "DesignSystem/Atoms/Inputs/SideBarMenuMobileButton",
  component: SideBarMenuMobileButton,
  tags: ['autodocs'],
  argTypes: {
    color: {
      description: "The color theme for the button.",
      control: {
        type: "select",
        options: ["inherit", "primary", "secondary", "success", "error", "info", "warning"],
      },
    },
    icon: {
      description: "Icon to display in the button.",
      control: false, // Custom icons should be passed as JSX.
    },
    label: {
      description: "The label text for the button.",
      control: { type: "text" },
    },
    active: {
      description: "If true, the button is highlighted as active.",
      control: { type: "boolean" },
    },
    href: {
      description: "The URL to navigate to when the button is clicked.",
      control: { type: "text" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SideBarMenuMobileButton** component renders a styled button optimized for mobile sidebars. It supports custom icons, labels, and active state styling.

### Features
- Configurable color theme and active state.
- Displays an icon and a label, styled for mobile use.
- Fully customizable using Material-UI's theming system.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<SideBarMenuMobileButtonProps> = (args) => <SideBarMenuMobileButton {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  color: "primary",
  icon: <IoHomeOutline size={20} />,
  label: "Home",
  active: false,
};

// Active story
export const Active = Template.bind({});
Active.args = {
  color: "secondary",
  icon: <IoSettingsOutline size={20} />,
  label: "Settings",
  active: true,
};

// Custom Label story
export const CustomLabel = Template.bind({});
CustomLabel.args = {
  color: "info",
  icon: <IoHomeOutline size={20} />,
  label: "Dashboard",
  href: "/dashboard",
};
