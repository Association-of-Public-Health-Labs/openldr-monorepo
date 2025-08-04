import type { Meta, StoryFn } from "@storybook/react-vite";
import { Select, type SelectProps } from "./Select";
import MenuItem from "@mui/material/MenuItem";

const meta: Meta<typeof Select> = { 
  title: "DesignSystem/Atoms/Inputs/Select",
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      description: "The default value for the select input.",
      control: { type: "text" },
    },
    placeholder: {
      description: "The placeholder text for the select input.",
      control: { type: "text" },
    },
    onChange: {
      description: "Callback function triggered when the selection changes.",
      action: "changed",
    },
    children: {
      description: "Menu items to be displayed in the select dropdown.",
      control: false, // Children are best passed as JSX, not controlled interactively.
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Select** component renders a Material-UI dropdown with customizable menu items and styles.

### Features
- Fully styled dropdown with Material-UI components.
- Configurable placeholder and default value.
- Callback for selection changes.
- Customizable menu item styles.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<SelectProps> = (args: SelectProps) => (
  <Select {...args}>
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
    <MenuItem value="option3">Option 3</MenuItem>
  </Select>
);

// Default story
export const Default = Template.bind({});
Default.args = {
  defaultValue: "option1",
  placeholder: "Select an option",
  onChange: (value: string) => console.log("Selected value:", value),
};

// Custom placeholder story
export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholder: "Choose an item",
  onChange: (value: string) => console.log("Selection changed:", value),
};
