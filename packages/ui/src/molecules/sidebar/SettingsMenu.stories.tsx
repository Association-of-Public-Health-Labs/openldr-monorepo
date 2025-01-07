import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SettingsMenu } from "./SettingsMenu";

const meta: Meta<typeof SettingsMenu> = {
  title: "DesignSystem/Molecules/Sidebar/SettingsMenu",
  component: SettingsMenu,
  parameters: {
    docs: {
      description: {
        component: `
The **SettingsMenu** component provides a simple popover menu with a button group for quick actions. It can be customized and expanded to include various settings or options.
        
### Features
- Uses Material-UI's Popover for an elegant dropdown menu.
- Includes an icon button to trigger the menu.
- Displays grouped buttons for quick actions within the popover.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn = () => <SettingsMenu />;

export const Default = Template.bind({});
Default.parameters = {
  docs: {
    description: {
      story: "The default `SettingsMenu` component with an icon button triggering a popover containing text and a button group.",
    },
  },
};
