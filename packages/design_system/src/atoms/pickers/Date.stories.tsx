import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { DatePicker } from "./Date";


const meta: Meta<typeof DatePicker> = {
  title: "DesignSystem/Atoms/Pickers/Date",
  component: DatePicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <div style={{ padding: "20px" }}>
          <Story />
        </div>
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
    size: {
      description: "Size of the date picker",
      control: { type: "select" },
      options: ["sm", "md", "lg"],
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

const Template: StoryFn<typeof DatePicker> = (args) => {
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

export const Default = Template.bind({});
Default.args = {
  label: "Select Date",
  format: "MM/dd/yyyy",
  size: "md",
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

export const Sizes = Template.bind({});
Sizes.args = {
  label: "Date Picker Sizes",
  format: "MM/dd/yyyy",
};
Sizes.decorators = [
  () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <DatePicker
        label="Small Size"
        value={new Date()}
        onChange={() => {}}
        size="sm"
      />
      <DatePicker
        label="Medium Size"
        value={new Date()}
        onChange={() => {}}
        size="md"
      />
      <DatePicker
        label="Large Size"
        value={new Date()}
        onChange={() => {}}
        size="lg"
      />
    </div>
  ),
];
