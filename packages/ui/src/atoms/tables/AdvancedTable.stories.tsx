import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { AdvancedTable, Props, Data, HeadCell } from "./AdvancedTable";

const columns: HeadCell[] = [
  { id: "province", label: "Province", numeric: false, align: "left" },
  { id: "district", label: "District", numeric: false, align: "left" },
  { id: "clinic", label: "Clinic", numeric: false, align: "left" },
  { id: "samplesRegistered", label: "Samples Registered", numeric: true, align: "right" },
  { id: "samplesTested", label: "Samples Tested", numeric: true, align: "right" },
  { id: "positivity", label: "Positivity (%)", numeric: true, align: "right" },
];

const rows: Data[] = [
  {
    province: "Province A",
    district: "District 1",
    clinic: "Clinic X",
    samplesRegistered: 150,
    samplesTested: 140,
    positivity: 20,
  },
  {
    province: "Province B",
    district: "District 2",
    clinic: "Clinic Y",
    samplesRegistered: 200,
    samplesTested: 180,
    positivity: 15,
  },
  {
    province: "Province C",
    district: "District 3",
    clinic: "Clinic Z",
    samplesRegistered: 120,
    samplesTested: 100,
    positivity: 25,
  },
];

const meta: Meta<typeof AdvancedTable> = {
  title: "DesignSystem/Atoms/Tables/AdvancedTable",
  component: AdvancedTable,
 argTypes: {
    columns: {
      description: "The column definitions for the table.",
      control: { type: "object" },
    },
    rows: {
      description: "The data rows to be displayed in the table.",
      control: { type: "object" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **AdvancedTable** component is a feature-rich table that supports sorting, pagination, and configurable column definitions. It integrates seamlessly with Material-UI for consistent theming.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => <AdvancedTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  columns,
  rows,
};
