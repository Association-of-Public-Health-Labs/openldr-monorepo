import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MobileOptions, Props } from "./MobileOptions";
import { IconlyGrid } from '../../atoms/icons/Grid';
import { IconlyLab } from '../../atoms/icons/Lab';
import { IconlyLocation } from '../../atoms/icons/Location';

const meta: Meta<typeof MobileOptions> = {
  title: "DesignSystem/Molecules/Sidebar/MobileOptions",
  component: MobileOptions,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["inherit", "primary", "secondary", "success", "error", "info", "warning"],
      description: "The color of the buttons in the mobile options menu.",
      defaultValue: "primary",
    },
    options: {
      control: false,
      description: "Array of mobile menu options, including icon, label, and active state.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **MobileOptions** component displays a horizontal stack of buttons for mobile navigation. Each button can have an icon, label, and active state.

### Features
- Supports multiple color themes.
- Customizable icons, labels, and active state for each option.
- Horizontal alignment for a compact mobile design.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => <MobileOptions {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: "primary",
  options: [
    { icon: <IconlyGrid size={18} />, label: "Sumario", active: true },
    { icon: <IconlyLab size={18} />, label: "Lab", active: false },
    { icon: <IconlyLocation size={18} />, label: "Provincia", active: false },
  ],
};

export const SecondaryColor = Template.bind({});
SecondaryColor.args = {
  color: "secondary",
  options: [
    { icon: <IconlyGrid size={18} />, label: "Sumario", active: false },
    { icon: <IconlyLab size={18} />, label: "Lab", active: true },
    { icon: <IconlyLocation size={18} />, label: "Provincia", active: false },
  ],
};

export const NoActiveOption = Template.bind({});
NoActiveOption.args = {
  color: "info",
  options: [
    { icon: <IconlyGrid size={18} />, label: "Dashboard", active: false },
    { icon: <IconlyLab size={18} />, label: "Lab", active: false },
    { icon: <IconlyLocation size={18} />, label: "Provincia", active: false },
  ],
};

export const SingleOption = Template.bind({});
SingleOption.args = {
  color: "success",
  options: [{ icon: <IconlyGrid size={18} />, label: "Sumario", active: true }],
};
