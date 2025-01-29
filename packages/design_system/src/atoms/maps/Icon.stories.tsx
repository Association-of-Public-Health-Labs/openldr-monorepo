import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Icon, Props } from "./Icon";

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

const Template: StoryFn<Props> = (args) => <Icon {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: "Default Icon",
  onClick: () => alert("Icon clicked"),
  highlighted: false,
  hidden: false,
  zoom: 5,
  color: "#00B000",
};

export const Highlighted = Template.bind({});
Highlighted.args = {
  name: "Highlighted Icon",
  onClick: () => alert("Highlighted Icon clicked"),
  highlighted: true,
  hidden: false,
  zoom: 10,
  color: "#FF0000",
};

export const Hidden = Template.bind({});
Hidden.args = {
  name: "Hidden Icon",
  onClick: () => alert("Hidden Icon clicked"),
  highlighted: false,
  hidden: true,
  zoom: 5,
  color: "#0000FF",
};

export const ZoomedIn = Template.bind({});
ZoomedIn.args = {
  name: "Zoomed-In Icon",
  onClick: () => alert("Zoomed-In Icon clicked"),
  highlighted: false,
  hidden: false,
  zoom: 12,
  color: "#FFA500",
};

export const ZoomedOut = Template.bind({});
ZoomedOut.args = {
  name: "Zoomed-Out Icon",
  onClick: () => alert("Zoomed-Out Icon clicked"),
  highlighted: false,
  hidden: false,
  zoom: 3,
  color: "#800080",
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  name: "Custom Color Icon",
  onClick: () => alert("Custom Color Icon clicked"),
  highlighted: true,
  hidden: false,
  zoom: 8,
  color: "#008080",
};
