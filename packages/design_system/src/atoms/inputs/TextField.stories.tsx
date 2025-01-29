import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { TextField } from "./TextField";
import { TextFieldProps } from "@mui/material";

const meta: Meta<typeof TextField> = {
  title: "DesignSystem/Atoms/Inputs/TextField",
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: "The variant to use for the text field.",
      control: {
        type: "select",
        options: ["outlined", "filled", "standard"],
      },
    },
    label: {
      description: "The label for the text field.",
      control: { type: "text" },
    },
    placeholder: {
      description: "The placeholder text for the text field.",
      control: { type: "text" },
    },
    helperText: {
      description: "The helper text displayed below the text field.",
      control: { type: "text" },
    },
    error: {
      description: "If true, the text field is displayed in an error state.",
      control: { type: "boolean" },
    },
    disabled: {
      description: "If true, the text field is disabled.",
      control: { type: "boolean" },
    },
    fullWidth: {
      description: "If true, the text field takes up the full width of its container.",
      control: { type: "boolean" },
    },
    required: {
      description: "If true, the text field is marked as required.",
      control: { type: "boolean" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **TextField** component is a styled Material-UI text field with enhanced border radius and focus styles.

### Features
- Configurable variants: outlined, filled, and standard.
- Enhanced styling with rounded corners and focus border width.
- Supports placeholder, helper text, error, and disabled states.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<TextFieldProps> = (args) => <TextField {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  variant: "outlined",
  label: "Name",
  placeholder: "Enter your name",
  helperText: "This is a required field",
  error: false,
  disabled: false,
};

// Error state story
export const Error = Template.bind({});
Error.args = {
  variant: "outlined",
  label: "Email",
  placeholder: "Enter your email",
  helperText: "Invalid email address",
  error: true,
};

// Disabled state story
export const Disabled = Template.bind({});
Disabled.args = {
  variant: "outlined",
  label: "Disabled Field",
  placeholder: "Cannot enter text",
  disabled: true,
};

// Full-width story
export const FullWidth = Template.bind({});
FullWidth.args = {
  variant: "outlined",
  label: "Full Width",
  placeholder: "Enter a value",
  fullWidth: true,
};
