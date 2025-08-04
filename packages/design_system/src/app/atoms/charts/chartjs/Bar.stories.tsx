import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Bar, type BarProps } from "./Bar";

// Metadata for the component
const meta: Meta<typeof Bar> = {
  title: "DesignSystem/Atoms/Chart/Chartjs/Bar",
  component: Bar,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: "Data for the bar chart, including labels and datasets.",
      control: { type: "object" },
    },
    options: {
      description: "Custom configuration options for the chart.",
      control: { type: "object" },
    },
    height: {
      description: "Height of the chart.",
      control: { type: "number" },
    },
    annotations: {
      description: "Annotations to be displayed on the chart.",
      control: { type: "object" },
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
The **Bar** component renders a bar chart using \`react-chartjs-2\` and \`chart.js\`, integrating seamlessly with Material-UI themes.

### Features
- Fully customizable bar chart with configurable data, options, and annotations.
- Material-UI themed fonts and colors.
- Supports click events on bars to trigger callbacks.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<BarProps> = (args: BarProps) => <Bar {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  data: {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Dataset 1",
        data: [30, 40, 45, 50, 49],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Dataset 2",
        data: [20, 35, 40, 55, 60],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  },
  height: 300,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Sample Bar Chart",
      },
    },
  },
  annotations: {
    line1: {
      type: "line",
      yMin: 50,
      yMax: 50,
      borderColor: "rgba(255, 99, 132, 0.8)",
      borderWidth: 2,
    },
  },
  id: "default-bar-chart",
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  data: {
    labels: ["Category 1", "Category 2", "Category 3", "Category 4"],
    datasets: [
      {
        label: "Sales",
        data: [100, 200, 300, 400],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  },
  height: 400,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Custom Bar Chart",
      },
    },
  },
  annotations: {
    line1: {
      type: "line",
      yMin: 200,
      yMax: 200,
      borderColor: "rgba(75, 192, 192, 0.8)",
      borderWidth: 2,
    },
  },
  id: "custom-bar-chart",
};
