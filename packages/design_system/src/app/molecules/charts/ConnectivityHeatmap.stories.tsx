import { Meta, StoryFn } from "@storybook/react-vite";
import { ConnectivityHeatmap, type ConnectivityHeatmapProps } from "./ConnectivityHeatmap";

const meta: Meta<typeof ConnectivityHeatmap> = {
  title: "DesignSystem/Molecules/Charts/ConnectivityHeatmap",
  component: ConnectivityHeatmap,
  tags: ["autodocs"],
};
export default meta;

const year = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 10, 16 + i));
  return { date: d.toISOString().slice(0, 10), uptime: Math.round(50 + 50 * Math.sin(i / 9) ** 2) };
});

const Template: StoryFn<ConnectivityHeatmapProps> = (args) => <ConnectivityHeatmap {...args} />;
export const TwelveMonths = Template.bind({});
TwelveMonths.args = { data: year };
export const Empty = Template.bind({});
Empty.args = { data: [] };
