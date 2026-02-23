import React from "react";
import { Meta, StoryFn } from "@storybook/react";
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
      description: "An array of series objects, each containing a name and data points. Bars are stacked.",
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
    lineValue: {
      description: "The y-axis value where the horizontal reference line is drawn.",
      control: { type: "number" },
    },
    lineLabel: {
      description: "Label displayed on the reference line annotation.",
      control: { type: "text" },
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
The **StackedWithLine** component renders a stacked bar chart with a horizontal annotation line using ApexCharts and Material-UI themes.

### Features
- Stacked bar visualization for grouped data (identical to the Stacked chart).
- Horizontal annotation line for reference/threshold values.
- Supports click events on bars to trigger callbacks.
- Configurable line value, label, color, and dash pattern.
- Configurable dimensions (\`width\`, \`height\`) and y-axis label.
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
    { name: "Positivos", data: [10, 20, 30, 40, 50] },
    { name: "Negativos", data: [15, 25, 35, 45, 55] },
    { name: "Indeterminados", data: [5, 10, 15, 20, 25] },
  ],
  yLabel: "Amostras",
  width: 600,
  height: 400,
  id: "stacked-with-line-chart",
  lineValue: 5,
  lineLabel: "Limiar (5%)",
  lineColor: "#FF4560",
  lineDashArray: 5,
};

// Story with higher threshold
export const HighThreshold = Template.bind({});
HighThreshold.args = {
  labels: ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica"],
  series: [
    { name: "Registadas", data: [300, 400, 200, 500, 350] },
    { name: "Rejeitadas", data: [50, 80, 30, 100, 60] },
  ],
  yLabel: "Amostras",
  width: "100%",
  height: 450,
  id: "high-threshold-chart",
  lineValue: 75,
  lineLabel: "Meta (75%)",
  lineColor: "#2ca02c",
  lineDashArray: 0,
};

// Story with solid line
export const SolidReferenceLine = Template.bind({});
SolidReferenceLine.args = {
  labels: ["Q1", "Q2", "Q3", "Q4"],
  series: [
    { name: "Ultra", data: [120, 180, 150, 200] },
    { name: "XDR", data: [80, 60, 90, 70] },
  ],
  yLabel: "Testes",
  width: "100%",
  height: 400,
  id: "solid-reference-chart",
  lineValue: 100,
  lineLabel: "Limite (100)",
  lineColor: "#d62728",
  lineDashArray: 0,
};
