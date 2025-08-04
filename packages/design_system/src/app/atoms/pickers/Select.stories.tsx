import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { SelectPicker, type SelectPickerProps, type SelectPickerOptionsProps } from "./SelectPicker";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

const meta: Meta<typeof SelectPicker> = {
  title: "DesignSystem/Atoms/Pickers/Select",
  component: SelectPicker,
  tags: ["autodocs"],
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
    // defaultValue: {
    //   description: "Default selected options.",
    //   control: { type: "object" },
    // },
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
    // size: {
    //   description: "Size of the select input",
    //   control: { type: "select" },
    //   options: ["sm", "md", "lg"],
    // },
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
const Template: StoryFn<SelectPickerProps> = (args) => {
  const theme = useTheme();
  const [selectedValues, setSelectedValues] = useState<SelectPickerOptionsProps[] | undefined>(
    // args.defaultValue
    undefined
  );

  const handleChange = (newValue: any) => {
    setSelectedValues(newValue);
    args.onChange?.(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <SelectPicker
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
    { value: "option4", label: "Option 4" },
    { value: "option5", label: "Option 5" },
    { value: "option6", label: "Option 6" },
    { value: "option7", label: "Option 7" },
    { value: "option8", label: "Option 8" },
    { value: "option9", label: "Option 9" },
    { value: "option10", label: "Option 10" },
    { value: "option11", label: "Option 11" },
    { value: "option12", label: "Option 12" },
    { value: "option13", label: "Option 13" },
    { value: "option14", label: "Option 14" },
    { value: "option15", label: "Option 15" },
    { value: "option16", label: "Option 16" },
  ],
  placeholder: "Select options",
  isMulti: true,
  closeMenuOnSelect: false,
  size: "md",
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

// Add a new story to showcase different sizes
export const DifferentSizes = Template.bind({});
DifferentSizes.args = {
  options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ],
  placeholder: "Select an option",
  isMulti: false,
  closeMenuOnSelect: true,
  size: "md", // Default size
};
