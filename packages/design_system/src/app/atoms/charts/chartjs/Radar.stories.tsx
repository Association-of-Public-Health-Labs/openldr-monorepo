import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { ChartjsRadar, type ChartjsRadarProps } from "./Radar";

// Metadata for the component
const meta: Meta<typeof ChartjsRadar> = {
  title: "DesignSystem/Atoms/Chart/Chartjs/Radar",
  component: ChartjsRadar,
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
The **Radar** component renders a responsive radar chart using \`react-chartjs-2\` and \`chart.js\`, integrating seamlessly with Material-UI themes.

### Features
- Displays radar chart for visualizing multiple datasets across different categories.
- Material-UI themed fonts and colors for consistent styling.
- Responsive design with customizable layout and legend position.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<ChartjsRadarProps> = (args: ChartjsRadarProps) => <ChartjsRadar {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  height: 400,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Default Radar Chart",
      },
      legend: {
        position: "bottom",
      },
    },
    scales: {
      r: {
        ticks: {
          stepSize: 100,
        },
      },
    },
  },
};

// Custom story with modified options
export const CustomOptions = Template.bind({});
CustomOptions.args = {
  height: 500,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Custom Radar Chart",
      },
      legend: {
        position: "top",
      },
      datalabels: {
        color: "black",
        font: {
          size: 12,
        },
      },
    },
    scales: {
      r: {
        ticks: {
          stepSize: 50,
          color: "black",
        },
      },
    },
  },
};
