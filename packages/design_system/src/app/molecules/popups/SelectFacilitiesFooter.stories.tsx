import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { SelectFacilitiesFooter, type SelectFacilitiesFooterProps } from "./SelectFacilitiesFooter";
import { Box } from "@mui/material";

const meta: Meta<typeof SelectFacilitiesFooter> = {
  title: "DesignSystem/Molecules/Popups/SelectFacilitiesFooter",
  component: SelectFacilitiesFooter,
  tags: ["autodocs"],
  argTypes: {
    handleSubmit: {
      description: "Callback function triggered when the button is clicked.",
      action: "button-clicked",
    },
    containerStyles: {
      description: "Custom styles for the footer container.",
      control: { type: "object" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SelectFacilitiesFooter** component is a footer section containing a button for submitting actions.

### Features:
- Customizable styles via \`containerStyles\`.
- Handles button click events via the \`handleSubmit\` callback.
- Simple and responsive layout.
        `,
      },
    },
  },
};

export default meta;

// Template for the SelectFacilitiesFooter component
const Template: StoryFn<SelectFacilitiesFooterProps> = (args: SelectFacilitiesFooterProps) => (
  <Box sx={{ width: "100%", padding: 3, backgroundColor: "#f9f9f9" }}>
    <SelectFacilitiesFooter {...args} />
  </Box>
);

// Default story
export const Default = Template.bind({});
Default.args = {
  handleSubmit: () => console.log("Button clicked!"),
};

// Customized container styles
export const CustomContainerStyles = Template.bind({});
CustomContainerStyles.args = {
  containerStyles: {
    sx: {
      backgroundColor: "lightblue",
      padding: "16px",
      borderRadius: "8px",
    },
  },
  handleSubmit: () => console.log("Button clicked with custom styles!"),
};

// Button action only
export const ButtonOnly = Template.bind({});
ButtonOnly.args = {
  handleSubmit: () => console.log("Button clicked!"),
};
