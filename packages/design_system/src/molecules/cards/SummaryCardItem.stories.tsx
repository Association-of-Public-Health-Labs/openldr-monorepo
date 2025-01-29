import { Meta, StoryFn } from "@storybook/react";
import { SummaryCardItem, Props } from "./SummaryCardItem";
import { IoTrendingUp, IoTrendingDown } from "react-icons/io5";

const meta: Meta<typeof SummaryCardItem> = {
  title: "DesignSystem/Molecules/Cards/SummaryCardItem",
  component: SummaryCardItem,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "The title of the summary item.",
      control: { type: "text" },
    },
    subtitle: {
      description: "The subtitle of the summary item.",
      control: { type: "text" },
    },
    value: {
      description: "The value displayed in the summary item.",
      control: { type: "text" },
    },
    icon: {
      description: "The icon displayed in the summary item.",
      control: { type: "object" },
    },
    color: {
      description: "The color for the icon and value.",
      control: { type: "color" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SummaryCardItem** component is used to display a summary of key metrics or data. It features an icon, title, subtitle, and value with customizable colors and layout.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => <SummaryCardItem {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  title: "Total Revenue",
  subtitle: "$50,000",
  value: "+12%",
  icon: <IoTrendingUp size={24} />,
  color: "#4caf50",
};

// Negative Value story
export const NegativeValue = Template.bind({});
NegativeValue.args = {
  title: "Total Loss",
  subtitle: "$10,000",
  value: "-8%",
  icon: <IoTrendingDown size={24} />,
  color: "#f44336",
};

// Custom Colors story
export const CustomColors = Template.bind({});
CustomColors.args = {
  title: "New Users",
  subtitle: "1,200",
  value: "+25%",
  icon: <IoTrendingUp size={24} />,
  color: "#2196f3",
};

// Long Title story
export const LongTitle = Template.bind({});
LongTitle.args = {
  title: "Quarterly Performance Report",
  subtitle: "$75,000",
  value: "+15%",
  icon: <IoTrendingUp size={24} />,
  color: "#4caf50",
};
