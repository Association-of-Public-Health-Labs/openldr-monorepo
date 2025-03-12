import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SelectFacilitiesHeader, Props } from "./SelectFacilitiesHeader";
import { action } from "@storybook/addon-actions";
import { Box } from "@mui/material";

const meta: Meta<typeof SelectFacilitiesHeader> = {
  title: "DesignSystem/Molecules/Popups/SelectFacilitiesHeader",
  component: SelectFacilitiesHeader,
  tags: ["autodocs"],
  argTypes: {
    handleChangeFacility: {
      description: "Callback fired when the facility type is changed.",
      action: "facility-changed",
    },
    handleClosePopup: {
      description: "Callback fired when the close button is clicked.",
      action: "popup-closed",
    },
    containerProps: {
      description: "Props for customizing the container styles.",
      control: { type: "object" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SelectFacilitiesHeader** component is a header section with radio buttons for selecting facility types and a close button.

### Features:
- Allows selection of three facility types: **Province**, **District**, and **Clinic**.
- Provides a callback function for handling facility type changes.
- Includes a close button to trigger a dismiss action.
- Supports custom container styles via \`containerProps\`.
        `,
      },
    },
  },
};

export default meta;

// Template for the SelectFacilitiesHeader component
const Template: StoryFn<Props> = (args) => (
  <Box sx={{ width: "100%", backgroundColor: "#f9f9f9" }}>
    <SelectFacilitiesHeader {...args} />
  </Box>
);

// Default story
export const Default = Template.bind({});
Default.args = {
  handleChangeFacility: (facilityType) => console.log(`Facility changed to: ${facilityType}`),
  handleClosePopup: () => console.log("Popup closed"),
  containerProps: {
    sx: {
      padding: "16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
  },
};

// Custom container styles
export const CustomContainerStyles = Template.bind({});
CustomContainerStyles.args = {
  handleChangeFacility: action("facility-changed"),
  handleClosePopup: action("popup-closed"),
  containerProps: {
    sx: {
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    },
  },
};

// Interaction example
export const Interactive = Template.bind({});
Interactive.args = {
  handleChangeFacility: (facilityType) => action(`Facility changed to: ${facilityType}`)(),
  handleClosePopup: action("popup-closed"),
};
