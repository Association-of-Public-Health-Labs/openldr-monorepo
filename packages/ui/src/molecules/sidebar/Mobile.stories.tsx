import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Mobile, Props } from "./Mobile";
import { IoHome, IoFlask, IoLocation } from "react-icons/io5";

const meta: Meta<typeof Mobile> = {
  title: "DesignSystem/Molecules/Sidebar/Mobile",
  component: Mobile,
  argTypes: {
    options: {
      control: false,
      description: "List of options for the mobile navigation.",
    },
    testEnv: {
      control: { type: "boolean" },
      description: "Enable test environment for positioning indicators.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Mobile** component renders a styled mobile navigation menu. Each menu item can include an icon, label, and active state.

### Features
- Indicator highlights the active item.
- Supports dynamic options.
- Customizable styling with themes.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => <Mobile {...args} />;

export const Default = Template.bind({});
Default.args = {
  testEnv: false,
  options: [
    { icon: <IoHome />, label: "Home", active: true },
    { icon: <IoFlask />, label: "Lab", active: false },
    { icon: <IoLocation />, label: "Locations", active: false },
  ],
};

export const TestEnvironment = Template.bind({});
TestEnvironment.args = {
  testEnv: true,
  options: [
    { icon: <IoHome />, label: "Home", active: true },
    { icon: <IoFlask />, label: "Lab", active: false },
    { icon: <IoLocation />, label: "Locations", active: false },
    { icon: <IoHome />, label: "Dashboard", active: false },
  ],
};

export const CustomOptions = Template.bind({});
CustomOptions.args = {
  testEnv: false,
  options: [
    { icon: <IoHome />, label: "Overview", active: false },
    { icon: <IoFlask />, label: "Experiments", active: true },
    { icon: <IoLocation />, label: "Regions", active: false },
  ],
};
