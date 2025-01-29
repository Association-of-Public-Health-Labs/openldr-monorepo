import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Line, Props } from "./Line";

// Metadata for the component
const meta: Meta = {
  title: "DesignSystem/Atoms/Chart/Apex/Line",
  component: Line,
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the x-axis categories.",
      control: { type: "object" },
    },
    series: {
      description: "An array of series data for the chart, each containing a name and data points.",
      control: "object",
    },
    yLabel: {
      description: "Label for the y-axis.",
      control: "text",
    },
    width: {
      description: "Width of the chart.",
      control: "text",
    },
    height: {
      description: "Height of the chart.",
      control: "text",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Line** component renders a responsive line chart using ApexCharts and Material-UI themes.

### Features
- Configurable x-axis and y-axis.
- Smooth stroke for the line.
- Adjustable dimensions (\`width\`, \`height\`).
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => <Line {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["January", "February", "March", "April", "May"],
  series: [
    { name: "Series 1", data: [10, 20, 15, 30, 25] },
    { name: "Series 2", data: [5, 15, 10, 20, 18] },
  ],
  yLabel: "Values",
  width: 600,
  height: 400,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  series: [
    { name: "Sales", data: [100, 200, 150, 300, 250] },
    { name: "Revenue", data: [80, 170, 120, 270, 220] },
  ],
  yLabel: "Metrics",
  width: "100%",
  height: 500,
};
