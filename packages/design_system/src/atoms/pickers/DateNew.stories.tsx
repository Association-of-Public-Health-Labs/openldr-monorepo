import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { CustomDatePicker } from "./DateNew";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const meta: Meta<typeof CustomDatePicker> = {
  title: "DesignSystem/Atoms/Pickers/CustomDate",
  component: CustomDatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const theme = createTheme();
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ padding: "20px" }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    label: {
      description: "Label for the date picker",
      control: { type: "text" },
    },
    value: {
      description: "The selected date",
      control: false,
    },
    onChange: {
      description: "Callback fired when the value changes",
      action: "date-changed",
    },
    format: {
      description: "The date format to display",
      control: { type: "text" },
    },
    disabled: {
      description: "Disable the date picker",
      control: { type: "boolean" },
    },
    error: {
      description: "Show error state",
      control: { type: "boolean" },
    },
    helperText: {
      description: "Helper text to display below the input",
      control: { type: "text" },
    },
    minDate: {
      description: "Minimum selectable date",
      control: { type: "date" },
    },
    maxDate: {
      description: "Maximum selectable date",
      control: { type: "date" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **CustomDatePicker** component is a wrapper around Material-UI's DatePicker with additional features and styling.

### Features
- Customizable date format and label
- Min/Max date constraints
- Error and disabled states
- Helper text support
- Fully themed for both light and dark modes
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<typeof CustomDatePicker> = (args) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <CustomDatePicker
      {...args}
      value={selectedDate}
      onChange={(newDate) => {
        setSelectedDate(newDate);
        // @ts-ignore
        args?.onChange?.(newDate);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  label: "Select Date",
  format: "MM/dd/yyyy",
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled Date Picker",
  format: "MM/dd/yyyy",
  disabled: true,
};

export const WithError = Template.bind({});
WithError.args = {
  label: "Date with Error",
  format: "MM/dd/yyyy",
  error: true,
  helperText: "Please select a valid date",
};

export const WithDateConstraints = Template.bind({});
WithDateConstraints.args = {
  label: "Date with Constraints",
  format: "MM/dd/yyyy",
  minDate: new Date(),
  maxDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
  helperText: "Select a date within the next 3 months",
};

export const CustomFormat = Template.bind({});
CustomFormat.args = {
  label: "Custom Date Format",
  format: "dd MMMM yyyy",
};
