import { MultiComponents } from "./MultiComponents";
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Example/MultiComponents',
  component: MultiComponents,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add any props here if needed
  },
} satisfies Meta<typeof MultiComponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add any props here if needed
  },
};
