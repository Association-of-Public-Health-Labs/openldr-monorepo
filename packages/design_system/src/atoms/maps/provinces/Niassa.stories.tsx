import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Niassa, Props } from "./Niassa";

const meta: Meta<typeof Niassa> = {
  title: "DesignSystem/Atoms/Maps/Provinces/Niassa",
  component: Niassa,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The **SVGMap** component displays an interactive map with clickable provinces and tooltips. It highlights provinces and shows additional information via indicators.
        
### Features
- Clickable provinces with customizable tooltips.
- Indicators to display values for each province.
- Theme-aware and styled with MUI.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => <Niassa {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: "500px",
  height: "500px",
  pathDefaultBackgroundColor: "#f0f0f0",
  highlightedColor: "#00B000",
  showIndicators: [true, true],
  dictricts: [
    {
      code: "MZ0100O6",
      ratio: 1,
    },
    {
      code: "MZ0100N8",
      ratio: 0.6,
    },
    {
      code: "MZ0100N7",
      ratio: 0.4,
    },
    {
      code: "MZ0100O2",
      ratio: 0.7,
    },
    {
      code: "MZ0100O3",
      ratio: 0.5,
    },
    
  ],
  districtBorderColor: "#646464",
  districtColorName: "#646464",
};