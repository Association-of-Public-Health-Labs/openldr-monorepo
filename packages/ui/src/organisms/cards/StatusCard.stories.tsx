import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { StatusCard, Props } from "./StatusCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Cards/StatusCard",
  component: StatusCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <StatusCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "Total Samples",
  value: 120,
  subtitle: "Updated just now",
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  title: "Health Centers",
  value: 48,
  subtitle: "Last updated yesterday",
  children: <div style={{ width: "100%", height: "50px", background: "#E0E0E0", borderRadius: "8px" }} />,
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  title: "Pending Data",
  value: "—",
  subtitle: "No updates available",
};

export const DarkMode = Template.bind({});
DarkMode.decorators = [
  (Story) => (
    <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
      <CssBaseline />
      <div style={{ padding: "16px" }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
];
DarkMode.args = {
  title: "Lab Results",
  value: 300,
  subtitle: "Updated just now",
};
