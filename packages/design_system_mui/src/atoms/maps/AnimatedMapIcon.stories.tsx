import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { AnimatedMapIcon, AnimatedMapIconProps } from "./AnimatedMapIcon";

const meta: Meta<typeof AnimatedMapIcon> = {
  title: "DesignSystem/Atoms/Maps/AnimatedMapIcon",
  component: AnimatedMapIcon,
  tags: ['autodocs'],
  decorators: [  
    (Story) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vh",
          backgroundColor: "#f0f0f0",
          position: "relative"
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: { control: "color" },
    close: { control: "boolean" },
    pulse: { control: "boolean" },
  },
};

export default meta;

const Template: StoryFn<AnimatedMapIconProps> = (args: AnimatedMapIconProps) => <AnimatedMapIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: "#00B000",
  close: false,
  pulse: false,
};

export const Pulsing = Template.bind({});
Pulsing.args = {
  color: "#FF0000",
  close: false,
  pulse: true,
};

export const Closed = Template.bind({});
Closed.args = {
  color: "#0000FF",
  close: true,
  pulse: false,
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  color: "#FFA500",
  close: false,
  pulse: true,
};

export const Clickable = Template.bind({});
Clickable.args = {
  color: "#800080",
  close: false,
  pulse: true,
  onClick: () => alert("Icon clicked!"),
};
