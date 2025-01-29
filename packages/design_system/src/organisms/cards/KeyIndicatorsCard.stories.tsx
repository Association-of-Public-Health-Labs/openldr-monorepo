import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { KeyIndicatorsCard, Props } from "./KeyIndicatorsCard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Cards/KeyIndicatorsCard",
  component: KeyIndicatorsCard,
  tags: ["autodocs"],
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

const Template: StoryFn<Props> = (args) => <KeyIndicatorsCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  conventional: [
    { Year: 2023, Month: 1, MonthName: "January", Registados: 200, Testados: 150, Rejeitados: 10, Pendentes: 40 },
    { Year: 2023, Month: 2, MonthName: "February", Registados: 180, Testados: 120, Rejeitados: 15, Pendentes: 45 },
  ],
  poc: [
    { Year: 2023, Month: 1, MonthName: "January", Registados: 100, Testados: 90, Rejeitados: 5, Pendentes: 5 },
    { Year: 2023, Month: 2, MonthName: "February", Registados: 120, Testados: 110, Rejeitados: 8, Pendentes: 2 },
  ],
  columns: ["Year", "MonthName", "Registados", "Testados", "Rejeitados", "Pendentes"],
  containerProps: { sx: { maxWidth: "900px", margin: "auto" } },
};

export const NoData = Template.bind({});
NoData.args = {
  conventional: [],
  poc: [],
  columns: ["Year", "MonthName", "Registados", "Testados", "Rejeitados", "Pendentes"],
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
  conventional: [
    { Year: 2023, Month: 1, MonthName: "January", Registados: 200, Testados: 150, Rejeitados: 10, Pendentes: 40 },
  ],
  poc: [
    { Year: 2023, Month: 1, MonthName: "January", Registados: 100, Testados: 90, Rejeitados: 5, Pendentes: 5 },
  ],
  columns: ["Year", "MonthName", "Registados", "Testados", "Rejeitados", "Pendentes"],
  containerProps: { sx: { maxWidth: "900px", margin: "auto" } },
};
