import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { StackedWithLine, StackedWithLineProps } from "./StackedWithLine";

// Metadata for the component
const meta: Meta<typeof StackedWithLine> = {
  title: "DesignSystem/Atoms/Chart/Apex/StackedWithLine",
  component: StackedWithLine,
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the x-axis categories.",
      control: { type: "object" },
    },
    series: {
      description: "An array of series objects. Bar series are stacked on the left y-axis, line series are plotted on the right y-axis (percentage).",
      control: { type: "object" },
    },
    yLabel: {
      description: "Label for the left y-axis (bar values).",
      control: { type: "text" },
    },
    // yLineLabel: {
    //   description: "Label for the right y-axis (line/percentage values).",
    //   control: { type: "text" },
    // },
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
    lineColor: {
      description: "Color of the reference line.",
      control: { type: "color" },
    },
    lineDashArray: {
      description: "Dash pattern for the reference line. Use 0 for solid line.",
      control: { type: "number" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **StackedWithLine** component renders a mixed chart combining stacked bars with a horizontal reference line using ApexCharts and Material-UI themes.

### Features
- Stacked bar visualization on the left y-axis for grouped data.
- Horizontal reference line on the right y-axis for percentage/threshold values.
- Dual y-axes: left for absolute values, right for percentages (0–100%).
- Supports click events on bars to trigger callbacks.
- Configurable line color and dash pattern.
- Configurable dimensions (\`width\`, \`height\`) and axis labels.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<StackedWithLineProps> = (args: StackedWithLineProps) => <StackedWithLine {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  series: [
    { name: "Positivos", type: "bar", data: [10, 20, 30, 40, 50] },
    { name: "Negativos", type: "bar", data: [15, 25, 35, 45, 55] },
    { name: "Limiar (%)", type: "line", data: [60, 60, 60, 60, 60] },
  ],
  yLabel: "Amostras",
  yLineLabel: "Limiar (%)",
  width: 600,
  height: 400,
  id: "stacked-with-line-chart",
  lineColor: "#FF4560",
  lineDashArray: 5,
};

// Story with varying threshold
export const VaryingThreshold = Template.bind({});
VaryingThreshold.args = {
  labels: ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica"],
  series: [
    { name: "Registadas", type: "bar", data: [300, 400, 200, 500, 350] },
    { name: "Rejeitadas", type: "bar", data: [50, 80, 30, 100, 60] },
    { name: "Taxa Rejeição (%)", type: "line", data: [14.3, 16.7, 13.0, 16.7, 14.6] },
  ],
  yLabel: "Amostras",
  yLineLabel: "Taxa (%)",
  width: "100%",
  height: 450,
  id: "varying-threshold-chart",
  lineColor: "#d62728",
  lineDashArray: 0,
};

// Story with fixed reference line
export const FixedReferenceLine = Template.bind({});
FixedReferenceLine.args = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  series: [
    { name: "Ultra", type: "bar", data: [120, 180, 150, 200] },
    { name: "XDR", type: "bar", data: [80, 60, 90, 70] },
    { name: "Meta (%)", type: "line", data: [75, 75, 75, 75] },
  ],
  yLabel: "Testes",
  yLineLabel: "Meta (%)",
  width: "100%",
  height: 400,
  id: "fixed-reference-chart",
  lineColor: "#2ca02c",
  lineDashArray: 8,
};



    