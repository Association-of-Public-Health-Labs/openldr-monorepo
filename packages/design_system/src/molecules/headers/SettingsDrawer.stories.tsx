import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SettingsDrawer, SettingsDrawerProps } from "./SettingsDrawer";

const meta: Meta<typeof SettingsDrawer> = {
  title: "DesignSystem/Molecules/Headers/SettingsDrawer",
  component: SettingsDrawer,
  tags: ["autodocs"],
  argTypes: {
    settings: {
      control: { type: "object" },
      description: "Settings object to control the component.",
      defaultValue: {
        mode: "light",
        sidebar: "column",
        lang: "pt",
        contrast: "negative",
        layout: "large",
      },
    },
    handleSetAppSettings: { action: "settings-updated" },
    
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SettingsDrawer** component allows users to change theme, sidebar orientation, language, contrast, and layout dynamically.`,
      },
    },
  },
};

export default meta;

const Template: StoryFn<SettingsDrawerProps> = (args) => (
  <SettingsDrawer {...args} />
);

export const Default = Template.bind({});
Default.args = {
  settings: {
    mode: "light",
    sidebar: "column",
    lang: "pt",
    contrast: "negative",
    layout: "large",
  },
};

export const DarkMode = Template.bind({});
DarkMode.args = {
  settings: {
    mode: "dark",
    sidebar: "row",
    lang: "en",
    contrast: "positive",
    layout: "small",
  },
};
