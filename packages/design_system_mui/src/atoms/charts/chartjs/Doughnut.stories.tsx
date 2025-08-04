import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ChartjsDoughnut, ChartjsDoughnutProps } from "./Doughnut";

// Metadata for the component
const meta: Meta<typeof ChartjsDoughnut> = {
  title: "DesignSystem/Atoms/Chart/Chartjs/Doughnut",
  component: ChartjsDoughnut,
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
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Doughnut** component renders a responsive doughnut chart using \`react-chartjs-2\` and \`chart.js\`, integrating seamlessly with Material-UI themes.

### Features
- Fully customizable doughnut chart with configurable data, options, and plugins.
- Material-UI themed fonts and colors.
- Responsive design with options for legends and datalabels.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<ChartjsDoughnutProps> = (args: ChartjsDoughnutProps) => <ChartjsDoughnut {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  height: 300,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Sample Doughnut Chart",
      },
      legend: {
        position: "bottom",
      },
    },
  },
};

// Custom story with different options
export const CustomOptions = Template.bind({});
CustomOptions.args = {
  height: 400,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Custom Doughnut Chart",
      },
      legend: {
        position: "right",
      },
      datalabels: {
        color: "black",
        font: {
          size: 14,
        },
      },
    },
  },
};
