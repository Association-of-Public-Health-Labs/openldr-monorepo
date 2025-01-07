import React from "react";
import {Meta, StoryFn} from "@storybook/react";
import {Logo, Props} from "./Logo";

const meta: Meta = {
  title: "DesignSystem/Atoms/Images/Logo",
  component: Logo,
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

const Template: StoryFn<Props> = args => <Logo {...args} />;

export const Default = Template.bind({});
