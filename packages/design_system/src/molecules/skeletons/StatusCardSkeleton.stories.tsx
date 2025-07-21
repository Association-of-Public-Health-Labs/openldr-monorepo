import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { StatusCardSkeleton } from "./StatusCardSkeleton";

const meta: Meta<typeof StatusCardSkeleton> = {
  title: "DesignSystem/Molecules/Skeletons/StatusCardSkeleton",
  component: StatusCardSkeleton,
  tags: ["autodocs"],
  argTypes: {
  },
};

export default meta;

// Template for the DateRange component
const Template: StoryFn<any> = (args) => <StatusCardSkeleton sx={{width: "850px", height: "200px"}} {...args} />;

export const Default = Template.bind({});