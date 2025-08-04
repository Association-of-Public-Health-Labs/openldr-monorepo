import { Meta, StoryFn } from "@storybook/react";
import { MapHeader, type MapHeaderProps } from "./MapHeader";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { IoPersonSharp, IoSettingsSharp, IoMapSharp } from "react-icons/io5";

export default {
  title: "DesignSystem/Molecules/Maps/MapHeader",
  component: MapHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ height: "100vh", width: "100%" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<MapHeaderProps> = (args) => <MapHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  options: [
    {
      label: "User",
      icon: <IoPersonSharp size={20} />,
      action: () => alert("User clicked"),
    },
    {
      label: "Settings",
      icon: <IoSettingsSharp size={20} />,
      action: () => alert("Settings clicked"),
    },
  ],
  additionalOptions: [
    {
      label: "Map",
      icon: <IoMapSharp size={20} />,
      action: () => alert("Map clicked"),
    },
    {
      label: "Logout",
      action: () => alert("Logout clicked"),
    },
  ],
};

export const WithoutAdditionalOptions = Template.bind({});
WithoutAdditionalOptions.args = {
  options: [
    {
      label: "User",
      icon: <IoPersonSharp size={20} />,
      action: () => alert("User clicked"),
    },
    {
      label: "Settings",
      icon: <IoSettingsSharp size={20} />,
      action: () => alert("Settings clicked"),
    },
  ],
};

export const WithoutMainOptions = Template.bind({});
WithoutMainOptions.args = {
  additionalOptions: [
    {
      label: "Map",
      icon: <IoMapSharp size={20} />,
      action: () => alert("Map clicked"),
    },
    {
      label: "Logout",
      action: () => alert("Logout clicked"),
    },
  ],
};
