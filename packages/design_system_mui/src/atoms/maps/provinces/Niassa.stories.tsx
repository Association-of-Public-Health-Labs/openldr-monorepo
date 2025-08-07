import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Niassa, Props } from "./Niassa6";

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
  // highlightedDistricts: ["MZ0100O6", "MZ0100N8", "MZ0100N7", "MZ0100O2", "MZ0100O3"],
  onDistrictClick: (districtName) => {
    console.log("districtName", districtName)
  },
  pathDefaultBackgroundColor: "#f0f0f0",
  pathDefaultStrokeColor: "#333",
  highlightedColor: "#00B000",
  districtRatios: {
    'MZ0100O6': 0.6, 
    'MZ0100N8': 0.3,
    'MZ0100N5': 0.8,
    'MZ0100N2': 0.1,
    'MZ0100N7': 0.9, 
  }
}
