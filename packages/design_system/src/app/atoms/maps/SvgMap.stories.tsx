import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { SvgMap, type SvgMapProps } from "./SvgMap";

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

const Template: StoryFn<SvgMapProps> = (args) => <SvgMap {...args} />;

export const Default = Template.bind({});
Default.args = {
  width: "500px",
  height: "500px",
  pathDefaultBackgroundColor: "#f0f0f0",
  highlightedColor: "#00B000",
  showIndicators: [true, true],
  provinces: {
    np: {
      ratio: 1,
    },
    gz: {
      ratio: 0.4,
    },
    ib: {
      ratio: 0.2,
    },
    mp: {
      ratio: 0.1,
    },
    tt: {
      ratio: 0.3,
    },
    mn: {
      ratio: 0.5,
    },
    sf: {
      ratio: 0.6,
    },
    zb: {
      ratio: 0.7, 
    },
    ns: {
      ratio: 0.8,
    },
    cd: {
      ratio: 0.9,
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
  // pathBackgroundColor: "#eaeaea",
  showIndicators: [true, false],
  hideNames: true,
  useShortName: true,
  provinces: {
    np: {
      highlighted: true,
      highlightedColor: "#FF5733",
      // tooltipValues: `<b>Nampula</b><br>Highlighted Value: 120`,
      // values: { 0: 120, 1: 0 },
    },
    cd: {
      highlighted: true,
      highlightedColor: "#33FF57",
      // tooltipValues: `<b>Cabo Delgado</b><br>Highlighted Value: 90`,
      // values: { 0: 90, 1: 0 },
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
