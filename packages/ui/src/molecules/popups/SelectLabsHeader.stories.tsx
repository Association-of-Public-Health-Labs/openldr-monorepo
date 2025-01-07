import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SelectLabsHeader, Props, LabsStateProps } from "./SelectLabsHeader";

const meta: Meta<typeof SelectLabsHeader> = {
  title: "DesignSystem/Molecules/Popups/SelectLabsHeader",
  component: SelectLabsHeader,
  argTypes: {
    handleChangeFacility: { action: "changed" },
    handleClosePopup: { action: "popup-closed" },
    labType: {
      control: { type: "select" },
      options: [undefined, "conventional", "poc"],
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SelectLabsHeader** component provides a header for selecting laboratory types, with options for "All," "Conventional," and "POC."
        `,
      },
    },
  },
};

export default meta;

// Template Function
const Template: StoryFn<Props> = (args) => {
  const [labsState, setLabsState] = useState<LabsStateProps>({
    all: false,
    conventional: true,
    poc: false,
  });

  const handleChangeFacility = (newState: LabsStateProps) => {
    setLabsState(newState);
    args.handleChangeFacility?.(newState);
  };

  return (
    <SelectLabsHeader
      {...args}
      labsStates={labsState}
      handleChangeFacility={handleChangeFacility}
    />
  );
};

// Default Story
export const Default = Template.bind({});
Default.args = {};

// With Predefined Lab Type
export const WithLabType = Template.bind({});
WithLabType.args = {
  labType: "conventional",
};

// Custom Container Props
export const CustomContainer = Template.bind({});
CustomContainer.args = {
  containerProps: {
    sx: {
      backgroundColor: "#f5f5f5",
      padding: 2,
    },
  },
};
