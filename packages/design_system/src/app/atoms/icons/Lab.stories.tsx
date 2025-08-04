import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconlyLab } from "./Lab";

const meta: Meta<typeof IconlyLab> = {
  title: "DesignSystem/Atoms/Icons/Lab",
  component: IconlyLab,
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
        options: ["outline", "two-tone"],
      },
      description: "Icon style variant",
      defaultValue: "outline",
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconlyLab>;

/**
 * A playground story that lets you control all props.
 */
export const Playground: Story = {
  args: {
    size: 24,
    color: "#000000",
    style: "outline",
  },
};

/**
 * An example story showing the two-tone style.
 */
export const TwoTone: Story = {
  args: {
    size: 24,
    color: "#FF0000",
    style: "two-tone",
  },
};

/**
 * An example story showing the outline style.
 */
export const Outline: Story = {
  args: {
    size: 24,
    color: "#0A84FF",
    style: "outline",
  },
};
