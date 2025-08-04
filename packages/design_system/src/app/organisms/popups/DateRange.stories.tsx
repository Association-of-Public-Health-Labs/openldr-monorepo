import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { DateRange, DateRangeProps } from "./DateRange";

export default {
  title: "DesignSystem/Organisms/Popups/DateRange",
  component: DateRange,
  tags: ["autodocs"],
} as Meta;

const Template: StoryFn<DateRangeProps> = (args) => <DateRange {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  initialDates: [
    "2024-01-01",
    "2024-12-31"
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
