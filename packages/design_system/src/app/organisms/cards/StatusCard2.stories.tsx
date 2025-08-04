import { Meta, StoryFn } from "@storybook/react-vite";
import { StatusCard2, type StatusCard2Props } from "./StatusCard2";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

export default {
  title: "DesignSystem/Organisms/Cards/StatusCard2",
  component: StatusCard2,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px", maxWidth: "400px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const Template: StoryFn<StatusCard2Props> = (args) => <StatusCard2 {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "Total Samples",
  value: 150,
  subtitle: "Updated just now",
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  title: "Health Centers",
  value: 42,
  subtitle: "Last updated yesterday",
  children: (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#E0E0E0",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Additional Content
    </div>
  ),
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
      <div style={{ padding: "16px", maxWidth: "400px" }}>
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
