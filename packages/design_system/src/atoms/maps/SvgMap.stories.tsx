import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SvgMap, Props } from "./SvgMap";

const meta: Meta<typeof SvgMap> = {
  title: "DesignSystem/Atoms/Maps/SvgMap",
  component: SvgMap,
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

const Template: StoryFn<Props> = (args) => <SvgMap {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: "500px",
  height: "500px",
  pathBackgroundColor: "#f0f0f0",
  showIndicators: [true, true],
  provinces: {
    np: {
      highlighted: true,
      tooltipValues: `<b>Nampula</b><br>Value: 100`,
      values: { 0: 100, 1: 200 },
    },
    gz: {
      highlighted: false,
      tooltipValues: `<b>Gaza</b><br>Value: 80`,
      values: { 0: 80, 1: 160 },
    },
    ib: {
      highlighted: false,
      tooltipValues: `<b>Inhambane</b><br>Value: 50`,
      values: { 0: 50, 1: 100 },
    },
  },
  onClick: (province) => alert(`Province clicked: ${JSON.stringify(province)}`),
};
Default.parameters = {
  docs: {
    description: {
      story: "Displays the default `SVGMap` with interactive provinces and tooltips.",
    },
  },
};

export const HighlightedProvinces = Template.bind({});
HighlightedProvinces.args = {
  width: "600px",
  height: "600px",
  pathBackgroundColor: "#eaeaea",
  showIndicators: [true, false],
  provinces: {
    np: {
      highlighted: true,
      highlightedColor: "#FF5733",
      tooltipValues: `<b>Nampula</b><br>Highlighted Value: 120`,
      values: { 0: 120, 1: 0 },
    },
    cd: {
      highlighted: true,
      highlightedColor: "#33FF57",
      tooltipValues: `<b>Cabo Delgado</b><br>Highlighted Value: 90`,
      values: { 0: 90, 1: 0 },
    },
  },
  onClick: (province) => alert(`Province clicked: ${JSON.stringify(province)}`),
};
HighlightedProvinces.parameters = {
  docs: {
    description: {
      story: "Demonstrates highlighted provinces with custom colors and tooltips.",
    },
  },
};
