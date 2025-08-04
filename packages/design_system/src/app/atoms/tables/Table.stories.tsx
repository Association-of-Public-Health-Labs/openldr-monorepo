import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { SimpleTable, type TableProps } from "./Table";

const meta: Meta<typeof SimpleTable> = {
  title: "DesignSystem/Atoms/Tables/SimpleTable",
  component: SimpleTable,
  tags: ["autodocs"],
  argTypes: {
    color: {
      description: "The color theme for the table's styles.",
      control: {
        type: "select",
        options: ["inherit", "primary", "secondary", "success", "error", "info", "warning"],
      },
    },
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
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SimpleTable** component renders a Material-UI table with customizable colors, rows, columns, and padding.

### Features
- Dynamically set color themes using the \`color\` prop.
- Supports customizable columns and rows.
- Optional dense mode for compact spacing.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<TableProps> = (args) => <SimpleTable {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  color: "primary",
  columns: ["Name", "Age", "Country", "Role"],
  rows: [
    { Name: "Alice", Age: 25, Country: "USA", Role: "Developer" },
    { Name: "Bob", Age: 30, Country: "UK", Role: "Designer" },
    { Name: "Charlie", Age: 35, Country: "Canada", Role: "Manager" },
  ],
  dense: false,
};

// Custom story with different data
export const CustomData = Template.bind({});
CustomData.args = {
  color: "secondary",
  columns: ["Product", "Quantity", "Price", "Category"],
  rows: [
    { Product: "Apple", Quantity: 50, Price: "$1.00", Category: "Fruit" },
    { Product: "Carrot", Quantity: 30, Price: "$0.50", Category: "Vegetable" },
    { Product: "Milk", Quantity: 20, Price: "$2.00", Category: "Dairy" },
  ],
  dense: true,
};
