import { Meta, StoryFn } from "@storybook/react";
import { SearchTextField, Props as SearchTextFieldProps } from "./SearchTextField";

const meta: Meta<typeof SearchTextField> = {
  title: "DesignSystem/Atoms/Inputs/SearchTextInput",
  component: SearchTextField,
  tags: ['autodocs'],
  argTypes: {
    handleOnChange: {
      description: "Callback function to handle changes in the input value.",
      action: "changed",
    },
    handleOnClick: {
      description: "Callback function to handle the search button click.",
      action: "clicked",
    },
    fullWidth: {
      description: "Whether the input field should take up the full width of its container.",
      control: { type: "boolean" },
    },
    disabled: {
      description: "Whether the input field is disabled.",
      control: { type: "boolean" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SeachTextInput** component renders a Material-UI input field with a search button or icon, depending on the presence of input text.

### Features
- Integrated search button or icon with customizable styles.
- Callback functions for input change and search button click.
- Fully styled with Material-UI's theming system.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<SearchTextFieldProps> = (args) => <SearchTextField {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  fullWidth: true,
  handleOnChange: (value: string) => console.log("Input changed:", value),
  handleOnClick: (value: string) => console.log("Search clicked with value:", value),
};

// Disabled state story
export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  fullWidth: true,
  handleOnChange: () => {},
  handleOnClick: () => {},
};
