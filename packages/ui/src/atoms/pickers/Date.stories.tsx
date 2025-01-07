import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { DatePicker } from "./Date";
import { DesktopDatePickerProps } from "@mui/x-date-pickers/DesktopDatePicker";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const meta: Meta<typeof DatePicker> = {
  title: "DesignSystem/Atoms/Pickers/Date",
  component: DatePicker,
  decorators: [
    (Story) => {
      const theme = createTheme(); // Use a valid theme object
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
      description: "Label for the date picker.",
      control: { type: "text" },
    },
    value: {
      description: "The selected date.",
      control: false, // State is handled internally in the story
    },
    onChange: {
      description: "Callback fired when the value changes.",
      action: "date-changed",
    },
    format: {
      description: "The date format to display.",
      control: { type: "text" },
    },
    views: {
      description: "The views available in the date picker.",
      control: { type: "check" },
      options: ["year", "month", "day"],
    },
    disabled: {
      description: "Disable the date picker.",
      control: { type: "boolean" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **DatePicker** component is a styled Material-UI date picker with customized styles and an intuitive interface.

### Features
- Fully styled for both light and dark themes.
- Customizable date format, label, and views.
- Error and disabled states for validation and accessibility.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<DesktopDatePickerProps<any, any>> = (args) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <DatePicker
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

// Default story
export const Default = Template.bind({});
Default.args = {
  label: "Select Date",
  format: "dd/MM/yyyy",
  views: ["year", "month", "day"],
};

// Disabled state story
export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled Date Picker",
  format: "dd/MM/yyyy",
  views: ["year", "month", "day"],
  disabled: true,
};

// Error state story
export const Error = Template.bind({});
Error.args = {
  label: "Invalid Date",
  format: "dd/MM/yyyy",
  views: ["year", "month", "day"],
  error: true,
  helperText: "Invalid date selected",
};

// Custom Format story
export const CustomFormat = Template.bind({});
CustomFormat.args = {
  label: "Custom Format",
  format: "MM/dd/yyyy",
  views: ["year", "month", "day"],
};
