import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { TableCard, Props } from "./TableCard";
import { HeadCell } from "../../atoms/tables/AdvancedTable";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Cards/TableCard",
  component: TableCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px", maxWidth: "800px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
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

const Template: StoryFn<Props> = (args) => <TableCard {...args} />;

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

export const DarkMode = Template.bind({});
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
      <CssBaseline />
      <div style={{ padding: "16px", maxWidth: "800px" }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
];
DarkMode.args = {
  columns,
  rows,
};
