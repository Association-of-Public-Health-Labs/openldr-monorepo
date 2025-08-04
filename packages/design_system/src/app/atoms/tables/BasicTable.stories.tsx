import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { BasicTable, type BasicTableProps } from "./BasicTable";

const meta: Meta<typeof BasicTable> = {
  title: "DesignSystem/Atoms/Tables/BasicTable",
  component: BasicTable,
  tags: ["autodocs"],
  argTypes: {
    columns: {
      description: "Array of column names to display in the table header.",
      control: { type: "object" },
    },
    rows: {
      description: "Array of objects representing the data rows of the table.",
      control: { type: "object" },
    },
    dense: {
      description: "Whether the table should use dense padding.",
      control: { type: "boolean" },
    },
    highlightedRow: {
      description: "Index of the row to highlight.",
      control: { type: "number" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **BasicTable** component renders a customizable Material-UI table with optional row highlighting, dense padding, and sticky headers.

### Features
- Supports customizable columns and rows.
- Optional dense mode for compact spacing.
- Highlight a specific row dynamically using \`highlightedRow\`.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<BasicTableProps> = (args: BasicTableProps) => <BasicTable {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  columns: ["Province", "District", "Clinic", "Samples Registered", "Samples Tested"],
  rows: [
    {
      Province: "Province A",
      District: "District 1",
      Clinic: "Clinic X",
      "Samples Registered": 150,
      "Samples Tested": 140,
    },
    {
      Province: "Province B",
      District: "District 2",
      Clinic: "Clinic Y",
      "Samples Registered": 200,
      "Samples Tested": 180,
    },
    {
      Province: "Province C",
      District: "District 3",
      Clinic: "Clinic Z",
      "Samples Registered": 120,
      "Samples Tested": 100,
    },
  ],
  dense: false,
  highlightedRow: 1,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  columns: ["Item", "Quantity", "Price", "Category"],
  rows: [
    { Item: "Apple", Quantity: 50, Price: "$1.00", Category: "Fruits" },
    { Item: "Carrot", Quantity: 30, Price: "$0.50", Category: "Vegetables" },
    { Item: "Milk", Quantity: 20, Price: "$2.00", Category: "Dairy" },
  ],
  dense: true,
  highlightedRow: 2,
};
