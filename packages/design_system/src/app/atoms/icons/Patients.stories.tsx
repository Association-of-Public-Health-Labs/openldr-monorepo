// IconlyGrid.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconlyPatients } from "./Patients";

const meta: Meta<typeof IconlyPatients> = {
  title: "DesignSystem/Atoms/Icons/Patient",
  component: IconlyPatients,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "number" },
      description: "Size (width & height in px) of the icon",
      defaultValue: 24,
    },
    color: {
      control: { type: "color" },
      description: "Color of the icon (hex or named color)",
      defaultValue: "#000000",
    },
    style: {
      control: {
        type: "radio",
        options: ["two-tone", "outline"],
      },
      description: "Icon style variant",
      defaultValue: "outline",
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconlyPatients>;

export const Playground: Story = {
  // `args` define the initial values for controls
  args: {
    size: 24,
    color: "#000000",
    style: "outline",
  },
};
