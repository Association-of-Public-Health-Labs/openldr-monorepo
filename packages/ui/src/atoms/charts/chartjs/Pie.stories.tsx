import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Pie, Props } from "./Pie";

// Metadata for the component
const meta: Meta<typeof Pie> = {
  title: "DesignSystem/Atoms/Chart/Chartjs/Pie",
  component: Pie,
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
The **Pie** component renders a responsive pie chart using \`react-chartjs-2\` and \`chart.js\`, integrating seamlessly with Material-UI themes.

### Features
- Customizable pie chart with dynamic options and plugins.
- Material-UI themed fonts and colors for consistent styling.
- Responsive design with a configurable layout and legend position.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => <Pie {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  height: 300,
  options: {
    plugins: {
      title: {
        display: true,
        text: "Sample Pie Chart",
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
        text: "Custom Pie Chart",
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
