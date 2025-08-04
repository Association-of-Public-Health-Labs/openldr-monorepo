import React from "react";
import {Meta, StoryFn} from "@storybook/react-vite";
import {Logo, type LogoProps} from "./Logo";

const meta: Meta = {
  title: "DesignSystem/Atoms/Images/Logo",
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      name: "size",
      defaultValue: "small",
    },
    width: {
      name: "width",
      type: "string",
      defaultValue: null,
    }
  }
}

export default meta;

const Template: StoryFn<LogoProps> = args => <Logo {...args} />;

export const Default = Template.bind({});
