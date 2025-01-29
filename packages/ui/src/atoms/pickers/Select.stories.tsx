import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Select, Props, optionsProps } from "./Select";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

const meta: Meta<typeof Select> = {
  title: "DesignSystem/Atoms/Pickers/Select",
  component: Select,
  decorators: [
    (Story) => {
      const theme = useTheme();
      return (
        <ThemeProvider theme={theme}>
          <div style={{ padding: "20px" }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  argTypes: {
    options: {
      description: "The available options for the select dropdown.",
      control: { type: "object" },
    },
    defaultValue: {
      description: "Default selected options.",
      control: { type: "object" },
    },
    isMulti: {
      description: "Enable multiple selection.",
      control: { type: "boolean" },
    },
    closeMenuOnSelect: {
      description: "Close the menu upon selection.",
      control: { type: "boolean" },
    },
    placeholder: {
      description: "Placeholder text displayed in the dropdown.",
      control: { type: "text" },
    },
    width: {
      description: "Width of the select input.",
      control: { type: "text" },
    },
    onChange: {
      description: "Callback fired when the selected value changes.",
      action: "value-changed",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
          The **Select** component is a styled, animated, and multi-select dropdown powered by \`react-select\`.
          ### Features
          - Fully customizable with support for themes.
          - Multi-select and single-select modes.
          - Animations using \`react-select/animated\`.
          - Styled for light and dark modes.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => {
  const theme = useTheme();
  const [selectedValues, setSelectedValues] = useState<optionsProps[] | undefined>(
    args.defaultValue
  );

  const handleChange = (newValue: any) => {
    setSelectedValues(newValue);
    args.onChange?.(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Select
        {...args}
        values={selectedValues}
        onChange={handleChange}
      />
    </ThemeProvider>
  );
};

// Default story
export const Default = Template.bind({});
Default.args = {
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  placeholder: "Select options",
  isMulti: true,
  closeMenuOnSelect: false,
};

// Single Select story
export const SingleSelect = Template.bind({});
SingleSelect.args = {
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  placeholder: "Select an option",
  isMulti: false,
  closeMenuOnSelect: true,
};

// Custom Placeholder story
export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  options: [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ],
  placeholder: "Choose a fruit...",
  isMulti: true,
  closeMenuOnSelect: false,
};

// Pre-Selected Options story
export const PreSelected = Template.bind({});
PreSelected.args = {
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  defaultValue: [{ value: "option1", label: "Option 1" }],
  placeholder: "Select options",
  isMulti: true,
  closeMenuOnSelect: false,
};
