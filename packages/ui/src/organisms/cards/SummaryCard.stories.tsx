import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SummaryCard, Props } from "./SummaryCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { FiActivity, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default {
  title: "DesignSystem/Organisms/Cards/SummaryCard",
  component: SummaryCard,
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

const Template: StoryFn<Props> = (args) => <SummaryCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      title: "Registered",
      subtitle: "Total registered samples",
      value: "200",
      icon: <FiActivity />,
      color: "primary",
    },
    {
      title: "Tested",
      subtitle: "Total tested samples",
      value: "180",
      icon: <FiCheckCircle />,
      color: "success",
    },
    {
      title: "Rejected",
      subtitle: "Total rejected samples",
      value: "20",
      icon: <FiAlertCircle />,
      color: "error",
    },
  ],
  containerProps: { sx: { maxWidth: "900px", margin: "auto" } },
};

export const NoData = Template.bind({});
NoData.args = {
  items: [],
  containerProps: { sx: { maxWidth: "900px", margin: "auto" } },
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
  items: [
    {
      title: "Registered",
      subtitle: "Total registered samples",
      value: "200",
      icon: <FiActivity />,
      color: "primary",
    },
    {
      title: "Tested",
      subtitle: "Total tested samples",
      value: "180",
      icon: <FiCheckCircle />,
      color: "success",
    },
  ],
  containerProps: { sx: { maxWidth: "900px", margin: "auto" } },
};
