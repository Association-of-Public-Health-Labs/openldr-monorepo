import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { SummaryCard, type SummaryCardProps } from "./SummaryCard";
import { FiActivity, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default {
  title: "DesignSystem/Organisms/Cards/SummaryCard",
  component: SummaryCard,
  tags: ["autodocs"],
} as Meta;

const Template: StoryFn<SummaryCardProps> = (args) => <SummaryCard {...args} />;

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
