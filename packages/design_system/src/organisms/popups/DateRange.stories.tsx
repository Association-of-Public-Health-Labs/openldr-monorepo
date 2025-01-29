import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { DateRange, Props } from "./DateRange";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import moment from "moment";

export default {
  title: "DesignSystem/Organisms/Popups/DateRange",
  component: DateRange,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px", height: "100vh", position: "relative" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <DateRange {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  initialDates: [
    moment().subtract(1, "year").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ],
  handleSubmit: (dates) => console.log("Selected Dates:", dates),
  onClose: () => console.log("DateRange Modal Closed"),
};

export const CustomDates = Template.bind({});
CustomDates.args = {
  open: true,
  initialDates: ["2024-01-01", "2024-12-31"],
  handleSubmit: (dates) => console.log("Custom Selected Dates:", dates),
  onClose: () => console.log("DateRange Modal Closed"),
};

export const WithoutInitialDates = Template.bind({});
WithoutInitialDates.args = {
  open: true,
  handleSubmit: (dates) => console.log("Selected Dates:", dates),
  onClose: () => console.log("DateRange Modal Closed"),
};

export const Closed = Template.bind({});
Closed.args = {
  open: false,
  handleSubmit: (dates) => console.log("Selected Dates:", dates),
  onClose: () => console.log("DateRange Modal Closed"),
};
