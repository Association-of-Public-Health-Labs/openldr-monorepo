import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsIcon } from "./Settings";

const meta: Meta<typeof SettingsIcon> = {
  title: "DesignSystem/Atoms/Icons/Settings",
  component: SettingsIcon,
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
    }
  },
};

export default meta;
type Story = StoryObj<typeof SettingsIcon>;

/**
 * A "live" story that allows you to modify all props in the controls panel.
 */
export const Playground: Story = {
  args: {
    size: 24,
    color: "#000000",
  },
};

/**
 * An example story showing the outline style.
 */
export const Outline: Story = {
  args: {
    size: 24,
    color: "#0A84FF",
  },
};

/**
 * An example story showing the two-tone style.
 */
export const TwoTone: Story = {
  args: {
    size: 24,
    color: "#FF0000",
  },
};
