import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ChartjsLine, ChartjsLineProps } from "./Line";

// Metadata for the component
const meta: Meta<typeof ChartjsLine> = {
  title: "DesignSystem/Atoms/Chart/Chartjs/Line",
  component: ChartjsLine,
  tags: ['autodocs'],
  argTypes: {
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
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Line** component renders a responsive line chart using \`react-chartjs-2\` and \`chart.js\`, integrating seamlessly with Material-UI themes.

### Features
- Smooth gradient fill under the line with custom tooltips and styles.
- Material-UI themed fonts and colors for consistent styling.
- Responsive design with configurable dimensions and annotations.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<ChartjsLineProps> = (args: ChartjsLineProps) => <ChartjsLine {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  height: 300,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Sample Line Chart",
      },
      legend: {
        display: true,
        position: "bottom",
      },
    },
  },
  annotations: {
    line1: {
      type: "line",
      yMin: 10,
      yMax: 10,
      borderColor: "rgba(75, 192, 192, 0.8)",
      borderWidth: 2,
    },
  },
};

// Custom story with different annotations and options
export const CustomAnnotations = Template.bind({});
CustomAnnotations.args = {
  height: 400,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Custom Line Chart",
      },
      legend: {
        display: false,
      },
    },
  },
  annotations: {
    line1: {
      type: "line",
      yMin: 15,
      yMax: 15,
      borderColor: "rgba(255, 99, 132, 0.8)",
      borderWidth: 2,
    },
  },
};
