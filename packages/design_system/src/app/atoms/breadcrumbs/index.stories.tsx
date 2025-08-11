
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {Breadcrumb, BreadcrumbProps} from "./index";

const meta: Meta<typeof Breadcrumb> = {
  title: "DesignSystem/Atoms/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  argTypes: {
    links: {
      control: { type: "object" },
      description: "Links to display in the breadcrumb",
      defaultValue: [{ label: "Home", href: "/" }, { label: "Core", href: "/material-ui/getting-started/installation/" }, { label: "Breadcrumb", href: "/material-ui/getting-started/installation/breadcrumb/" }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  // `args` define the initial values for controls
  args: {
    links: [{ label: "Mocambique", href: "/" }, { label: "Niassa", href: "/" }, { label: "Lichinga", href: "/" }],
  },
};
