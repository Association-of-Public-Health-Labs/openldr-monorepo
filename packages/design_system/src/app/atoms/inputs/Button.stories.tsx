import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Button } from "./Button";
import type { ButtonProps } from "@mui/material";

const meta: Meta<typeof Button> = {
  title: "DesignSystem/Atoms/Inputs/Button",
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: "The variant to use for the button.",
      control: {
        type: "select",
        options: ["text", "contained", "outlined"],
      },
    },
    color: {
      description: "The color of the button.",
      control: {
        type: "select",
        options: ["inherit", "primary", "secondary", "success", "error", "info", "warning"],
      },
    },
    size: {
      description: "The size of the button.",
      control: {
        type: "select",
        options: ["small", "medium", "large"],
      },
    },
    disabled: {
      description: "Whether the button is disabled.",
      control: { type: "boolean" },
    },
    children: {
      description: "The content of the button.",
      control: { type: "text" },
    },
    onClick: {
      description: "Function to execute on button click.",
      action: "clicked",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Button** component is a styled Material-UI button with customizable props such as \`variant\`, \`color\`, and \`size\`.

### Features
- Supports Material-UI's button variants and colors.
- Customizable styles via the \`sx\` prop.
- Includes a default border radius and no box shadow for a cleaner look.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<ButtonProps> = (args) => <Button {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  variant: "contained",
  color: "primary",
  size: "medium",
  children: "Click Me",
};

// Text Button story
export const TextButton = Template.bind({});
TextButton.args = {
  variant: "text",
  color: "secondary",
  size: "small",
  children: "Text Button",
};

// Outlined Button story
export const OutlinedButton = Template.bind({});
OutlinedButton.args = {
  variant: "outlined",
  color: "success",
  size: "large",
  children: "Outlined Button",
  disabled: false,
};
