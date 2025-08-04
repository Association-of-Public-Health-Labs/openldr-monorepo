import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Stacked, type StackedProps } from "./Stacked";

// Metadata for the component
const meta: Meta<typeof Stacked> = {
  title: "DesignSystem/Atoms/Chart/Apex/StackedBar",
  component: Stacked,
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
    yLabel: {
      description: "Label for the y-axis.",
      control: { type: "text" },
    },
    width: {
      description: "Width of the chart.",
      control: { type: "text" },
    },
    height: {
      description: "Height of the chart.",
      control: { type: "text" },
    },
    id: {
      description: "Unique identifier for the chart.",
      control: { type: "text" },
    },
    onClick: {
      description: "Callback triggered when a bar is clicked, returning the label of the clicked bar.",
      action: "clicked",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Stacked** component renders a responsive stacked bar chart using ApexCharts and Material-UI themes.

### Features
- Stacked bar visualization for grouped data.
- Supports click events on bars to trigger callbacks.
- Configurable dimensions (\`width\`, \`height\`) and x-axis/y-axis labels.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<StackedProps> = (args: StackedProps) => <Stacked {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  series: [
    { name: "Group A", data: [10, 20, 30, 40, 50] },
    { name: "Group B", data: [15, 25, 35, 45, 55] },
    { name: "Group C", data: [5, 10, 15, 20, 25] },
  ],
  yLabel: "Values",
  width: 600,
  height: 400,
  id: "stacked-chart",
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Category 1", "Category 2", "Category 3"],
  series: [
    { name: "Sales", data: [300, 400, 500] },
    { name: "Profit", data: [200, 300, 400] },
    { name: "Revenue", data: [100, 200, 300] },
  ],
  yLabel: "Metrics",
  width: "100%",
  height: 450,
  id: "custom-stacked-chart",
};
