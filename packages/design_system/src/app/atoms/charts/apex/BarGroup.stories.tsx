import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { BarGroup, type BarGroupProps } from "./BarGroup";

// Default export with metadata and documentation
const meta: Meta = {
  title: "DesignSystem/Atoms/Chart/Apex/BarGroup",
  component: BarGroup,
  parameters: {
    docs: {
      description: {
        component: `
The **BarGroup** component is a reusable grouped bar chart built with ApexCharts and Material-UI.

### Features:
- Displays grouped bar charts with customizable labels and series.
- Integrates seamlessly with Material-UI's theme for consistent styling.
- Supports click events to interact with chart elements.
- Configurable dimensions (\`width\`, \`height\`).
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    labels: {
      description: "An array of strings representing the categories displayed on the x-axis.",
    },
    series: {
      description: "An array of series objects, each containing a `name` and `data` array.",
    },
    yLabel: {
      description: "The label displayed on the y-axis.",
      control: "text",
    },
    width: {
      description: "The width of the chart.",
      control: "text",
    },
    height: {
      description: "The height of the chart.",
      control: "text",
    },
    id: {
      description: "A unique ID for the chart.",
      control: "text",
    },
    onClick: {
      description: "Callback triggered when a bar is clicked, returning the label of the clicked bar.",
      action: "clicked",
    },
  },
};

export default meta;

// Template for the story
const Template: StoryFn<BarGroupProps> = (args: BarGroupProps) => <BarGroup {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  labels: ["January", "February", "March", "April", "May"],
  series: [
    {
      name: "Sales",
      data: [30, 40, 45, 50, 49],
    },
    {
      name: "Revenue",
      data: [20, 30, 35, 40, 38],
    },
  ],
  yLabel: "Values",
  width: 600,
  height: 400,
  id: "example-bar-group",
};
Default.parameters = {
  docs: {
    description: {
      story: "This is the default usage of the **BarGroup** component, showcasing monthly sales and revenue.",
    },
  },
};

// Custom data story
export const CustomData = Template.bind({});
CustomData.args = {
  labels: ["Product A", "Product B", "Product C"],
  series: [
    {
      name: "2023",
      data: [100, 200, 150],
    },
    {
      name: "2024",
      data: [120, 250, 180],
    },
  ],
  yLabel: "Sales Performance",
  width: "100%",
  height: 500,
  id: "custom-bar-group",
};
CustomData.parameters = {
  docs: {
    description: {
      story: "This example demonstrates custom data for the **BarGroup** component, comparing sales performance of products.",
    },
  },
};


