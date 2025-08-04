import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SvgDistrictMap, Props } from "./SvgDistrictMap";

const meta: Meta<typeof SvgDistrictMap> = {
  title: "DesignSystem/Atoms/Maps/SvgDistrictMap",
  component: SvgDistrictMap,
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

const Template: StoryFn<Props> = (args) => <SvgDistrictMap {...args} />;

export const Default = Template.bind({});
Default.args = {
  // onClick: (province) => alert(`Province clicked: ${JSON.stringify(province)}`),
};
Default.parameters = {
  docs: {
    description: {
      story: "Displays the default `SVGMap` with interactive provinces and tooltips.",
    },
  },
};




