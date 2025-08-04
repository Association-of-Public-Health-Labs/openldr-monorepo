import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { TableCard, type TableCardProps } from "./TableCard";

export default {
  title: "DesignSystem/Organisms/Cards/TableCard",
  component: TableCard,
  tags: ["autodocs"],
} as Meta;

const columns = [
  { id: "id", label: "ID", numeric: false },
  { id: "name", label: "Name", numeric: false },
  { id: "status", label: "Status", numeric: false },
  { id: "labType", label: "Lab Type", numeric: false },
];

const rows = [
  { id: 1, name: "Sample A", status: "Pending", labType: "conventional" },
  { id: 2, name: "Sample B", status: "Completed", labType: "poc" },
  { id: 3, name: "Sample C", status: "Rejected", labType: "conventional" },
  { id: 4, name: "Sample D", status: "Processing", labType: "poc" },
];

const Template: StoryFn<TableCardProps> = (args) => <TableCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
};

export const WithEmptyRows = Template.bind({});
WithEmptyRows.args = {
  columns,
  rows: [],
};