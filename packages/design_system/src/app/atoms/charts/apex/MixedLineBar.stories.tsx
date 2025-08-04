import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { MixedLineBar, type MixedLineBarProps } from "./MixedLineBar";

// Metadata for the component
const meta: Meta<typeof MixedLineBar> = {
  title: "DesignSystem/Atoms/Chart/Apex/MixedLineBar",
  component: MixedLineBar,
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the x-axis categories.",
      control: { type: "object" }, // Use "object" for arrays
    },
    series: {
      description: "An array of series data, each containing a name, type ('line' or 'bar'), and data points.",
      control: { type: "object" }, // Use "object" for complex data structures
    },
    width: {
      description: "Width of the chart.",
      control: { type: "text" },
    },
    height: {
      description: "Height of the chart.",
      control: { type: "text" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **MixedLineBar** component renders a responsive mixed chart with both line and bar series using ApexCharts and Material-UI themes.

### Features
- Configurable x-axis categories and multiple y-axis configurations.
- Mixed series types (line and bar) for combined visualizations.
- Adjustable dimensions (\`width\`, \`height\`).
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<MixedLineBarProps> = (args) => <MixedLineBar {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["January", "February", "March", "April", "May"],
  series: [
    { name: "Bar Series", type: "bar", data: [30, 40, 45, 50, 49] },
    { name: "Line Series", type: "line", data: [20, 30, 35, 40, 38] },
  ],
  width: 600,
  height: 400,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  series: [
    { name: "Sales", type: "bar", data: [100, 200, 150, 300, 250] },
    { name: "Profit", type: "line", data: [80, 170, 120, 270, 220] },
  ],
  width: "100%",
  height: 500,
};
