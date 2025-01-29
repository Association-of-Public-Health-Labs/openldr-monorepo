import { Meta, StoryFn } from "@storybook/react";
import { MapIcon, Props } from "./MapIcon";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Molecules/Maps/MapIcon",
  component: MapIcon,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<Props> = (args) => <MapIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Default Icon",
  color: "#00B000",
  pulse: false,
};

export const PulsatingIcon = Template.bind({});
PulsatingIcon.args = {
  label: "Pulsating Icon",
  color: "#FF0000",
  pulse: true,
};

export const CloseableIcon = Template.bind({});
CloseableIcon.args = {
  label: "Closeable Icon",
  color: "#0000FF",
  close: true,
  onClick: () => alert("Icon clicked!"),
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  color: "#FFA500",
  pulse: true,
};
