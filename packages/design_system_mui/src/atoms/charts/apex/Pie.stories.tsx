import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Pie, PieProps } from "./Pie";

// Metadata for the component
const meta: Meta<typeof Pie> = {
  title: "DesignSystem/Atoms/Chart/Apex/Pie",
  component: Pie,
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the labels for the pie chart.",
      control: { type: "object" }, // Use "object" for arrays
    },
    series: {
      description: "An array of numbers representing the values for each slice of the pie chart.",
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
The **Pie** component renders a pie chart using ApexCharts and Material-UI themes.

### Features
- Displays a pie chart with customizable labels and series.
- Fully responsive and adjusts the legend position for smaller screens.
- Supports configurable dimensions (\`width\`, \`height\`).
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<PieProps> = (args: PieProps) => <Pie {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["Category A", "Category B", "Category C", "Category D"],
  series: [44, 55, 13, 43],
  width: 400,
  height: 400,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Product X", "Product Y", "Product Z"],
  series: [70, 20, 10],
  width: "100%",
  height: 450,
};
