import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SideBarMenuButton, SideBarMenuButtonProps } from "./SideBarMenuButton";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";

const meta: Meta<typeof SideBarMenuButton> = {
  title: "DesignSystem/Atoms/Inputs/SideBarMenuButton",
  component: SideBarMenuButton,
  tags: ['autodocs'],
  argTypes: {
    color: {
      description: "The color theme for the button.",
      control: {
        type: "select",
        options: ["inherit", "primary", "secondary", "success", "error", "info", "warning"],
      },
    },
    variant: {
      description: "The layout style of the button (row or column).",
      control: {
        type: "select",
        options: ["row", "column"],
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
    width: {
      description: "The width of the button.",
      control: { type: "text" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SideBarMenuButton** component renders a button styled for sidebar navigation. It supports both row and column layouts, custom icons, and active state styling.

### Features
- Configurable color theme, layout style, and active state.
- Optionally display an icon and a label.
- Fully customizable using Material-UI's theming system.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<SideBarMenuButtonProps> = (args) => <SideBarMenuButton {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  color: "primary",
  variant: "column",
  icon: <IoHomeOutline size={20} />,
  label: "Home",
  active: false,
};

// Active story
export const Active = Template.bind({});
Active.args = {
  color: "secondary",
  variant: "row",
  icon: <IoSettingsOutline size={20} />,
  label: "Settings",
  active: true,
};

// Custom Width story
export const CustomWidth = Template.bind({});
CustomWidth.args = {
  color: "info",
  variant: "column",
  icon: <IoHomeOutline size={20} />,
  label: "Dashboard",
  width: "120px",
};
