import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Icon, type MapAtomicIconProps } from "@repo/design_system_mui";

const meta: Meta<typeof Icon> = {
  title: "DesignSystem/Atoms/Maps/Icon",
  component: Icon,
  tags: ["autodocs"],
  decorators: [  
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "relative"
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    highlighted: { control: "boolean" },
    hidden: { control: "boolean" },
    zoom: { control: { type: "number", min: 0, max: 20, step: 1 } },
    color: { control: "color" },
  },
};

export default meta;

const Template: StoryFn<MapAtomicIconProps> = (args: any) => <Icon {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: "#00B000",
};

