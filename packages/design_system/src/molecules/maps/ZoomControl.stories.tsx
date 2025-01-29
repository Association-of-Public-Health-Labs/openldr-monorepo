import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ZoomControl, Props } from "./ZoomControl";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Molecules/Maps/ZoomControl",
  component: ZoomControl,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <ZoomControl {...args} />;

export const Default = Template.bind({});
Default.args = {
  handleIncreaseZoom: () => alert("Zoom In Clicked"),
  handleDecreaseZoom: () => alert("Zoom Out Clicked"),
};

export const HiddenControl = Template.bind({});
HiddenControl.args = {
  handleIncreaseZoom: () => alert("Zoom In Clicked"),
  handleDecreaseZoom: () => alert("Zoom Out Clicked"),
  hide: true,
};
