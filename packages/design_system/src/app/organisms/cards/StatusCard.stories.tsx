import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { StatusCard, type StatusCardProps } from "./StatusCard";

export default {
  title: "DesignSystem/Organisms/Cards/StatusCard",
  component: StatusCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
} as Meta;

const Template: StoryFn<StatusCardProps> = (args) => <StatusCard {...args} />;

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

