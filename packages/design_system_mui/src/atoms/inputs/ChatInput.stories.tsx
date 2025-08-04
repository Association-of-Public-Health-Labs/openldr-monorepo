import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ChatInput } from "./ChatInput";

const meta: Meta<typeof ChatInput> = {
  title: "DesignSystem/Atoms/Inputs/ChatInput",
  component: ChatInput,
  tags: ['autodocs'],
  argTypes: {
    handleSubmit: {
      description: "The function to handle the submit event.",
      // control: { type: "function" },
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
const Template: StoryFn<any> = (args) => <ChatInput {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  handleSubmit: () => {},
};
