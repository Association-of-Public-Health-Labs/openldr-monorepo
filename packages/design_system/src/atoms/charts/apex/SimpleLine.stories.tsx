import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SimpleLine, Props } from "./SimpleLine";

// Metadata for the component
const meta: Meta<typeof SimpleLine> = {
  title: "DesignSystem/Atoms/Chart/Apex/SimpleLine",
  component: SimpleLine,
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the x-axis categories.",
      control: { type: "object" },
    },
    series: {
      description: "An array of series objects, each containing a name and data points.",
      control: { type: "object" },
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
The **SimpleLine** component renders a simple sparkline-style line chart using ApexCharts and Material-UI themes.

### Features
- Minimalistic line chart with no grid, axis labels, or legend.
- Smooth curves for the line with configurable dimensions (\`width\`, \`height\`).
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => <SimpleLine {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  series: [
    { name: "Series 1", data: [10, 15, 25, 30, 20] },
  ],
  width: 400,
  height: 100,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  series: [
    { name: "Visitors", data: [200, 150, 300, 250, 400] },
  ],
  width: "100%",
  height: 120,
};
